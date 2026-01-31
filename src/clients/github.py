"""
GitHub client for fetching raw SKILL.md content from repositories.

Uses the GitHub API to efficiently locate SKILL.md files
instead of brute-forcing multiple path patterns.
"""

import logging
from dataclasses import dataclass

import httpx

logger = logging.getLogger(__name__)


@dataclass
class FetchResult:
    """
    Result of a SKILL.md fetch attempt.
    
    Attributes:
        content: The raw SKILL.md content if successful, None otherwise
        raw_url: The URL that successfully returned content
        error: Error message if fetch failed
    """

    content: str | None
    raw_url: str | None = None
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
    Async client for fetching raw SKILL.md content from GitHub.
    
    Uses the GitHub API to find SKILL.md files efficiently,
    then fetches the raw content.
    
    Args:
        timeout: Request timeout in seconds (default: 10.0)
        token: Optional GitHub personal access token for higher rate limits
    
    Example:
        async with GitHubClient(token="ghp_xxx") as client:
            result = await client.fetch_skill("vercel-labs/agent-skills", "react-best-practices")
            if result.success:
                print(result.content)
    """

    API_BASE_URL = "https://api.github.com"
    RAW_BASE_URL = "https://raw.githubusercontent.com"

    def __init__(
        self,
        timeout: float = 10.0,
        token: str | None = None,
    ):
        self._timeout = timeout
        self._token = token
        self._client: httpx.AsyncClient | None = None
        # Cache for repo info: {owner/repo: {"branch": str, "paths": dict}}
        self._repo_cache: dict[str, dict] = {}

    async def __aenter__(self) -> "GitHubClient":
        """Enter async context, creating HTTP client."""
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "skill-garden/0.1.0",
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
        Get the file tree and default branch for a repository.
        
        Returns a dict with 'branch' and 'paths', or None if failed.
        Cached per repo.
        """
        if source in self._repo_cache:
            return self._repo_cache[source]

        # First get the default branch
        branch = await self._get_default_branch(source)
        if not branch:
            # Cache the failure
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
            
            # Build path -> blob mapping for SKILL.md files only
            paths = {}
            for item in tree:
                if item.get("type") == "blob" and item.get("path", "").endswith("SKILL.md"):
                    paths[item["path"]] = item.get("sha", "")
            
            result = {"branch": branch, "paths": paths}
            self._repo_cache[source] = result
            logger.debug(f"Found {len(paths)} SKILL.md files in {source} (branch: {branch})")
            return result

        except httpx.TimeoutException:
            logger.warning(f"Timeout getting tree for {source}")
            self._repo_cache[source] = None
            return None
        except Exception as e:
            logger.warning(f"Error getting tree for {source}: {e}")
            self._repo_cache[source] = None
            return None

    def _find_skill_path(self, paths: dict[str, str], skill_id: str) -> str | None:
        """
        Find the path to a specific skill's SKILL.md in the repo tree.
        
        Looks for patterns like:
        - skills/{skill_id}/SKILL.md
        - .claude/skills/{skill_id}/SKILL.md
        - {skill_id}/SKILL.md
        - SKILL.md (if skill_id matches repo name)
        """
        # Direct match patterns (most common)
        priority_patterns = [
            f"skills/{skill_id}/SKILL.md",
            f".claude/skills/{skill_id}/SKILL.md",
            f".cursor/skills/{skill_id}/SKILL.md",
            f".github/skills/{skill_id}/SKILL.md",
            f".agent/skills/{skill_id}/SKILL.md",
            f".agents/skills/{skill_id}/SKILL.md",
            f"{skill_id}/SKILL.md",
        ]
        
        for pattern in priority_patterns:
            if pattern in paths:
                return pattern
        
        # Fuzzy match - find any path containing the skill_id as a directory
        for path in paths:
            parts = path.split("/")
            if skill_id in parts:
                return path
        
        # Last resort - if there's only one SKILL.md, use it
        if len(paths) == 1:
            return list(paths.keys())[0]
        
        return None

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
    ) -> FetchResult:
        """
        Fetch SKILL.md content from a GitHub repository.
        
        Uses the GitHub API to locate the file efficiently,
        then fetches the raw content.
        
        Args:
            source: Repository in "owner/repo" format
            skill_id: Skill identifier (folder name)
            
        Returns:
            FetchResult with content if found, error message otherwise
        """
        # Get repo info (cached)
        repo_info = await self._get_repo_tree(source)
        
        if repo_info is None:
            return FetchResult(
                content=None,
                error=f"Could not access repository {source}",
            )
        
        branch = repo_info["branch"]
        paths = repo_info["paths"]
        
        if not paths:
            return FetchResult(
                content=None,
                error=f"No SKILL.md files found in {source}",
            )
        
        # Find the specific skill
        skill_path = self._find_skill_path(paths, skill_id)
        
        if not skill_path:
            # List available skills for debugging
            available = [p.split("/")[-2] for p in paths.keys() if "/" in p]
            return FetchResult(
                content=None,
                error=f"Skill '{skill_id}' not found. Available: {available[:5]}",
            )
        
        # Fetch the content
        content = await self._fetch_raw_content(source, branch, skill_path)
        
        if content:
            raw_url = f"{self.RAW_BASE_URL}/{source}/{branch}/{skill_path}"
            logger.debug(f"Found skill at {raw_url}")
            return FetchResult(content=content, raw_url=raw_url)
        
        return FetchResult(
            content=None,
            error=f"Failed to fetch content from {source}/{skill_path}",
        )

    def get_github_url(self, source: str, skill_id: str) -> str:
        """Get the GitHub web URL for a skill."""
        # Use cached branch if available
        repo_info = self._repo_cache.get(source)
        branch = repo_info["branch"] if repo_info else "main"
        return f"https://github.com/{source}/tree/{branch}/skills/{skill_id}"

    def get_skills_sh_url(self, source: str, skill_id: str) -> str:
        """Get the skills.sh page URL for a skill."""
        return f"https://skills.sh/{source}/{skill_id}"
