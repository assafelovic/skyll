"""
Skyll - Agent Skills Search Service

Main entry point for the FastAPI application.
Provides both REST API and MCP (Model Context Protocol) endpoints.
"""

import logging
import os
import sys
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.routes import router, set_service
from src.core.service import SkillSearchService
from src.mcp_server import create_mcp_server
import src.mcp_server as mcp_module



# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO").upper(),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# Configuration from environment
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
CACHE_TTL = int(os.getenv("CACHE_TTL", "3600"))
ENABLE_REGISTRY = os.getenv("ENABLE_REGISTRY", "true").lower() == "true"

# Global service instance
_service: SkillSearchService | None = None

# Create MCP server for mounting (will share service via module-level reference)
# Using stateless_http=True for better compatibility with load balancers and horizontal scaling
_mcp_server = create_mcp_server()

# Create MCP ASGI app with path="/mcp" - routes are included directly in the FastAPI app
# (not mounted) to avoid Starlette's trailing slash redirect which breaks MCP clients.
# stateless_http=True means each request creates a fresh context (no session affinity needed)
_mcp_app = _mcp_server.http_app(path="/mcp", stateless_http=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Initializes the skill search service on startup
    and cleans up on shutdown. The service is shared
    with both the REST API routes and MCP server.
    
    Also initializes the MCP session manager via nested lifespan.
    """
    global _service

    logger.info("Starting Skyll service...")

    # Initialize service with multi-source support
    _service = SkillSearchService(
        github_token=GITHUB_TOKEN,
        cache_ttl=CACHE_TTL,
        enable_registry=ENABLE_REGISTRY,
    )

    # Enter service context
    await _service.__aenter__()
    
    # Share service with REST API routes
    set_service(_service)
    
    # Share service with MCP server (set module-level _service)
    mcp_module._service = _service

    logger.info("Skyll service started successfully")
    logger.info(f"Cache TTL: {CACHE_TTL}s")
    logger.info(f"GitHub token: {'configured' if GITHUB_TOKEN else 'not configured'}")
    logger.info(f"Skill registry: {'enabled' if ENABLE_REGISTRY else 'disabled'}")
    logger.info("MCP endpoint available at /mcp")

    # Enter MCP app's lifespan (initializes session manager)
    async with _mcp_app.lifespan(app):
        yield

    # Cleanup
    logger.info("Shutting down Skyll service...")
    if _service:
        await _service.__aexit__(None, None, None)
    logger.info("Skyll service stopped")


# Create FastAPI application with combined lifespan
app = FastAPI(
    title="Skyll",
    description="""
## Agent Skills Search Service

Search and retrieve agent skills (SKILL.md files) from the [skills.sh](https://skills.sh) 
ecosystem with full markdown content.

### What are Agent Skills?

Agent skills are markdown files that teach AI coding agents how to complete specific tasks.
They follow the [Agent Skills specification](https://agentskills.io) and are supported by
27+ AI agents including Claude Code, Cursor, GitHub Copilot, and more.

### Key Features

- 🔍 **Search** - Find skills by natural language query
- 📄 **Full Content** - Get complete SKILL.md with parsed metadata
- 📊 **Ranked Results** - Sorted by popularity (install count)
- ⚡ **Cached** - Fast responses with intelligent caching
- 🔌 **MCP Server** - Native MCP support at `/mcp` endpoint

### Quick Start

**REST API:**
```bash
# Search for React skills
curl "https://api.skyll.app/search?q=react+performance&limit=5"

# Get a specific skill
curl "https://api.skyll.app/skills/vercel-labs/agent-skills/vercel-react-best-practices"
```

**MCP Client (Claude Desktop, Cursor):**
```json
{
  "mcpServers": {
    "skyll": {
      "url": "https://api.skyll.app/mcp"
    }
  }
}
```

### Response Format

Each skill includes:
- `id`, `title`, `description` - Basic metadata
- `content` - Full markdown instructions (frontmatter removed)
- `install_count`, `relevance_score` - Popularity metrics
- `refs` - Links to skills.sh and GitHub
""",
    version="0.1.0",
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    contact={
        "name": "Skyll",
        "url": "https://github.com/assafelovic/skyll",
    },
    lifespan=lifespan,
)

# Enable CORS for browser-based clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router)

# Include MCP routes directly in the FastAPI app (instead of mounting).
# Using app.mount("/mcp", _mcp_app) causes Starlette to issue a 307 redirect
# from /mcp to /mcp/ (trailing slash), which MCP clients don't follow for POST
# requests, causing connection timeouts. Including routes directly avoids this.
# MCP clients connect via https://api.skyll.app/mcp
app.routes.extend(_mcp_app.routes)


def run():
    """Run the server (for CLI entry point)."""
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    uvicorn.run(
        "src.main:app",
        host=host,
        port=port,
        reload=os.getenv("RELOAD", "false").lower() == "true",
    )


if __name__ == "__main__":
    run()
