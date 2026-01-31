# API Reference

Skill Garden provides two interfaces: a REST API and an MCP server.

Both return a **ranked list of skills** with relevance scores (0-100), giving agents and developers multiple options to choose from. This enables dynamic filtering, custom selection logic, or letting agents pick based on context.

## REST API

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/search?q={query}` | Search skills |
| POST | `/search` | Search skills (JSON body) |
| GET | `/skills/{source}/{skill_id}` | Get specific skill |
| GET | `/health` | Health check |
| GET | `/docs` | OpenAPI documentation |

### Search Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | required | Search query |
| `limit` | int | 10 | Maximum results to return |
| `include_references` | bool | false | Include reference files |

### Examples

```bash
# Basic search
curl "http://localhost:8000/search?q=react+performance&limit=5"

# Include reference files
curl "http://localhost:8000/search?q=react+native&limit=1&include_references=true"

# Get specific skill
curl "http://localhost:8000/skills/vercel-labs/agent-skills/react-best-practices"

# POST search with JSON body
curl -X POST "http://localhost:8000/search" \
  -H "Content-Type: application/json" \
  -d '{"query": "react performance", "limit": 5}'
```

## MCP Server

Built with the official [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk).

### Tools

| Tool | Description |
|------|-------------|
| `search_skills` | Search for skills by query |
| `get_skill` | Get a specific skill by source and ID |
| `get_cache_stats` | Get cache hit/miss statistics |

### Tool Parameters

**search_skills:**
- `query` (string, required): Search query
- `limit` (int, default 10): Maximum results
- `include_references` (bool, default false): Include reference files

**get_skill:**
- `source` (string, required): Repository in `owner/repo` format
- `skill_id` (string, required): Skill identifier
- `include_references` (bool, default false): Include reference files

### Example Tool Call

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

### Transport Options

**stdio** (default, for Claude Desktop and Cursor):
```bash
python -m src.mcp_server
```

**SSE** (for web clients):
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

### Field Descriptions

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
