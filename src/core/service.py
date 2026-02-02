"""
Main skill search service orchestrating all components.

This is the core business logic layer that can be wrapped by
REST API (FastAPI) or MCP server interfaces.

Supports multiple skill sources (skills.sh, awesome lists, custom registries)
with automatic deduplication across sources.
"""

import asyncio
import logging

from src.cache import CacheBackend, InMemoryCache
from src.clients import GitHubClient
from src.core.models import Skill, SkillRefs, SkillReference, SearchResponse
from src.core.parser import ParsedSkill, SkillParser, ParseError
from src.ranking import Ranker, RelevanceRanker
from src.sources import SkillSource, SkillSearchResult, SkillsShSource, SkillRegistrySource

logger = logging.getLogger(__name__)


class SkillSearchService:
    """
    Main service for searching and retrieving agent skills.
    
    Orchestrates:
    - Multiple skill sources (skills.sh, awesome lists, etc.)
    - GitHub for content fetching
    - Caching for performance
    - Parsing for structured data
    - Ranking for relevance
    - Deduplication across sources
    
    Designed for dependency injection - all components are pluggable.
    
    Args:
        cache: Cache backend for skill content (default: InMemoryCache)
        ranker: Ranking strategy (default: InstallCountRanker)
        github_token: Optional GitHub token for higher rate limits
        cache_ttl: Cache time-to-live in seconds (default: 24 hours)
        enable_awesome_list: Enable the awesome-claude-skills source (default: True)
    
    Example:
        service = SkillSearchService()
        async with service:
            response = await service.search("react performance", limit=5)
            for skill in response.skills:
                print(f"{skill.title}: {skill.description}")
    """

    def __init__(
        self,
        cache: CacheBackend | None = None,
        ranker: Ranker | None = None,
        github_token: str | None = None,
        cache_ttl: int = 86400,  # 24 hours
        enable_registry: bool = True,
    ):
        self._cache = cache or InMemoryCache(default_ttl=cache_ttl)
        self._ranker = ranker or RelevanceRanker()
        self._github_token = github_token
        self._cache_ttl = cache_ttl
        self._parser = SkillParser()
        self._enable_registry = enable_registry

        # Sources and clients are created in context manager
        self._sources: list[SkillSource] = []
        self._github_client: GitHubClient | None = None

    async def __aenter__(self) -> "SkillSearchService":
        """Enter async context, initializing sources and clients."""
        # Initialize skill sources
        self._sources = [
            SkillsShSource(enabled=True),
        ]
        
        if self._enable_registry:
            self._sources.append(SkillRegistrySource(enabled=True))
        
        # Initialize GitHub client for content fetching
        self._github_client = GitHubClient(token=self._github_token)

        # Enter all contexts
        for source in self._sources:
            await source.__aenter__()
        await self._github_client.__aenter__()

        # Start cache cleanup if it supports it
        if hasattr(self._cache, "start"):
            await self._cache.start()
        
        # Log enabled sources
        enabled_sources = [s.name for s in self._sources if s.enabled]
        logger.info(f"Enabled skill sources: {', '.join(enabled_sources)}")

        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Exit async context, cleaning up sources and clients."""
        for source in self._sources:
            try:
                await source.__aexit__(exc_type, exc_val, exc_tb)
            except Exception as e:
                logger.warning(f"Error closing source {source.name}: {e}")
        
        if self._github_client:
            await self._github_client.__aexit__(exc_type, exc_val, exc_tb)
        if hasattr(self._cache, "stop"):
            await self._cache.stop()

    def _cache_key(self, source: str, skill_id: str) -> str:
        """Generate cache key for a skill."""
        return f"skill:{source}:{skill_id}"

    async def _fetch_and_cache_content(
        self,
        source: str,
        skill_id: str,
        include_references: bool = False,
    ) -> tuple[str | None, str | None, list[SkillReference], str | None]:
        """
        Fetch skill content from cache or GitHub.
        
        Returns: (content, raw_url, references, error)
        """
        cache_key = self._cache_key(source, skill_id)

        # Check cache first (content only, references fetched fresh if needed)
        cached = await self._cache.get(cache_key)
        if cached is not None and not include_references:
            logger.debug(f"Cache hit for {cache_key}")
            return cached.get("content"), cached.get("raw_url"), [], None

        # Fetch from GitHub
        result = await self._github_client.fetch_skill(
            source, skill_id, include_references=include_references
        )

        if result.success:
            # Cache successful fetch (content only)
            await self._cache.set(
                cache_key,
                {"content": result.content, "raw_url": result.raw_url},
                ttl=self._cache_ttl,
            )
            
            # Convert reference files to SkillReference models
            references = [
                SkillReference(
                    name=ref.name,
                    path=ref.path,
                    content=ref.content,
                    raw_url=ref.raw_url,
                )
                for ref in result.references
            ]
            
            return result.content, result.raw_url, references, None
        else:
            # Cache the failure briefly to avoid repeated requests
            await self._cache.set(
                cache_key,
                {"content": None, "raw_url": None, "error": result.error},
                ttl=300,  # 5 minute TTL for failures
            )
            return None, None, [], result.error

    def _build_skill(
        self,
        search_result: SkillSearchResult,
        parsed: ParsedSkill | None,
        raw_url: str | None,
        references: list[SkillReference],
        fetch_error: str | None,
        include_raw: bool = False,
    ) -> Skill:
        """Build a Skill model from search result and parsed content."""
        refs = SkillRefs(
            skills_sh=self._github_client.get_skills_sh_url(
                search_result.source, search_result.id
            ),
            github=self._github_client.get_github_url(
                search_result.source, search_result.id
            ),
            raw=raw_url,
        )

        # Use description from search result if parsed doesn't have one
        description = None
        if parsed and parsed.description:
            description = parsed.description
        elif search_result.description:
            description = search_result.description

        if parsed:
            return Skill(
                id=search_result.id,
                title=parsed.name or search_result.name,
                description=description,
                version=parsed.version,
                allowed_tools=parsed.allowed_tools,
                source=search_result.source,
                refs=refs,
                install_count=search_result.installs,
                relevance_score=float(search_result.installs),
                content=parsed.content,
                raw_content=parsed.raw if include_raw else None,
                metadata=parsed.metadata,
                references=references,
                fetch_error=None,
            )
        else:
            return Skill(
                id=search_result.id,
                title=search_result.name,
                description=description,
                source=search_result.source,
                refs=refs,
                install_count=search_result.installs,
                relevance_score=float(search_result.installs),
                content=None,
                references=references,
                fetch_error=fetch_error,
            )

    async def _process_search_result(
        self,
        result: SkillSearchResult,
        include_content: bool,
        include_raw: bool,
        include_references: bool = False,
    ) -> Skill:
        """Process a single search result, optionally fetching content and references."""
        if not include_content:
            return self._build_skill(result, None, None, [], None, include_raw)

        # Fetch content (and optionally references)
        content, raw_url, references, error = await self._fetch_and_cache_content(
            result.source, result.id, include_references=include_references
        )

        # Parse if we got content
        parsed = None
        if content:
            try:
                parsed = self._parser.parse(content)
            except ParseError as e:
                logger.warning(f"Failed to parse {result.id}: {e}")
                error = f"Parse error: {e}"

        return self._build_skill(result, parsed, raw_url, references, error, include_raw)

    async def _search_all_sources(self, query: str, limit: int) -> list[SkillSearchResult]:
        """
        Search all enabled sources and deduplicate results.
        
        Results from skills.sh take priority (they have install counts).
        """
        # Search all sources in parallel
        search_tasks = [
            source.search(query, limit=limit)
            for source in self._sources
            if source.enabled
        ]
        
        all_results = await asyncio.gather(*search_tasks, return_exceptions=True)
        
        # Deduplicate by unique_key, preferring skills.sh results
        seen_keys: dict[str, SkillSearchResult] = {}
        
        for results in all_results:
            if isinstance(results, Exception):
                logger.warning(f"Source search failed: {results}")
                continue
            
            for result in results:
                key = result.unique_key
                
                # If we haven't seen this skill, or if this is from skills.sh
                # (which has install counts), use this result
                if key not in seen_keys:
                    seen_keys[key] = result
                elif result.source_registry == "skills.sh":
                    # Prefer skills.sh because it has install counts
                    seen_keys[key] = result
        
        # Sort by install count (skills.sh results will have this)
        deduplicated = list(seen_keys.values())
        deduplicated.sort(key=lambda r: r.installs, reverse=True)
        
        logger.debug(f"Found {len(deduplicated)} unique skills from {len(self._sources)} sources")
        return deduplicated[:limit]

    async def search(
        self,
        query: str,
        limit: int = 10,
        include_content: bool = True,
        include_raw: bool = False,
        include_references: bool = False,
    ) -> SearchResponse:
        """
        Search for skills matching a query across all sources.
        
        Args:
            query: Search query (e.g., "react performance")
            limit: Maximum number of results (default: 10)
            include_content: Fetch full SKILL.md content (default: True)
            include_raw: Include raw content with frontmatter (default: False)
            include_references: Fetch reference files from references/ directory (default: False)
            
        Returns:
            SearchResponse with matching skills sorted by relevance
        """
        # Search all sources and deduplicate
        search_results = await self._search_all_sources(query, limit=limit)

        if not search_results:
            return SearchResponse(query=query, count=0, skills=[])

        # Process results in parallel
        tasks = [
            self._process_search_result(result, include_content, include_raw, include_references)
            for result in search_results
        ]
        skills = await asyncio.gather(*tasks)

        # Rank results with query relevance and reference availability
        ranked_skills = self._ranker.rank(
            list(skills),
            query=query,
            include_references=include_references,
        )

        return SearchResponse(
            query=query,
            count=len(ranked_skills),
            skills=ranked_skills,
        )

    async def get_skill(
        self,
        source: str,
        skill_id: str,
        include_raw: bool = False,
        include_references: bool = False,
    ) -> Skill | None:
        """
        Get a specific skill by source and ID.
        
        Args:
            source: GitHub owner/repo
            skill_id: Skill identifier
            include_raw: Include raw content with frontmatter
            include_references: Fetch reference files from references/ directory
            
        Returns:
            Skill if found, None otherwise
        """
        content, raw_url, references, error = await self._fetch_and_cache_content(
            source, skill_id, include_references=include_references
        )

        if not content:
            return None

        try:
            parsed = self._parser.parse(content)
        except ParseError as e:
            logger.warning(f"Failed to parse {skill_id}: {e}")
            return None

        # Create a minimal search result for building
        search_result = SkillSearchResult(
            id=skill_id,
            name=skill_id,
            source=source,
            source_registry="direct",
            installs=0,
        )

        return self._build_skill(search_result, parsed, raw_url, references, error, include_raw)

    async def get_cache_stats(self) -> dict:
        """Get cache statistics."""
        return await self._cache.stats()
    
    async def get_sources(self) -> list[dict]:
        """Get information about enabled sources."""
        return [
            {
                "name": source.name,
                "enabled": source.enabled,
            }
            for source in self._sources
        ]
