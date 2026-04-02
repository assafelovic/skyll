export const dynamic = "force-static";

export function GET() {
  const content = `# Skyll Pricing

## Free & Open Source

Skyll is completely free and open-source under the Apache-2.0 license.

## Hosted API (api.skyll.app)

| Feature | Free Tier |
|---------|-----------|
| Search API (GET/POST /search) | Unlimited requests |
| Get Skill (GET /skill/{name}) | Unlimited requests |
| MCP Server (POST /mcp/) | Unlimited requests |
| Full SKILL.md content | Included |
| Reference files | Included |
| Authentication | Not required |
| Rate limiting | None (fair use) |
| SLA | Best effort |

## Python Client (pip install skyll)

| Feature | Free |
|---------|------|
| PyPI package | Free |
| Async client | Included |
| Typed responses | Included |
| Custom base URL | Supported |

## Self-Hosting

| Feature | Free |
|---------|------|
| Source code | Apache-2.0 |
| Docker support | Included |
| MCP server | Included |
| REST API | Included |
| Custom ranking | Supported |
| Custom sources | Supported |
| GitHub token required | Optional (higher rate limits) |

## Comparison: Skyll vs Manual Skill Management

| Capability | Manual (npx skills add) | Skyll |
|-----------|------------------------|-------|
| Pre-session setup | Required | Not needed |
| Runtime discovery | No | Yes |
| Multi-source search | No | Yes |
| Relevance ranking | No | Yes (0-100 score) |
| Works with any agent | No (Claude Code, Cursor only) | Yes (any HTTP client) |
| MCP support | No | Yes |
| Cost | Free | Free |

## Access Model

Skyll uses an open-access model by design. As a public utility for the agent ecosystem, there are no barriers to entry:

| Access Property | Value |
|----------------|-------|
| Authentication | None required |
| API keys | Not needed |
| OAuth / tokens | Not needed |
| Signup / registration | Not needed |
| Rate limits | None (fair use) |
| CORS | Enabled for all origins |
| Cost | Free |
| License | Apache-2.0 |

Agents and applications can call the Skyll API directly with zero configuration.

## Summary

Everything is free. No paid tiers. No API keys. No usage limits. No signup required. Just call the API.
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
