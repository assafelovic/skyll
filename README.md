# 🌱 Skill Garden

Skill Garden is a REST API and MCP server that lets any AI agent search for and retrieve agent skills at runtime. It aggregates skills from multiple sources, fetches the full SKILL.md content from GitHub, and returns structured JSON ready for context injection.

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-00a393.svg)](https://fastapi.tiangolo.com)
[![MCP](https://img.shields.io/badge/MCP-compatible-purple.svg)](https://modelcontextprotocol.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## The Problem

Agent skills (SKILL.md files) are a powerful way to extend what AI agents can do, but today they only work with a handful of tools like Claude Code and Cursor. Skills require manual installation before a session, which means developers need to know in advance which skills they will need. Skill Garden democratizes access to skills by providing a simple API that any agent, framework, or tool can use to discover and retrieve skills on demand.

## The Solution

Skill Garden returns structured JSON with the full skill content:

```json
{
  "query": "react performance",
  "count": 1,
  "skills": [
    {
      "id": "react-best-practices",
      "title": "React Best Practices",
      "source": "vercel/ai-skills",
      "relevance_score": 85.5,
      "install_count": 1250,
      "content": "# React Best Practices\n\n## Performance\n...",
      "references": []
    }
  ]
}
```

No pre-installation. No human intervention. Any agent can search, retrieve, and use skills autonomously.

## Features

- 🔍 **Multi-Source Search**: Query [skills.sh](https://skills.sh), community registry, and more
- 📄 **Full Content**: Returns complete SKILL.md with parsed metadata
- 📎 **References**: Optionally fetch additional docs from `references/` directories
- 📊 **Relevance Ranking**: Scored 0-100 based on content, query match, and popularity
- 🔄 **Deduplication**: Automatic deduplication across sources
- ⚡ **Cached**: Aggressive caching to respect GitHub rate limits
- 🔌 **Dual Interface**: REST API + MCP Server
- 🔧 **Extensible**: Easy to add new skill sources and ranking strategies

## Quick Start

```bash
# Clone and install
git clone https://github.com/assafelovic/skill-garden.git
cd skill-garden
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Optional: Add GitHub token for higher rate limits
echo "GITHUB_TOKEN=ghp_your_token" > .env

# Start the server
uvicorn src.main:app --port 8000
```

```bash
# Search for skills
curl "http://localhost:8000/search?q=react+performance&limit=5"
```

## MCP Server

For Claude Desktop, Cursor, or other MCP clients:

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

Or run standalone:

```bash
python -m src.mcp_server                          # stdio (default)
python -m src.mcp_server --transport sse --port 8080  # SSE
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub PAT for higher rate limits ([create one](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)) | None |
| `CACHE_TTL` | Cache TTL in seconds | 3600 |
| `ENABLE_REGISTRY` | Enable community registry | true |

## Contributing Skills

Add your skill to the community registry! Edit [`registry/SKILLS.md`](./registry/SKILLS.md):

```markdown
- your-skill-id | your-username/your-repo | path/to/skill | What your skill does
```

Then submit a PR. Requirements:
- Valid `SKILL.md` following the [Agent Skills Spec](https://agentskills.io)
- Keep descriptions under 80 characters

## Documentation

| Doc | Description |
|-----|-------------|
| [API Reference](./docs/api.md) | REST endpoints, MCP tools, response format |
| [Ranking Algorithm](./docs/ranking.md) | How skills are scored and ranked |
| [Skill Sources](./docs/sources.md) | Available sources and adding new ones |
| [References](./docs/references.md) | Fetching additional skill documentation |
| [Architecture](./docs/architecture.md) | System design and extending Skill Garden |

## Use Cases

**Agent Self-Discovery**: User asks "Help me optimize my React app" → Agent searches Skill Garden → Injects relevant skill into context → Provides expert guidance.

**Dynamic Skill Loading**: Mid-conversation, user needs authentication help → Agent discovers `better-auth` skill → Follows skill instructions to implement.

**Multi-Agent Workflows**: Orchestrator agent searches for testing + API design skills → Distributes to specialized agents → Each agent works with domain expertise.

## What are Agent Skills?

Agent skills are markdown files (SKILL.md) that teach AI coding agents how to complete specific tasks. They follow the [Agent Skills specification](https://agentskills.io) and work with 27+ AI agents. Learn more at [skills.sh](https://skills.sh).

## License

MIT License. See [LICENSE](LICENSE) for details.

---

Built with 🌱 for autonomous agents
