<p align="center">
  <img src="web/public/logo.png" alt="Skyll" width="120" height="120">
</p>

<p align="center">
  <a href="https://pypi.org/project/skyll/"><img src="https://img.shields.io/pypi/v/skyll?color=7ed957&labelColor=1a1a1a" alt="PyPI"></a>
  <a href="https://www.python.org/downloads/"><img src="https://img.shields.io/badge/python-3.10+-7ed957?style=flat&labelColor=1a1a1a" alt="Python 3.10+"></a>
  <a href="https://modelcontextprotocol.io"><img src="https://img.shields.io/badge/MCP-compatible-ffb3d9?style=flat&labelColor=1a1a1a" alt="MCP"></a>
  <a href="https://discord.gg/CxdMdfZS"><img src="https://img.shields.io/badge/Discord-join-5865F2?style=flat&labelColor=1a1a1a&logo=discord&logoColor=white" alt="Discord"></a>
  <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache_2.0-fff06b?style=flat&labelColor=1a1a1a" alt="License: Apache-2.0"></a>
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-reference">API Reference</a> •
  <a href="#self-hosted">Self-Hosted</a> •
  <a href="#mcp-server">MCP Server</a> •
  <a href="#documentation">Documentation</a>
</p>

---

# Skyll

**Skill discovery for AI agents.** Search and retrieve agent skills on demand with a simple Python client.

```bash
pip install skyll
```

```python
from skyll import Skyll

async with Skyll() as client:
    skills = await client.search("react performance")
    for skill in skills:
        print(f"{skill.title}: {skill.description}")
        print(skill.content)  # Full SKILL.md content
```

## Why Skyll?

Agent skills (SKILL.md files) are a powerful way to extend what AI agents can do, but today they require manual installation before a session. Developers need to know in advance which skills they'll need.

**Skyll changes that.** Any agent can discover and retrieve skills on demand. No pre-installation. No human intervention. Agents explore, choose based on context, and use skills autonomously.

## Installation

```bash
# Client only (recommended for most users)
pip install skyll

# With server for self-hosting
pip install skyll[server]
```

## Quick Start

### Using the Client

```python
from skyll import Skyll

async with Skyll() as client:
    # Search for skills
    skills = await client.search("react performance", limit=5)
    
    for skill in skills:
        print(f"📦 {skill.title}")
        print(f"   Source: {skill.source}")
        print(f"   Installs: {skill.install_count:,}")
        print(f"   Score: {skill.relevance_score:.1f}")
        
        if skill.content:
            print(f"   Content: {len(skill.content):,} chars")
```

### One-liner

```python
from skyll import search_skills

# Simple function for quick searches
skills = await search_skills("python testing")
```

### Get a Specific Skill

```python
async with Skyll() as client:
    skill = await client.get("anthropics/skills", "skill-creator")
    if skill:
        print(skill.content)
```

### Include References

Some skills have additional documentation in `references/` directories:

```python
async with Skyll() as client:
    skills = await client.search("react", include_references=True)
    
    for skill in skills:
        for ref in skill.references:
            print(f"📎 {ref.name}: {len(ref.content)} chars")
```

## API Reference

### `Skyll` Client

```python
Skyll(
    base_url="https://api.skyll.app",  # API endpoint
    timeout=30.0,                       # Request timeout in seconds
)
```

### Methods

| Method | Description |
|--------|-------------|
| `search(query, limit=10, include_content=True, include_references=False)` | Search for skills |
| `get(source, skill_id, include_references=False)` | Get a specific skill |
| `health()` | Check API health status |

### `Skill` Model

```python
skill.id                # Skill identifier
skill.title             # Display name
skill.description       # What the skill does
skill.source            # GitHub owner/repo
skill.content           # Full SKILL.md markdown
skill.install_count     # Installs from skills.sh
skill.relevance_score   # Ranking score (0-100)
skill.references        # List of reference files
skill.refs.github       # GitHub URL
skill.refs.skills_sh    # skills.sh URL
```

## REST API

The hosted API is available at `https://api.skyll.app`:

```bash
# Search for skills
curl "https://api.skyll.app/search?q=react+performance&limit=5"

# Get a specific skill
curl "https://api.skyll.app/skills/anthropics/skills/skill-creator"

# Health check
curl "https://api.skyll.app/health"
```

Interactive docs: [api.skyll.app/docs](https://api.skyll.app/docs)

## Self-Hosted

Run your own Skyll server:

```bash
# Clone and install
git clone https://github.com/assafelovic/skyll.git
cd skyll
pip install -e ".[server]"

# Optional: Add GitHub token for higher rate limits
echo "GITHUB_TOKEN=ghp_your_token" > .env

# Start the server
uvicorn src.main:app --port 8000
```

Then point your client to it:

```python
async with Skyll(base_url="http://localhost:8000") as client:
    skills = await client.search("testing")
```

### Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `GITHUB_TOKEN` | GitHub PAT for higher rate limits | None |
| `CACHE_TTL` | Cache TTL in seconds | 86400 (24h) |
| `ENABLE_REGISTRY` | Enable community registry | true |

## MCP Server

For Claude Desktop, Cursor, or other MCP clients:

```json
{
  "mcpServers": {
    "skyll": {
      "command": "python",
      "args": ["-m", "src.mcp_server"],
      "cwd": "/path/to/skyll"
    }
  }
}
```

## Use Cases

**Web Research**: Agent searches for `tavily-search` → Uses Tavily's LLM-optimized search API for real-time web results.

**Deep Research**: Agent discovers `gpt-researcher` → Runs autonomous multi-step research with citations.

**Testing Workflows**: Agent finds `test-driven-development` → Follows TDD workflow: write tests first, then implement.

**Building Integrations**: Agent retrieves `mcp-builder` → Creates MCP servers following best practices.

## Features

- 🔍 **Multi-Source Search**: Query [skills.sh](https://skills.sh), community registry, and more
- 📄 **Full Content**: Returns complete SKILL.md with parsed metadata
- 📎 **References**: Fetch additional docs from `references/` directories
- 📊 **Relevance Ranking**: Scored by content match and popularity
- ⚡ **Cached**: 24-hour cache to respect GitHub rate limits
- 🔌 **Dual Interface**: Python client + REST API + MCP Server

## Documentation

| Doc | Description |
|-----|-------------|
| [API Reference](./docs/api.md) | REST endpoints, response format |
| [Ranking Algorithm](./docs/ranking.md) | How skills are scored |
| [Skill Sources](./docs/sources.md) | Available sources |
| [Architecture](./docs/architecture.md) | System design |

Web docs: [skyll.app/docs](https://skyll.app/docs)

## Contributing Skills

Add your skill to the community registry! Edit [`registry/SKILLS.md`](./registry/SKILLS.md):

```markdown
- your-skill-id | your-username/your-repo | path/to/skill | What your skill does
```

Requirements:
- Valid `SKILL.md` following the [Agent Skills Spec](https://agentskills.io)
- Keep descriptions under 80 characters

## What are Agent Skills?

Agent skills are markdown files (SKILL.md) that teach AI coding agents how to complete specific tasks. They follow the [Agent Skills specification](https://agentskills.io) and work with 27+ AI agents. Learn more at [skills.sh](https://skills.sh).

## License

Apache-2.0 License. See [LICENSE](LICENSE) for details.

---

<p align="center">
  Built for autonomous agents • <a href="https://skyll.app">skyll.app</a> • <a href="https://api.skyll.app">api.skyll.app</a> • <a href="https://discord.gg/CxdMdfZS">Discord</a>
</p>
