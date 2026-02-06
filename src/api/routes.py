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
    "/skill/{name:path}",
    response_model=Skill,
    responses={
        404: {"model": ErrorResponse, "description": "Skill not found"},
    },
    summary="Add/Get skill by name",
    description="""
Fetch the latest version of a skill by name. Similar to `npx skills add <name>`.

Supports multiple formats:
- Simple name: `/skill/react-best-practices` (searches and returns top match)
- Full path: `/skill/vercel-labs/agent-skills/vercel-react-best-practices`

This endpoint always fetches fresh content from GitHub, ensuring you have
the latest version of the skill.

**Example:**
```bash
# Get by simple name (searches for best match)
curl "https://api.skyll.app/skill/react-best-practices"

# Get by full path
curl "https://api.skyll.app/skill/anthropics/skills/frontend-design"
```
""",
)
async def add_skill(
    service: Annotated[SkillSearchService, Depends(get_service)],
    name: str,
    include_references: Annotated[
        bool,
        Query(description="Fetch reference files from references/ or resources/ directories"),
    ] = False,
) -> Skill:
    """
    Add/get a skill by name.
    
    Fetches the latest version of a skill, either by searching for a simple name
    or by direct path lookup.
    """
    if not name or not name.strip():
        raise HTTPException(status_code=400, detail="Skill name cannot be empty")
    
    name = name.strip()
    parts = name.split("/")
    
    try:
        if len(parts) >= 3:
            # Full path: owner/repo/skill_id
            source = f"{parts[0]}/{parts[1]}"
            skill_id = "/".join(parts[2:])
            
            skill = await service.get_skill(
                source, skill_id, include_references=include_references
            )
            
            if skill is None:
                # Try searching as fallback
                response = await service.search(
                    query=name,
                    limit=1,
                    include_content=True,
                    include_references=include_references,
                )
                if response.count == 0:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Skill not found: {name}",
                    )
                skill = response.skills[0]
        else:
            # Simple name: search for it
            response = await service.search(
                query=name,
                limit=1,
                include_content=True,
                include_references=include_references,
            )
            
            if response.count == 0:
                raise HTTPException(
                    status_code=404,
                    detail=f"No skill found matching: {name}",
                )
            
            skill = response.skills[0]
        
        return skill
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Add skill failed: {e}")
        raise HTTPException(
            status_code=502,
            detail=f"Failed to fetch skill: {e}",
        )


@router.get(
    "/",
    summary="API info",
    description="Get API information and available endpoints.",
)
async def root() -> dict:
    """Root endpoint with API information."""
    return {
        "name": "Skyll",
        "version": "0.1.0",
        "description": "Search and retrieve agent skills with full markdown content",
        "documentation": "/docs",
        "endpoints": {
            "search_get": "GET /search?q={query}&limit={limit}&include_content={bool}",
            "search_post": "POST /search",
            "add_skill": "GET /skill/{name}",
            "get_skill": "GET /skills/{source}/{skill_id}",
            "health": "GET /health",
            "mcp": "POST /mcp/",
        },
        "links": {
            "skills.sh": "https://skills.sh",
            "agent_skills_spec": "https://agentskills.io",
            "github": "https://github.com/assafelovic/skyll",
        },
    }
