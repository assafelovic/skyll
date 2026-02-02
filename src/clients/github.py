"""
GitHub client for fetching raw SKILL.md content and references from repositories.

Uses the GitHub API to efficiently locate SKILL.md files and their
associated reference documents (in references/ or resources/ directories).
"""

import asyncio
import logging
from dataclasses import dataclass, field

import httpx

logger = logging.getLogger(__name__)


@dataclass
class ReferenceFile:
    """A reference file associated with a skill."""
    
    name: str  # Filename (e.g., "js-lists-flatlist.md")
    path: str  # Full path in repo
    content: str | None = None  # Content if fetched
    raw_url: str | None = None  # Raw GitHub URL


@dataclass
class FetchResult:
    """
    Result of a SKILL.md fetch attempt.
    
    Attributes:
        content: The raw SKILL.md content if successful, None otherwise
        raw_url: The URL that successfully returned content
        skill_dir: The directory containing the SKILL.md
        references: List of reference files found
        error: Error message if fetch failed
    """

    content: str | None
    raw_url: str | None = None
    skill_dir: str | None = None
    references: list[ReferenceFile] = field(default_factory=list)
    error: str | None = None

    @property
    def success(self) -> bool:
        """True if content was successfully fetched."""
        return self.content is not None


class GitHubError(Exception):
    """Base exception for GitHub fetch errors."""

    pass


class GitHubClient:
    """
    Async client for fetching raw SKILL.md content and references from GitHub.
    
    Uses the GitHub API to find SKILL.md files efficiently,
    then fetches the raw content and any associated reference files.
    
    Args:
        timeout: Request timeout in seconds (default: 10.0)
        token: Optional GitHub personal access token for higher rate limits
    
    Example:
        async with GitHubClient(token="ghp_xxx") as client:
            result = await client.fetch_skill(
                "vercel-labs/agent-skills", 
                "react-best-practices",
                include_references=True
            )
            if result.success:
                print(result.content)
                for ref in result.references:
                    print(f"  - {ref.name}: {len(ref.content)} chars")
    """

    API_BASE_URL = "https://api.github.com"
    RAW_BASE_URL = "https://raw.githubusercontent.com"
    
    # Common directory names for reference files
    REFERENCE_DIRS = ["references", "resources", "docs", "examples", "rules"]

    def __init__(
        self,
        timeout: float = 10.0,
        token: str | None = None,
    ):
        self._timeout = timeout
        self._token = token
        self._client: httpx.AsyncClient | None = None
        # Cache for repo info: {owner/repo: {"branch": str, "tree": list}}
        self._repo_cache: dict[str, dict] = {}

    async def __aenter__(self) -> "GitHubClient":
        """Enter async context, creating HTTP client."""
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "skyll/0.1.0",
        }
        if self._token:
            headers["Authorization"] = f"token {self._token}"

        self._client = httpx.AsyncClient(
            timeout=self._timeout,
            headers=headers,
        )
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb) -> None:
        """Exit async context, closing HTTP client."""
        if self._client:
            await self._client.aclose()
            self._client = None

    @property
    def client(self) -> httpx.AsyncClient:
        """Get the HTTP client, raising if not in context."""
        if self._client is None:
            raise RuntimeError(
                "GitHubClient must be used as async context manager: "
                "async with GitHubClient() as client: ..."
            )
        return self._client

    async def _get_default_branch(self, source: str) -> str | None:
        """Get the default branch for a repository."""
        url = f"{self.API_BASE_URL}/repos/{source}"
        
        try:
            response = await self.client.get(url)
            if response.status_code == 200:
                data = response.json()
                return data.get("default_branch", "main")
            logger.warning(f"Could not get repo info for {source}: {response.status_code}")
            return None
        except Exception as e:
            logger.warning(f"Error getting repo info for {source}: {e}")
            return None

    async def _get_repo_tree(self, source: str) -> dict | None:
        """
        Get the full file tree and default branch for a repository.
        
        Returns a dict with 'branch' and 'tree' (all files), or None if failed.
        Cached per repo.
        """
        if source in self._repo_cache:
            return self._repo_cache[source]

        # First get the default branch
        branch = await self._get_default_branch(source)
        if not branch:
            self._repo_cache[source] = None
            return None

        # Get the tree
        url = f"{self.API_BASE_URL}/repos/{source}/git/trees/{branch}?recursive=1"
        
        try:
            response = await self.client.get(url)
            
            if response.status_code != 200:
                logger.warning(f"GitHub tree API returned {response.status_code} for {source}")
                self._repo_cache[source] = None
                return None

            data = response.json()
            tree = data.get("tree", [])
            
            # Store all blob paths (not just SKILL.md)
            all_paths = {}
            skill_paths = {}
            for item in tree:
                if item.get("type") == "blob":
                    path = item.get("path", "")
                    all_paths[path] = item.get("sha", "")
                    if path.endswith("SKILL.md"):
                        skill_paths[path] = item.get("sha", "")
            
            result = {"branch": branch, "tree": all_paths, "skills": skill_paths}
            self._repo_cache[source] = result
            logger.debug(f"Found {len(skill_paths)} SKILL.md files in {source} (branch: {branch})")
            return result

        except httpx.TimeoutException:
            logger.warning(f"Timeout getting tree for {source}")
            self._repo_cache[source] = None
            return None
        except Exception as e:
            logger.warning(f"Error getting tree for {source}: {e}")
            self._repo_cache[source] = None
            return None

    def _find_skill_path(self, skill_paths: dict[str, str], skill_id: str) -> str | None:
        """
        Find the path to a specific skill's SKILL.md in the repo tree.
        
        Handles various naming conventions:
        - Direct match: skill_id matches folder name exactly
        - Prefix stripping: "vercel-react-skills" matches "react-skills" 
        - Suffix matching: matches if skill_id ends with folder name
        - Contains matching: folder ends with skill_id (e.g., "optimization-gptq" matches "gptq")
        """
        # Generate ID variants to try (original + without common prefixes)
        id_variants = [skill_id]
        
        # Common prefixes to strip (e.g., vercel-react-skills -> react-skills)
        prefixes_to_strip = ["vercel-", "anthropic-", "openai-", "claude-"]
        for prefix in prefixes_to_strip:
            if skill_id.startswith(prefix):
                id_variants.append(skill_id[len(prefix):])
        
        for variant_id in id_variants:
            # Direct match patterns (most common)
            priority_patterns = [
                f"skills/{variant_id}/SKILL.md",
                f".claude/skills/{variant_id}/SKILL.md",
                f".cursor/skills/{variant_id}/SKILL.md",
                f".github/skills/{variant_id}/SKILL.md",
                f".agent/skills/{variant_id}/SKILL.md",
                f".agents/skills/{variant_id}/SKILL.md",
                f"{variant_id}/SKILL.md",
            ]
            
            for pattern in priority_patterns:
                if pattern in skill_paths:
                    return pattern
        
        # Fuzzy match - find any path containing the skill_id as a directory
        for variant_id in id_variants:
            for path in skill_paths:
                parts = path.split("/")
                if variant_id in parts:
                    return path
        
        # Suffix match - skill_id ends with folder name (e.g., vercel-react-skills matches react-skills)
        for path in skill_paths:
            parts = path.split("/")
            for part in parts:
                if skill_id.endswith(part) and len(part) > 5:  # Avoid matching short names
                    return path
        
        # Contains match - folder name ends with skill_id (e.g., "optimization-gptq" matches "gptq")
        # This handles cases where skills.sh indexes skills by a short name that's 
        # part of the full folder name
        for variant_id in id_variants:
            if len(variant_id) >= 4:  # Avoid matching very short IDs
                for path in skill_paths:
                    # Get the skill folder name (parent of SKILL.md)
                    parts = path.split("/")
                    if len(parts) >= 2:
                        folder_name = parts[-2]  # e.g., "optimization-gptq"
                        if folder_name.endswith(f"-{variant_id}") or folder_name.endswith(f"_{variant_id}"):
                            return path
        
        # Last resort - if there's only one SKILL.md, use it
        if len(skill_paths) == 1:
            return list(skill_paths.keys())[0]
        
        return None

    def _find_reference_files(
        self,
        all_paths: dict[str, str],
        skill_dir: str,
    ) -> list[tuple[str, str]]:
        """
        Find reference/resource files associated with a skill.
        
        Looks for .md files in:
        1. Sibling files: {skill_dir}/*.md (excluding SKILL.md)
        2. Subdirectories: {skill_dir}/references/, resources/, docs/, examples/, rules/
        
        Returns list of (name, path) tuples.
        """
        reference_files = []
        seen_paths = set()
        
        # 1. Sibling .md files in the same directory as SKILL.md
        skill_dir_prefix = f"{skill_dir}/" if skill_dir else ""
        for path in all_paths:
            if path.startswith(skill_dir_prefix) and path.endswith(".md"):
                # Check if it's a direct sibling (not in a subdirectory)
                remaining = path[len(skill_dir_prefix):]
                if "/" not in remaining and remaining.upper() != "SKILL.MD":
                    name = remaining
                    if path not in seen_paths:
                        reference_files.append((name, path))
                        seen_paths.add(path)
        
        # 2. Files in reference subdirectories
        for ref_dir in self.REFERENCE_DIRS:
            prefix = f"{skill_dir}/{ref_dir}/"
            for path in all_paths:
                if path.startswith(prefix) and path.endswith(".md"):
                    if path not in seen_paths:
                        name = path.split("/")[-1]
                        reference_files.append((name, path))
                        seen_paths.add(path)
        
        return reference_files

    async def _fetch_raw_content(self, source: str, branch: str, path: str) -> str | None:
        """Fetch raw file content from GitHub."""
        url = f"{self.RAW_BASE_URL}/{source}/{branch}/{path}"
        
        try:
            response = await self.client.get(url)
            if response.status_code == 200:
                return response.text
            return None
        except Exception as e:
            logger.debug(f"Error fetching {url}: {e}")
            return None

    async def fetch_skill(
        self,
        source: str,
        skill_id: str,
        include_references: bool = False,
    ) -> FetchResult:
        """
        Fetch SKILL.md content and optionally reference files from a GitHub repository.
        
        Args:
            source: Repository in "owner/repo" format
            skill_id: Skill identifier (folder name)
            include_references: If True, also fetch reference files
            
        Returns:
            FetchResult with content, references, and metadata
        """
        # Get repo info (cached)
        repo_info = await self._get_repo_tree(source)
        
        if repo_info is None:
            return FetchResult(
                content=None,
                error=f"Could not access repository {source}",
            )
        
        branch = repo_info["branch"]
        all_paths = repo_info["tree"]
        skill_paths = repo_info["skills"]
        
        if not skill_paths:
            return FetchResult(
                content=None,
                error=f"No SKILL.md files found in {source}",
            )
        
        # Find the specific skill
        skill_path = self._find_skill_path(skill_paths, skill_id)
        
        if not skill_path:
            return FetchResult(
                content=None,
                error=f"Could not locate skill content in repository",
            )
        
        # Get the skill directory (parent of SKILL.md)
        skill_dir = "/".join(skill_path.split("/")[:-1])
        
        # Fetch the SKILL.md content
        content = await self._fetch_raw_content(source, branch, skill_path)
        
        if not content:
            return FetchResult(
                content=None,
                error=f"Failed to fetch content from {source}/{skill_path}",
            )
        
        raw_url = f"{self.RAW_BASE_URL}/{source}/{branch}/{skill_path}"
        logger.debug(f"Found skill at {raw_url}")
        
        # Find and optionally fetch references
        references = []
        if include_references:
            ref_files = self._find_reference_files(all_paths, skill_dir)
            
            if ref_files:
                logger.debug(f"Found {len(ref_files)} reference files for {skill_id}")
                
                # Fetch all reference files in parallel
                async def fetch_ref(name: str, path: str) -> ReferenceFile:
                    ref_content = await self._fetch_raw_content(source, branch, path)
                    ref_url = f"{self.RAW_BASE_URL}/{source}/{branch}/{path}"
                    return ReferenceFile(
                        name=name,
                        path=path,
                        content=ref_content,
                        raw_url=ref_url,
                    )
                
                references = await asyncio.gather(*[
                    fetch_ref(name, path) for name, path in ref_files
                ])
        
        return FetchResult(
            content=content,
            raw_url=raw_url,
            skill_dir=skill_dir,
            references=list(references),
        )

    def get_github_url(self, source: str, skill_id: str) -> str:
        """Get the GitHub web URL for a skill."""
        repo_info = self._repo_cache.get(source)
        branch = repo_info["branch"] if repo_info else "main"
        return f"https://github.com/{source}/tree/{branch}/skills/{skill_id}"

    def get_skills_sh_url(self, source: str, skill_id: str) -> str:
        """Get the skills.sh page URL for a skill."""
        return f"https://skills.sh/{source}/{skill_id}"
