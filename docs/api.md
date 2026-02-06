# API Reference

Skyll provides three interfaces: a **Python client**, a **REST API**, and an **MCP server**.

All interfaces return a **ranked list of skills** with relevance scores (0-100), giving agents and developers multiple options to choose from. This enables dynamic filtering, custom selection logic, or letting agents pick based on context.

## Python Client

The recommended way to use Skyll in Python agents. Uses the hosted API by default.

### Installation

```bash
pip install skyll
```

### Basic Usage

```python
from skyll import Skyll

async with Skyll() as client:
    # Search for skills
    skills = await client.search("react performance", limit=5)
    
    for skill in skills:
        print(f"{skill.title}: {skill.description}")
        print(skill.content)  # Full SKILL.md content
```

### Client Methods

| Method | Description |
|--------|-------------|
| `search(query, limit=10, include_content=True, include_references=False)` | Search for skills |
| `get(source, skill_id, include_references=False)` | Get a specific skill |
| `health()` | Check API health status |

### Examples

```python
from skyll import Skyll

async with Skyll() as client:
    # Basic search
    skills = await client.search("react performance", limit=5)
    
    # Get a specific skill
    skill = await client.get("anthropics/skills", "skill-creator")
    
    # Include reference files
    skills = await client.search("react native", include_references=True)
    for skill in skills:
        for ref in skill.references:
            print(f"Reference: {ref.name}")
    
    # Health check
    status = await client.health()
    print(f"API status: {status['status']}")
```

### Using a Self-Hosted Server

```python
async with Skyll(base_url="http://localhost:8000") as client:
    skills = await client.search("testing")
```

### One-liner Helper

```python
from skyll import search_skills

# Simple function for quick searches
skills = await search_skills("python testing", limit=5)
```

## REST API

The hosted API is available at `https://api.skyll.app`. For self-hosted, replace with your server URL.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q={query}` | Search skills |
| POST | `/search` | Search skills (JSON body) |
| GET | `/skill/{name}` | Get skill by name (latest version) |
| GET | `/skills/{source}/{skill_id}` | Get specific skill by source/ID |
| POST | `/mcp/` | MCP server endpoint |
| GET | `/health` | Health check |
| GET | `/docs` | OpenAPI documentation |

### Search Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | required | Search query |
| `limit` | int | 10 | Maximum results (1-50) |
| `include_content` | bool | true | Fetch full SKILL.md content |
| `include_references` | bool | false | Include reference files |

### Examples

```bash
# Basic search (hosted API)
curl "https://api.skyll.app/search?q=react+performance&limit=5"

# Include reference files
curl "https://api.skyll.app/search?q=react+native&limit=1&include_references=true"

# Get specific skill
curl "https://api.skyll.app/skills/anthropics/skills/skill-creator"

# POST search with JSON body
curl -X POST "https://api.skyll.app/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "react performance", "limit": 5}'

# Health check
curl "https://api.skyll.app/health"
```

### Add Skill by Name

The `/skill/{name}` endpoint fetches the latest version of a skill by name. Similar to `npx skills add` but for runtime context injection.

```bash
# Get by simple name (searches for best match)
curl "https://api.skyll.app/skill/react-best-practices"

# Get by full path (direct lookup)
curl "https://api.skyll.app/skill/vercel-labs/agent-skills/vercel-react-best-practices"
curl "https://api.skyll.app/skill/anthropics/skills/frontend-design"

# Include reference files
curl "https://api.skyll.app/skill/react-best-practices?include_references=true"
```

This endpoint always fetches fresh content from GitHub, ensuring you have the latest version.

### Self-Hosted Examples

```bash
# Start your own server
uvicorn src.main:app --port 8000

# Then use localhost
curl "http://localhost:8000/search?q=react+performance&limit=5"
curl "http://localhost:8000/skill/react-best-practices"
```

Interactive API docs: [api.skyll.app/docs](https://api.skyll.app/docs)

## MCP Server

Built with [FastMCP](https://github.com/jlowin/fastmcp) - a framework for building MCP servers.

### Hosted MCP (Recommended)

For Claude Desktop, Cursor, or other MCP clients, add to your configuration:

```json
{
  "mcpServers": {
    "skyll": {
      "url": "https://api.skyll.app/mcp"
    }
  }
}
```

No installation required - the hosted server is always up-to-date.

### Tools

| Tool | Description |
|------|-------------|
| `search_skills` | Search for skills by query |
| `add_skill` | Get a skill by name (like `npx skills add`) |
| `get_skill` | Get a specific skill by source and ID |
| `get_cache_stats` | Get cache hit/miss statistics |

### Tool Parameters

**search_skills:**
- `query` (string, required): Search query
- `limit` (int, default 5): Maximum results
- `include_references` (bool, default false): Include reference files

**add_skill:**
- `name` (string, required): Skill name or full path. Supports:
  - Simple name: `"react-best-practices"` (searches and returns top match)
  - Full path: `"vercel-labs/agent-skills/vercel-react-best-practices"`
- `include_references` (bool, default false): Include reference files

**get_skill:**
- `source` (string, required): Repository in `owner/repo` format
- `skill_id` (string, required): Skill identifier
- `include_references` (bool, default false): Include reference files

### Example Tool Calls

```json
{
  "name": "add_skill",
  "arguments": {
    "name": "react-best-practices"
  }
}
```

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

### Self-Hosted MCP

If you prefer to run your own MCP server:

```json
{
  "mcpServers": {
    "skyll": {
      "command": "/path/to/skyll/venv/bin/python",
      "args": ["-m", "src.mcp_server"],
      "cwd": "/path/to/skyll"
    }
  }
}
```

### Transport Options

**stdio** (default, for Claude Desktop and Cursor):
```bash
python -m src.mcp_server
```

**HTTP** (for web clients and hosted deployments):
```bash
python -m src.mcp_server --transport http --port 8080
```

**SSE** (legacy, for older web clients):
```bash
python -m src.mcp_server --transport sse --port 8080
```

## Response Format

```json
{
  "query": "react performance",
  "count": 1,
  "skills": [
    {
      "id": "react-best-practices",
      "title": "React Best Practices",
      "description": "Performance optimization for React and Next.js...",
      "version": "1.0.0",
      "allowed_tools": ["Bash", "Read", "Write"],
      "source": "vercel-labs/agent-skills",
      "refs": {
        "skills_sh": "https://skills.sh/...",
        "github": "https://github.com/...",
        "raw": "https://raw.githubusercontent.com/..."
      },
      "install_count": 1250,
      "relevance_score": 85.5,
      "content": "# React Best Practices\n\nFull markdown content...",
      "references": [
        {
          "name": "flatlist-optimization.md",
          "path": "references/flatlist-optimization.md",
          "content": "Full reference content...",
          "raw_url": "https://raw.githubusercontent.com/..."
        }
      ],
      "metadata": {}
    }
  ]
}
```

### Skill Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique skill identifier |
| `title` | string | Human-readable title |
| `description` | string | Skill description from YAML frontmatter |
| `version` | string | Skill version |
| `allowed_tools` | array | Tools the skill is allowed to use |
| `source` | string | GitHub repository (`owner/repo`) |
| `refs` | object | URLs for skills.sh, GitHub, and raw content |
| `install_count` | int | Number of installations from skills.sh |
| `relevance_score` | float | 0-100 relevance score (see [Ranking](./ranking.md)) |
| `content` | string | Full SKILL.md markdown content |
| `references` | array | Additional reference files (when requested) |
| `metadata` | object | Additional metadata from YAML frontmatter |
