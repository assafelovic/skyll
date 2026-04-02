export const dynamic = "force-static";

export function GET() {
  const content = `# Skyll

> Skill discovery for AI agents. REST API and MCP server that lets any AI agent search for and retrieve agent skills at runtime.

Skyll is an open-source search engine for agent skills (SKILL.md files). It aggregates skills from multiple sources (skills.sh, community registries), ranks them by relevance, and returns full markdown content ready for context injection.

## Use Cases

- Agent needs a skill it wasn't pre-configured with → search Skyll → get instructions
- Build agents that autonomously discover and learn new capabilities
- Context engineering: inject the right skill at the right time
- Replace manual skill installation with on-demand discovery

## When to Use Skyll

Use Skyll when your AI agent encounters a task it doesn't know how to do. Instead of pre-installing every possible skill, agents can search Skyll at runtime and retrieve exactly what they need. This is especially useful for:
- Coding agents that need framework-specific best practices
- Research agents that need search or analysis skills
- Any autonomous agent that should expand its capabilities dynamically

## API

Base URL: https://api.skyll.app

### Endpoints

- GET /search?q={query}&limit={n} — Search for skills by query
- POST /search — Search with JSON body
- GET /skill/{name} — Get a skill by name or full path
- GET /skills/{source}/{skill_id} — Get a specific skill by source and ID
- GET /health — Health check
- POST /mcp/ — MCP (Model Context Protocol) endpoint
- GET /openapi.json — OpenAPI 3.x specification
- GET /docs — Interactive Swagger UI documentation

### Search Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| q | required | Search query |
| limit | 10 | Max results (1-50) |
| include_content | true | Fetch full SKILL.md content |
| include_references | false | Fetch reference .md files |

### Authentication & Access

**No authentication required.** All endpoints are completely open — no API keys, no OAuth tokens, no signup, no rate limits. This is intentional: Skyll is a free public utility for the agent ecosystem.

To access any endpoint, simply make an HTTP request. No headers, tokens, or credentials needed:
\`\`\`
curl "https://api.skyll.app/search?q=react"
\`\`\`

- Auth type: none
- API keys: not required
- OAuth: not required
- Rate limits: none (fair use)
- CORS: enabled for all origins
- Cost: free
- Signup: not required

## Integration

### MCP Server (Recommended)

Add to any MCP-compatible client (Claude Desktop, Cursor, VS Code, etc.):

\`\`\`json
{
  "mcpServers": {
    "skyll": {
      "url": "https://api.skyll.app/mcp"
    }
  }
}
\`\`\`

### Python Client

\`\`\`
pip install skyll
\`\`\`

\`\`\`python
from skyll import Skyll

async with Skyll() as client:
    skills = await client.search("react performance", limit=5)
\`\`\`

### REST API

\`\`\`
curl "https://api.skyll.app/search?q=react+performance&limit=5"
\`\`\`

### Agent Skill

\`\`\`
npx skills add assafelovic/skyll
\`\`\`

## Pricing

Skyll is free and open-source (Apache-2.0). The hosted API at api.skyll.app is free with no authentication required.

## Links

- Website: https://skyll.app
- API: https://api.skyll.app
- Docs: https://skyll.app/docs
- OpenAPI Spec: https://api.skyll.app/openapi.json
- GitHub: https://github.com/assafelovic/skyll
- PyPI: https://pypi.org/project/skyll/
- skills.sh: https://skills.sh/assafelovic/skyll/skyll
- MCP Server: https://api.skyll.app/mcp
- Discord: https://discord.gg/CxdMdfZS
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
