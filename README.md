<p align="center">
  <img src="web/public/logo.png" alt="Skyll" width="120" height="120">
</p>

<p align="center">
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.11+-7ed957?style=flat&labelColor=1a1a1a" alt="Python 3.11+"></a>
  <a href="https://fastapi.tiangolo.com"><img src="https://img.shields.io/badge/FastAPI-0.109+-87ceeb?style=flat&labelColor=1a1a1a" alt="FastAPI"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-ffb3d9?style=flat&labelColor=1a1a1a" alt="MCP"></a>
  <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache_2.0-fff06b?style=flat&labelColor=1a1a1a" alt="License: Apache-2.0"></a>
</p>

<p align="center">
  <a href="#skyll">Skyll</a> •
  <a href="#why-use-skyll">Why use Skyll?</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#mcp-server">MCP Server</a> •
  <a href="#use-cases">Use Cases</a> •
  <a href="#documentation">Documentation</a> •
  <a href="#contributing-skills">Contributing</a>
</p>

---

# Skyll

Skyll is a REST API and MCP server that lets any AI agent search for and retrieve agent skills at runtime. It aggregates skills from multiple sources, fetches the full SKILL.md content from GitHub, and returns structured JSON ready for context injection.

## Why use Skyll?

Agent skills (SKILL.md files) are a powerful way to extend what AI agents can do, but today they only work with a handful of tools like Claude Code and Cursor. Skills require manual installation before a session, which means developers need to know in advance which skills they will need.

Skyll democratizes access to skills. Any agent, framework, or tool can discover and retrieve skills on demand. No pre-installation. No human intervention. Agents explore, choose based on context, and use skills autonomously.

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
      "content": "# React Best Practices\n\n## Performance\n..."
    }
  ]
}
```

**Why options matter**: The ranked list surfaces popular and relevant skills, letting agents choose based on user requests, task context, or what's trending. It's about giving agents freedom to discover.

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
git clone https://github.com/assafelovic/skyll.git
cd skyll
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

### Demo UI

<img width="800" height="350" alt="Screenshot 2026-02-01 at 10 17 08" src="https://github.com/user-attachments/assets/7aed6627-b365-41d5-adf1-2bc4bdcdc8b9" />


Open `web/index.html` in your browser for an interactive demo. Search for skills, view results with scores, and explore skill content visually.

## MCP Server

For Claude Desktop, Cursor, or other MCP clients:

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

## Use Cases

**Web Research**: User asks "Find the latest news on AI agents" → Agent searches for `tavily-search` → Uses Tavily's LLM-optimized search API to fetch real-time web results.

**Deep Research**: User needs a comprehensive market analysis → Agent discovers `gpt-researcher` → Runs autonomous multi-step research with citations and detailed reports.

**Testing Workflows**: User says "Add tests for this feature" → Agent finds `test-driven-development` → Follows TDD workflow: write tests first, then implement.

**Building Integrations**: User wants to connect their app to external APIs → Agent retrieves `mcp-builder` → Creates Model Context Protocol servers following best practices.

## Documentation

| Doc | Description |
|-----|-------------|
| [API Reference](./docs/api.md) | REST endpoints, MCP tools, response format |
| [Ranking Algorithm](./docs/ranking.md) | How skills are scored and ranked |
| [Skill Sources](./docs/sources.md) | Available sources and adding new ones |
| [References](./docs/references.md) | Fetching additional skill documentation |
| [Architecture](./docs/architecture.md) | System design and extending Skyll |

## Contributing Skills

Add your skill to the community registry! Edit [`registry/SKILLS.md`](./registry/SKILLS.md):

```markdown
- your-skill-id | your-username/your-repo | path/to/skill | What your skill does
```

Then submit a PR. Requirements:
- Valid `SKILL.md` following the [Agent Skills Spec](https://agentskills.io)
- Keep descriptions under 80 characters

## What are Agent Skills?

Agent skills are markdown files (SKILL.md) that teach AI coding agents how to complete specific tasks. They follow the [Agent Skills specification](https://agentskills.io) and work with 27+ AI agents. Learn more at [skills.sh](https://skills.sh).

## License

Apache-2.0 License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built for autonomous agents • <a href="https://skyll.app">skyll.app</a>
</p>
