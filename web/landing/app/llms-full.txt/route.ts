export const dynamic = "force-static";

export function GET() {
  const content = `# Skyll — Complete Reference for AI Agents

> Skill discovery for AI agents. REST API and MCP server that lets any AI agent search for and retrieve agent skills at runtime.

## Overview

Skyll is an open-source search engine for agent skills (SKILL.md files). It aggregates skills from multiple sources (skills.sh, community registries), ranks them by relevance using a multi-signal algorithm, and returns full markdown content ready for context injection.

Agent skills are markdown files that teach AI coding agents how to complete specific tasks, following the Agent Skills specification (https://agentskills.io). They are supported by 27+ AI agents including Claude Code, Cursor, GitHub Copilot, and more.

### The Problem

Today, skills only work with a handful of tools like Claude Code and Cursor. They require manual installation before a session, which means developers need to know in advance which skills they'll need.

### The Solution

Skyll democratizes access to skills. Any agent, framework, or tool can discover and retrieve skills on demand. No pre-installation. No human intervention. Agents explore, choose based on context, and use skills autonomously.

Think of Skyll as a search engine for agent capabilities. Your agent asks "How do I do X?" and Skyll returns the relevant skill with full instructions, ready to use.

## When to Use Skyll

Use Skyll when:
- The current task requires specialized knowledge or workflows not in context
- Looking for best practices for a specific framework, library, or domain
- Needing procedural knowledge for complex multi-step tasks
- Wanting to enhance agent capabilities with community-contributed skills
- Building agents that should autonomously discover and learn new capabilities
- Doing context engineering: injecting the right skill at the right time

## Features

- Multi-Source Search: Query skills.sh, community registry, and extensible to more sources. Results are deduplicated automatically.
- Full Content Retrieval: Get complete SKILL.md content with parsed YAML frontmatter, not just metadata. Ready for context injection.
- Relevance Ranking: Skills scored 0-100 based on content availability (40 pts), query match (30 pts), references (15 pts), and popularity/install count (15 pts).
- Aggressive Caching: Intelligent caching respects GitHub rate limits. Configure TTL via environment variables.
- References Support: Optionally fetch additional .md files from references/, docs/, examples/ directories.
- Dual Interface: Use as REST API for any integration, or as MCP server for Claude Desktop, Cursor, and more.

## Authentication & Access

No authentication required. All endpoints are completely open — no API keys, no OAuth tokens, no signup, no rate limits. This is by design: Skyll is a free public utility for the agent ecosystem.

Access model:
- Authentication: none required
- API keys: not needed
- OAuth / tokens: not needed
- Rate limits: none (fair use)
- CORS: enabled for all origins (Access-Control-Allow-Origin: *)
- Cost: free, no paid tiers
- Signup / registration: not required
- Terms of service: Apache-2.0 open source

To call any endpoint, just make a plain HTTP request:
  curl "https://api.skyll.app/search?q=react"

No headers, tokens, or credentials needed. Agents can call Skyll directly without any setup.

## API Reference

Base URL: https://api.skyll.app
OpenAPI Spec: https://api.skyll.app/openapi.json
Interactive Docs: https://api.skyll.app/docs

### GET /search

Search for agent skills by query. Returns ranked results with full content.

Parameters:
- q (string, required): Search query. Min 1, max 200 characters.
- limit (integer, optional, default 10): Maximum number of results (1-50).
- include_content (boolean, optional, default true): Fetch full SKILL.md content for each result.
- include_raw (boolean, optional, default false): Include raw SKILL.md with frontmatter.
- include_references (boolean, optional, default false): Fetch reference files from references/ or resources/ directories.

Example:
  curl "https://api.skyll.app/search?q=react+performance&limit=5"

Response:
{
  "query": "react performance",
  "count": 3,
  "skills": [
    {
      "id": "react-best-practices",
      "title": "React Best Practices",
      "description": "Guidelines for building performant React apps",
      "source": "vercel/ai-skills",
      "relevance_score": 85.5,
      "install_count": 1250,
      "content": "# React Best Practices\\n\\n## Performance\\n...",
      "refs": {
        "skills_sh": "https://skills.sh/...",
        "github": "https://github.com/..."
      }
    }
  ]
}

### POST /search

Same as GET /search but accepts JSON body for complex queries.

Body:
{
  "query": "react performance optimization",
  "limit": 5,
  "include_content": true,
  "include_references": false
}

### GET /skill/{name}

Fetch the latest version of a skill by name. Similar to \`npx skills add <name>\`.

Supports multiple formats:
- Simple name: /skill/react-best-practices (searches and returns top match)
- Full path: /skill/vercel-labs/agent-skills/vercel-react-best-practices

Parameters:
- include_references (boolean, optional, default false): Fetch reference files.

Example:
  curl "https://api.skyll.app/skill/react-best-practices"

### GET /skills/{source}/{skill_id}

Get a specific skill by source repository and skill ID.

Parameters:
- include_raw (boolean, optional, default false): Include raw SKILL.md with frontmatter.
- include_references (boolean, optional, default false): Fetch reference files.

Example:
  curl "https://api.skyll.app/skills/anthropics/skills/skill-creator"

### GET /health

Health check endpoint. Returns service status and cache statistics.

### POST /mcp/

MCP (Model Context Protocol) endpoint for MCP-compatible clients.

MCP Tools available:
- search_skills: Search for skills by query
- get_skill: Get a specific skill by source and ID
- add_skill: Get a skill by name (like npx skills add for runtime)
- get_cache_stats: Get cache statistics

## Integration Methods

### Method 1: MCP Server (Recommended)

Add to any MCP-compatible client (Claude Desktop, Cursor, VS Code, Windsurf, etc.):

{
  "mcpServers": {
    "skyll": {
      "url": "https://api.skyll.app/mcp"
    }
  }
}

For self-hosted MCP via stdio:

{
  "mcpServers": {
    "skyll": {
      "command": "/path/to/skyll/venv/bin/python",
      "args": ["-m", "src.mcp_server"],
      "cwd": "/path/to/skyll"
    }
  }
}

### Method 2: Python Client

pip install skyll

from skyll import Skyll

async with Skyll() as client:
    # Search for skills
    skills = await client.search("react performance", limit=5)
    for skill in skills:
        print(f"{skill.title}: {skill.description}")
        print(skill.content)

    # Get a specific skill
    skill = await client.get("anthropics/skills", "skill-creator")

    # Include references
    skills = await client.search("react", include_references=True)

    # Point to self-hosted server
    async with Skyll(base_url="http://localhost:8000") as client:
        skills = await client.search("testing")

### Method 3: REST API (curl / any language)

# Search
curl "https://api.skyll.app/search?q=react+performance&limit=5"

# Get specific skill
curl "https://api.skyll.app/skill/tavily-ai/skills/search"

# Get by name
curl "https://api.skyll.app/skill/react-best-practices"

### Method 4: Agent Skill

npx skills add assafelovic/skyll

This installs Skyll as an agent skill that teaches your agent how to use the Skyll API.

## Ranking Algorithm

Skills are scored 0-100 based on weighted signals:

1. Content Availability (40 pts max): Skills with successfully fetched SKILL.md content receive 40 points. Skills without content are sorted last.

2. Query Match (30 pts max): How well the skill matches the query. Checks ID, title, description, and content in priority order:
   - Exact ID match: +30
   - All query terms in ID: +27
   - All terms in title: +24
   - All terms in description: +21
   - Partial/content matches: 0-15

3. References (15 pts max): When include_references=true, skills with additional .md files receive +15.

4. Popularity (15 pts max): Install count from skills.sh using logarithmic scaling:
   - 10,000+ installs: +15
   - 1,000 installs: +11.25
   - 100 installs: +7.5

5. Curated Registry Boost (up to 8 pts): Skills from the curated registry/SKILLS.md receive a boost scaled by query relevance.

Formula: score = content + references + query_match + popularity + curated_boost

## Self-Hosting

git clone https://github.com/assafelovic/skyll.git
cd skyll
pip install -e ".[server]"

Configure via .env:
- GITHUB_TOKEN: GitHub token for higher rate limits (5000 vs 60 requests/hour)
- CACHE_TTL: Cache TTL in seconds (default: 3600)
- ENABLE_REGISTRY: Enable community registry (default: true)
- LOG_LEVEL: Logging level (default: INFO)

Start the server:
  uvicorn src.main:app --port 8000

## Contributing

### Add a Skill to the Registry

The community registry at registry/SKILLS.md is the easiest way to make a skill discoverable. Format:

- skill-id | owner/repo | path/to/skill | Short description

Requirements:
- Valid SKILL.md following the Agent Skills Spec
- Public GitHub repository
- Description under 80 characters

### Add a New Skill Source

Implement the SkillSource protocol:

from src.sources.base import SkillSource, SkillSearchResult

class MyCustomSource(SkillSource):
    @property
    def name(self) -> str:
        return "my-source"
    
    async def search(self, query: str, limit: int) -> list[SkillSearchResult]:
        ...
    
    async def initialize(self) -> None:
        ...

## Example Use Cases

1. Web Research: Agent needs web search → searches Skyll → finds tavily-search skill → uses Tavily API
2. Deep Research: Agent needs market analysis → finds gpt-researcher skill → runs autonomous research
3. Testing: Agent needs to add tests → finds test-driven-development skill → follows TDD workflow
4. Building Integrations: Agent needs MCP knowledge → finds mcp-builder skill → creates MCP servers

## Pricing

Skyll is free and open-source under the Apache-2.0 license. The hosted API at api.skyll.app requires no authentication and has no usage fees.

| Feature | Free |
|---------|------|
| Search API | Unlimited |
| MCP Server | Unlimited |
| Python Client | Unlimited |
| Self-Hosting | Full support |
| Source Code | Apache-2.0 |

## Links

- Website: https://skyll.app
- API: https://api.skyll.app
- API Docs: https://api.skyll.app/docs
- OpenAPI Spec: https://api.skyll.app/openapi.json
- GitHub: https://github.com/assafelovic/skyll
- PyPI: https://pypi.org/project/skyll/
- skills.sh Listing: https://skills.sh/assafelovic/skyll/skyll
- MCP Server: https://api.skyll.app/mcp
- Discord: https://discord.gg/CxdMdfZS
- Agent Skills Spec: https://agentskills.io
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
