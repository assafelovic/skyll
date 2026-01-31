"""
Skill Garden - Agent Skills Search Service

Main entry point for the FastAPI application.
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
ENABLE_AWESOME_LIST = os.getenv("ENABLE_AWESOME_LIST", "true").lower() == "true"

# Global service instance
_service: SkillSearchService | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    
    Initializes the skill search service on startup
    and cleans up on shutdown.
    """
    global _service

    logger.info("Starting Skill Garden service...")

    # Initialize service with multi-source support
    _service = SkillSearchService(
        github_token=GITHUB_TOKEN,
        cache_ttl=CACHE_TTL,
        enable_awesome_list=ENABLE_AWESOME_LIST,
    )

    # Enter service context
    await _service.__aenter__()
    set_service(_service)

    logger.info("Skill Garden service started successfully")
    logger.info(f"Cache TTL: {CACHE_TTL}s")
    logger.info(f"GitHub token: {'configured' if GITHUB_TOKEN else 'not configured'}")
    logger.info(f"Awesome list source: {'enabled' if ENABLE_AWESOME_LIST else 'disabled'}")

    yield

    # Cleanup
    logger.info("Shutting down Skill Garden service...")
    if _service:
        await _service.__aexit__(None, None, None)
    logger.info("Skill Garden service stopped")


# Create FastAPI application
app = FastAPI(
    title="Skill Garden",
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
- 🔌 **MCP Ready** - Designed for future MCP server integration

### Quick Start

```bash
# Search for React skills
curl "http://localhost:8000/search?q=react+performance&limit=5"

# Get a specific skill
curl "http://localhost:8000/skills/vercel-labs/agent-skills/vercel-react-best-practices"
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
        "name": "Skill Garden",
        "url": "https://github.com/assafelovic/skill-garden",
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
