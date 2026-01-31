# 🌱 Skill Garden

> Dynamic skill discovery for AI agents

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-00a393.svg)](https://fastapi.tiangolo.com)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## The Problem

Today, using agent skills requires **manual installation**:

```bash
# Human developer must know which skills exist
# Human developer must manually run this before the agent can use it
npx skills add vercel-labs/agent-skills@react-best-practices
```

This creates friction:
- 🤷 **Discovery gap** - Agents can't find skills they don't know exist
- ⏰ **Runtime limitation** - Skills must be pre-installed before a session
- 🔄 **Context mismatch** - You often don't know which skills you'll need until mid-conversation

## The Solution

Skill Garden gives agents **dynamic, runtime access** to skills from multiple sources:

```python
# Agent can now discover and use any skill on-demand
response = await skill_garden.search("react performance optimization")
# Returns full SKILL.md content ready for context injection
```

No pre-installation. No human intervention. The agent searches, retrieves, and uses skills autonomously.

## Features

- 🔍 **Multi-Source Search** - Query skills.sh, awesome lists, and more
- 📄 **Full Content** - Returns complete SKILL.md with parsed metadata
- 📎 **References** - Optionally fetch additional docs from `references/` directories
- 📊 **Ranked Results** - Sorted by popularity (install count)
- 🔄 **Deduplication** - Automatic deduplication across sources
- ⚡ **Cached** - Aggressive caching to respect GitHub rate limits
- 🔌 **Dual Interface** - REST API + MCP Server
- 🔧 **Extensible** - Easy to add new skill sources

## Quick Start

### Installation

```bash
git clone https://github.com/assafelovic/skill-garden.git
cd skill-garden
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Option 1: REST API

```bash
uvicorn src.main:app --port 8000
```

```bash
# Basic search
curl "http://localhost:8000/search?q=react+performance&limit=5"

# Include reference files (additional docs from references/ directories)
curl "http://localhost:8000/search?q=react+native&limit=1&include_references=true"
```

### Option 2: MCP Server

Built with the official [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk).

**For Claude Desktop** (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "skill-garden": {
      "command": "/path/to/skill-garden/venv/bin/python",
      "args": ["-m", "src.mcp_server"],
      "cwd": "/path/to/skill-garden",
      "env": {
        "GITHUB_TOKEN": "ghp_your_token_here"
      }
    }
  }
}
```

**For Cursor** (`.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "skill-garden": {
      "command": "/path/to/skill-garden/venv/bin/python",
      "args": ["-m", "src.mcp_server"],
      "cwd": "/path/to/skill-garden"
    }
  }
}
```

**Standalone with stdio** (default, for local agents):

```bash
python -m src.mcp_server
```

**Standalone with SSE** (for web clients):

```bash
python -m src.mcp_server --transport sse --port 8080
```

## API Reference

### REST Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q={query}` | Search skills |
| POST | `/search` | Search skills (JSON body) |
| GET | `/skills/{source}/{skill_id}` | Get specific skill |
| GET | `/health` | Health check |
| GET | `/docs` | OpenAPI documentation |

### MCP Tools

| Tool | Description |
|------|-------------|
| `search_skills` | Search for skills by query (params: `query`, `limit`, `include_references`) |
| `get_skill` | Get a specific skill by source and ID (params: `source`, `skill_id`, `include_references`) |
| `get_cache_stats` | Get cache hit/miss statistics for debugging |

**Example MCP tool call:**

```json
{
  "name": "search_skills",
  "arguments": {
    "query": "react performance optimization",
    "limit": 5,
    "include_references": true
  }
}
```

### Response Format

```json
{
  "query": "react performance",
  "count": 3,
  "skills": [
    {
      "id": "vercel-react-best-practices",
      "title": "vercel-react-best-practices",
      "description": "React and Next.js performance optimization...",
      "version": "1.0.0",
      "allowed_tools": ["Bash", "Read", "Write"],
      "source": "vercel-labs/agent-skills",
      "refs": {
        "skills_sh": "https://skills.sh/...",
        "github": "https://github.com/...",
        "raw": "https://raw.githubusercontent.com/..."
      },
      "install_count": 74200,
      "relevance_score": 74200.0,
      "content": "# React Best Practices\n\nFull markdown...",
      "references": [
        {
          "name": "js-lists-flatlist.md",
          "path": "skills/react-native-best-practices/references/js-lists-flatlist.md",
          "content": "# FlatList Best Practices\n\nFull markdown...",
          "raw_url": "https://raw.githubusercontent.com/..."
        }
      ],
      "metadata": {}
    }
  ]
}
```

## Skill References

Many skills include additional documentation in `references/` or `resources/` directories. These contain detailed guides, code examples, and best practices.

### Fetching References

**REST API:**
```bash
# Include references in search results
curl "http://localhost:8000/search?q=react+native&include_references=true"

# Fetch a specific skill with references
curl "http://localhost:8000/skills/owner/repo/skill-id?include_references=true"
```

**MCP:**
```json
{
  "name": "search_skills",
  "arguments": {
    "query": "react native",
    "limit": 3,
    "include_references": true
  }
}
```

### Reference Structure

Skills with references typically have this structure:

```
skill-folder/
├── SKILL.md              # Main skill instructions
└── references/
    ├── concept-1.md      # Additional documentation
    ├── concept-2.md
    └── examples.md
```

Reference files are returned in the `references` array:

```json
{
  "id": "react-native-best-practices",
  "content": "Main SKILL.md content...",
  "references": [
    {
      "name": "js-lists-flatlist.md",
      "path": "skills/react-native/references/js-lists-flatlist.md",
      "content": "Full reference content...",
      "raw_url": "https://raw.githubusercontent.com/..."
    }
  ]
}
```

## Skill Sources

Skill Garden aggregates skills from multiple sources, automatically deduplicating results:

| Source | Description | Status |
|--------|-------------|--------|
| **[skills.sh](https://skills.sh)** | Vercel's skill marketplace - the primary, canonical source with install counts | ✅ Enabled by default |
| **[awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)** | Community-curated list with 28k+ stars | ✅ Enabled by default |
| *Custom sources* | Add your own skill registries (see [Adding Sources](#adding-custom-sources)) | 🔧 Extensible |

### How Multi-Source Works

1. **Parallel search** - All enabled sources are queried simultaneously
2. **Deduplication** - Skills are deduplicated by `owner/repo/skill-id`
3. **Priority** - skills.sh results take priority (they have install counts)
4. **Content fetch** - GitHub API fetches actual SKILL.md content

### Disabling Sources

```bash
# Disable the awesome list source
ENABLE_AWESOME_LIST=false uvicorn src.main:app --port 8000
```

### Adding Custom Sources

To add a new skill source, implement the `SkillSource` protocol in `src/sources/`:

```python
from src.sources.base import SkillSource, SkillSearchResult

class MyCustomSource:
    REGISTRY_NAME = "my-source"
    
    async def search(self, query: str, limit: int = 10) -> list[SkillSearchResult]:
        # Your search logic here
        ...
```

Then register it in `src/core/service.py`. We welcome PRs for new sources!

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8000 |
| `GITHUB_TOKEN` | GitHub Personal Access Token (optional, but recommended) | None |
| `CACHE_TTL` | Cache TTL in seconds | 3600 |
| `LOG_LEVEL` | Logging level | INFO |
| `ENABLE_AWESOME_LIST` | Enable the awesome-claude-skills source | true |

### GitHub Token (Optional but Recommended)

Without a token you're limited to **60 requests/hour**; with a token you get **5,000 requests/hour**. Create one at [GitHub's Personal Access Token settings](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens) (no scopes required).

```bash
# Add to .env file (gitignored)
GITHUB_TOKEN=ghp_your_token_here
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Skill Garden                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌───────────────────┐    ┌──────────────┐ │
│  │   REST API   │───▶│ SkillSearchService │◀───│  MCP Server  │ │
│  │  (FastAPI)   │    │   (Core Engine)    │    │  (FastMCP)   │ │
│  │  Port 8000   │    │                    │    │  stdio/SSE   │ │
│  └──────────────┘    └─────────┬──────────┘    └──────────────┘ │
│                                │                                │
│                    ┌───────────┴───────────┐                   │
│                    ▼                       ▼                   │
│         ┌─────────────────┐    ┌─────────────────────┐         │
│         │  SkillsShClient │    │  GitHubContentFetcher│         │
│         │  (search API)   │    │  (raw content)       │         │
│         └─────────────────┘    └──────────┬──────────┘         │
│                                           │                    │
│                               ┌───────────┴───────────┐        │
│                               ▼                       ▼        │
│                    ┌─────────────────┐    ┌─────────────────┐  │
│                    │  CacheBackend   │    │  SkillParser    │  │
│                    │  (pluggable)    │    │  (YAML+MD)      │  │
│                    └─────────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

**MCP Server** uses the official [Model Context Protocol SDK](https://github.com/modelcontextprotocol/python-sdk):
- `stdio` transport for Claude Desktop, Cursor, and local agents
- `SSE` transport for web-based MCP clients
- Tools: `search_skills`, `get_skill`, `get_cache_stats`

## Use Cases

### 1. Agent Self-Discovery

```
User: "Help me optimize my React app"

Agent: [searches skill-garden for "react optimization"]
       [injects skill content into context]
       [provides guidance based on skill instructions]
```

### 2. Dynamic Skill Loading

```
User: "Set up authentication for my Next.js app"

Agent: [searches for "nextjs authentication"]
       [finds better-auth or similar skills]
       [follows skill instructions to implement]
```

### 3. Multi-Skill Workflows

```
User: "Build a full-stack feature with tests"

Agent: [searches "testing best practices"]
       [searches "api design"]
       [combines multiple skills for comprehensive solution]
```

## Extending

### Add Redis Cache

```python
from src.cache.base import CacheBackend

class RedisCache(CacheBackend):
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def get(self, key: str) -> Any | None:
        return await self.redis.get(key)
    # ... implement other methods
```

### Add Semantic Search

```python
from src.ranking.rankers import Ranker

class SemanticRanker(Ranker):
    def __init__(self):
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def rank(self, skills: list[Skill], query: str) -> list[Skill]:
        # Compute embeddings and cosine similarity
        pass
```

## What are Agent Skills?

Agent skills are markdown files (SKILL.md) that teach AI coding agents how to complete specific tasks. They follow the [Agent Skills specification](https://agentskills.io) and work with 27+ AI agents including Claude Code, Cursor, GitHub Copilot, and more.

Learn more at [skills.sh](https://skills.sh).

## Contributing

Contributions welcome! Please open an issue or PR.

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with 🌱 for autonomous agents
