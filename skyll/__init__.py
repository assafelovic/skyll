"""
Skyll - Skill discovery for AI agents.

A Python client for searching and retrieving agent skills from the Skyll API.

Example:
    from skyll import Skyll

    async with Skyll() as client:
        skills = await client.search("react performance")
        for skill in skills:
            print(f"{skill.title}: {skill.description}")

Or use the simple function:
    from skyll import search_skills

    skills = await search_skills("react performance")
"""

from skyll.client import Skyll
from skyll.models import Skill, SkillReference, SearchResponse

__version__ = "0.1.0"
__all__ = ["Skyll", "Skill", "SkillReference", "SearchResponse", "search_skills"]


async def search_skills(
    query: str,
    limit: int = 10,
    include_content: bool = True,
    include_references: bool = False,
    base_url: str = "https://api.skyll.app",
) -> list[Skill]:
    """
    Search for skills matching a query.
    
    This is a convenience function that creates a client, searches, and returns results.
    For multiple requests, use the Skyll client directly for better performance.
    
    Args:
        query: Search query (e.g., "react performance", "testing")
        limit: Maximum number of results (default: 10)
        include_content: Fetch full SKILL.md content (default: True)
        include_references: Fetch reference files (default: False)
        base_url: API base URL (default: https://api.skyll.app)
        
    Returns:
        List of matching Skill objects
        
    Example:
        skills = await search_skills("python testing")
        for skill in skills:
            print(skill.content)
    """
    async with Skyll(base_url=base_url) as client:
        return await client.search(
            query=query,
            limit=limit,
            include_content=include_content,
            include_references=include_references,
        )
