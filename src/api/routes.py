"""
REST API routes for skill search.

Provides GET and POST endpoints for searching skills,
plus health check and cache stats endpoints.
"""

import logging
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from src.core.models import (
    ErrorResponse,
    HealthResponse,
    SearchRequest,
    SearchResponse,
    Skill,
)
from src.core.service import SkillSearchService

logger = logging.getLogger(__name__)

router = APIRouter()

# Global service instance - set by main.py on startup
_service: SkillSearchService | None = None


def get_service() -> SkillSearchService:
    """Dependency to get the skill search service."""
    if _service is None:
        raise HTTPException(
            status_code=503,
            detail="Service not initialized",
        )
    return _service


def set_service(service: SkillSearchService) -> None:
    """Set the global service instance."""
    global _service
    _service = service


@router.get(
    "/search",
    response_model=SearchResponse,
    responses={
        502: {"model": ErrorResponse, "description": "Upstream API error"},
    },
    summary="Search skills",
    description="""
Search for agent skills by query.

Returns skills matching the query, sorted by relevance (install count).
Each skill includes parsed metadata and optionally full markdown content.

**Example:**
```
GET /search?q=react+performance&limit=5
```
""",
)
async def search_get(
    service: Annotated[SkillSearchService, Depends(get_service)],
    q: Annotated[
        str,
        Query(
            min_length=1,
            max_length=200,
            description="Search query",
            examples=["react performance", "testing best practices"],
        ),
    ],
    limit: Annotated[
        int,
        Query(
            ge=1,
            le=50,
            description="Maximum number of results",
        ),
    ] = 10,
    include_content: Annotated[
        bool,
        Query(
            description="Fetch full SKILL.md content for each result",
        ),
    ] = True,
    include_raw: Annotated[
        bool,
        Query(
            description="Include raw SKILL.md with frontmatter",
        ),
    ] = False,
    include_references: Annotated[
        bool,
        Query(
            description="Fetch reference files from references/ or resources/ directories",
        ),
    ] = False,
) -> SearchResponse:
    """
    Search for skills matching a query (GET version).
    
    Query parameters are URL-encoded. For complex queries,
    use the POST endpoint instead.
    """
    try:
        return await service.search(
            query=q,
            limit=limit,
            include_content=include_content,
            include_raw=include_raw,
            include_references=include_references,
        )
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Search failed: {e}",
        )


@router.post(
    "/search",
    response_model=SearchResponse,
    responses={
        502: {"model": ErrorResponse, "description": "Upstream API error"},
    },
    summary="Search skills (POST)",
    description="""
Search for agent skills by query (POST version).

Accepts JSON body for more complex queries or when you prefer POST.

**Example:**
```json
{
  "query": "react performance optimization",
  "limit": 5,
  "include_content": true
}
```
""",
)
async def search_post(
    service: Annotated[SkillSearchService, Depends(get_service)],
    request: SearchRequest,
) -> SearchResponse:
    """
    Search for skills matching a query (POST version).
    
    Useful for complex queries or clients that prefer POST.
    """
    try:
        return await service.search(
            query=request.query,
            limit=request.limit,
            include_content=request.include_content,
            include_raw=request.include_raw,
            include_references=request.include_references,
        )
    except Exception as e:
        logger.error(f"Search failed: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Search failed: {e}",
        )


@router.get(
    "/skills/{source:path}/{skill_id}",
    response_model=Skill,
    responses={
        404: {"model": ErrorResponse, "description": "Skill not found"},
    },
    summary="Get a specific skill",
    description="""
Fetch a specific skill by source repository and skill ID.

**Example:**
```
GET /skills/vercel-labs/agent-skills/vercel-react-best-practices
```
""",
)
async def get_skill(
    service: Annotated[SkillSearchService, Depends(get_service)],
    source: str,
    skill_id: str,
    include_raw: Annotated[
        bool,
        Query(description="Include raw SKILL.md with frontmatter"),
    ] = False,
    include_references: Annotated[
        bool,
        Query(description="Fetch reference files from references/ or resources/ directories"),
    ] = False,
) -> Skill:
    """Get a specific skill by source and ID."""
    skill = await service.get_skill(
        source, skill_id, include_raw=include_raw, include_references=include_references
    )

    if skill is None:
        raise HTTPException(
            status_code=404,
            detail=f"Skill not found: {source}/{skill_id}",
        )

    return skill


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check service health and get cache statistics.",
)
async def health_check(
    service: Annotated[SkillSearchService, Depends(get_service)],
) -> HealthResponse:
    """Health check endpoint with cache stats."""
    cache_stats = await service.get_cache_stats()
    return HealthResponse(
        status="healthy",
        version="0.1.0",
        cache_stats=cache_stats,
    )


@router.get(
    "/",
    summary="API info",
    description="Get API information and available endpoints.",
)
async def root() -> dict:
    """Root endpoint with API information."""
    return {
        "name": "Skill Garden",
        "version": "0.1.0",
        "description": "Search and retrieve agent skills with full markdown content",
        "documentation": "/docs",
        "endpoints": {
            "search_get": "GET /search?q={query}&limit={limit}&include_content={bool}",
            "search_post": "POST /search",
            "get_skill": "GET /skills/{source}/{skill_id}",
            "health": "GET /health",
        },
        "links": {
            "skills.sh": "https://skills.sh",
            "agent_skills_spec": "https://agentskills.io",
            "github": "https://github.com/assafelovic/skill-garden",
        },
    }
