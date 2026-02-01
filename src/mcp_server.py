"""
Skyll MCP Server

Exposes skill search as MCP tools for Claude and other MCP-compatible agents.
Built with the official MCP Python SDK (https://github.com/modelcontextprotocol/python-sdk).

Usage:
    # Run with stdio transport (for Claude Desktop, Cursor, etc.)
    python -m src.mcp_server
    
    # Run with SSE transport (for web clients)
    python -m src.mcp_server --transport sse --port 8080

    # In Claude Desktop config (~/.claude/claude_desktop_config.json)
    {
        "mcpServers": {
            "skyll": {
                "command": "python",
                "args": ["-m", "src.mcp_server"],
                "cwd": "/path/to/skyll"
            }
        }
    }
"""

import asyncio
import logging
import os
import sys
from contextlib import asynccontextmanager
from typing import Any

from dotenv import load_dotenv
from mcp.server.fastmcp import FastMCP, Context

from src.core.service import SkillSearchService

# Load environment variables from .env file
load_dotenv()

# Configure logging to stderr (stdout is used for MCP communication)
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stderr)],
)
logger = logging.getLogger(__name__)

# Configuration
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))

# Global service instance (initialized in lifespan)
_service: SkillSearchService | None = None


@asynccontextmanager
async def lifespan(mcp: FastMCP):
    """Initialize and cleanup the skill search service."""
    global _service
    
    logger.info("Initializing Skyll MCP Server...")
    
    _service = SkillSearchService(
        github_token=GITHUB_TOKEN,
        cache_ttl=CACHE_TTL,
    )
    await _service.__aenter__()
    
    logger.info("Skyll MCP Server ready")
    logger.info(f"GitHub token: {'configured' if GITHUB_TOKEN else 'not configured (60 req/hr limit)'}")
    
    yield {"service": _service}
    
    # Cleanup
    logger.info("Shutting down Skyll MCP Server...")
    if _service:
        await _service.__aexit__(None, None, None)
    logger.info("Skyll MCP Server stopped")


# Create the MCP server
mcp = FastMCP(
    name="skyll",
    instructions="""
Skyll provides access to the skills.sh ecosystem - a directory of agent skills 
(SKILL.md files) that teach AI agents how to complete specific tasks.

Use these tools to dynamically discover and retrieve skills at runtime, without 
requiring human developers to pre-install them with `npx skills add`.

**When to use:**
- When you need guidance on a specific technology (e.g., "react performance", "testing")
- When implementing features that might have established best practices
- When you want to follow proven patterns instead of guessing

**Tips:**
- Start with broad searches, then narrow down
- Skills with higher install counts are more battle-tested
- The `content` field contains the full instructions - inject it into your context
""",
    lifespan=lifespan,
)


@mcp.tool()
async def search_skills(
    query: str,
    limit: int = 5,
    include_references: bool = False,
    ctx: Context = None,
) -> dict[str, Any]:
    """
    Search for agent skills by natural language query.
    
    Returns a list of skills matching the query, sorted by popularity (install count).
    Each skill includes full markdown content ready for context injection.
    
    Args:
        query: Natural language search query (e.g., "react performance", "api testing", 
               "authentication setup"). Be descriptive for better results.
        limit: Maximum number of results to return (1-20, default: 5).
               Start with fewer results and increase if needed.
        include_references: If True, also fetch reference files from the skill's
                          references/ or resources/ directories. These contain
                          additional documentation and examples.
    
    Returns:
        A dict containing:
        - query: The search query that was executed
        - count: Number of skills found
        - skills: List of skill objects, each with:
            - id: Skill identifier
            - title: Human-readable name
            - description: What the skill does and when to use it
            - source: GitHub owner/repo
            - install_count: Number of installs (higher = more trusted)
            - content: Full markdown instructions (inject this into context)
            - refs: URLs to view the skill on skills.sh and GitHub
            - references: List of reference files (if include_references=True)
    
    Example queries:
        - "react performance optimization"
        - "testing best practices"
        - "nextjs authentication"
        - "database migrations"
    """
    if _service is None:
        return {"error": "Service not initialized"}
    
    if ctx:
        await ctx.info(f"Searching skills for: {query}")
    
    # Clamp limit
    limit = max(1, min(limit, 20))
    
    try:
        response = await _service.search(
            query=query,
            limit=limit,
            include_content=True,
            include_references=include_references,
        )
        
        if ctx:
            await ctx.info(f"Found {response.count} skills")
        
        return {
            "query": response.query,
            "count": response.count,
            "skills": [
                {
                    "id": s.id,
                    "title": s.title,
                    "description": s.description,
                    "source": s.source,
                    "install_count": s.install_count,
                    "content": s.content,
                    "refs": {
                        "skills_sh": s.refs.skills_sh,
                        "github": s.refs.github,
                    },
                    "references": [
                        {
                            "name": r.name,
                            "content": r.content,
                        }
                        for r in s.references
                    ] if s.references else [],
                    "fetch_error": s.fetch_error,
                }
                for s in response.skills
            ],
        }
    except Exception as e:
        logger.error(f"Search failed: {e}")
        return {"error": str(e)}


@mcp.tool()
async def get_skill(
    source: str,
    skill_id: str,
    include_references: bool = False,
    ctx: Context = None,
) -> dict[str, Any]:
    """
    Get a specific skill by its source repository and ID.
    
    Use this when you know exactly which skill you want, rather than searching.
    
    Args:
        source: GitHub owner/repo where the skill lives 
                (e.g., "vercel-labs/agent-skills", "anthropics/skills")
        skill_id: Skill identifier/slug 
                  (e.g., "vercel-react-best-practices", "frontend-design")
        include_references: If True, also fetch reference files from the skill's
                          references/ or resources/ directories.
    
    Returns:
        A skill object with:
        - id: Skill identifier
        - title: Human-readable name  
        - description: What the skill does
        - version: Semantic version if specified
        - allowed_tools: List of tools the skill can use
        - source: GitHub owner/repo
        - install_count: Number of installs
        - content: Full markdown instructions
        - refs: URLs to view the skill
        - references: List of reference files (if include_references=True)
        - metadata: Additional frontmatter fields
        
        Or {"error": "..."} if the skill is not found.
    
    Example:
        get_skill("vercel-labs/agent-skills", "vercel-react-best-practices")
    """
    if _service is None:
        return {"error": "Service not initialized"}
    
    if ctx:
        await ctx.info(f"Fetching skill: {source}/{skill_id}")
    
    try:
        skill = await _service.get_skill(
            source, skill_id, include_references=include_references
        )
        
        if skill is None:
            return {"error": f"Skill not found: {source}/{skill_id}"}
        
        return {
            "id": skill.id,
            "title": skill.title,
            "description": skill.description,
            "version": skill.version,
            "allowed_tools": skill.allowed_tools,
            "source": skill.source,
            "install_count": skill.install_count,
            "content": skill.content,
            "refs": {
                "skills_sh": skill.refs.skills_sh,
                "github": skill.refs.github,
                "raw": skill.refs.raw,
            },
            "references": [
                {
                    "name": r.name,
                    "path": r.path,
                    "content": r.content,
                    "raw_url": r.raw_url,
                }
                for r in skill.references
            ] if skill.references else [],
            "metadata": skill.metadata,
        }
    except Exception as e:
        logger.error(f"Get skill failed: {e}")
        return {"error": str(e)}


@mcp.tool()
async def get_cache_stats(ctx: Context = None) -> dict[str, Any]:
    """
    Get cache statistics for debugging and monitoring.
    
    Returns cache hit/miss rates, size, and other metrics.
    Useful for understanding if skills are being cached properly.
    
    Returns:
        Cache statistics including:
        - size: Number of cached entries
        - hits: Successful cache retrievals
        - misses: Cache misses
        - hit_rate: Percentage of hits
    """
    if _service is None:
        return {"error": "Service not initialized"}
    
    try:
        return await _service.get_cache_stats()
    except Exception as e:
        logger.error(f"Get cache stats failed: {e}")
        return {"error": str(e)}


def main():
    """Run the MCP server."""
    import argparse
    
    parser = argparse.ArgumentParser(description="Skyll MCP Server")
    parser.add_argument(
        "--transport",
        choices=["stdio", "sse"],
        default="stdio",
        help="Transport to use (default: stdio for Claude Desktop)",
    )
    parser.add_argument(
        "--port",
        type=int,
        default=8080,
        help="Port for SSE transport (default: 8080)",
    )
    parser.add_argument(
        "--host",
        default="127.0.0.1",
        help="Host for SSE transport (default: 127.0.0.1)",
    )
    
    args = parser.parse_args()
    
    if args.transport == "stdio":
        logger.info("Starting MCP server with stdio transport...")
        mcp.run(transport="stdio")
    else:
        logger.info(f"Starting MCP server with SSE transport on {args.host}:{args.port}...")
        mcp.run(transport="sse", host=args.host, port=args.port)


if __name__ == "__main__":
    main()
