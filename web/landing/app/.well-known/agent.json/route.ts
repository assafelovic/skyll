export const dynamic = "force-static";

export function GET() {
  const agentCard = {
    name: "Skyll",
    description:
      "Skill discovery for AI agents. Search and retrieve agent skills (SKILL.md files) at runtime from the skills.sh ecosystem.",
    url: "https://skyll.app",
    provider: {
      organization: "Skyll",
      url: "https://github.com/assafelovic/skyll",
    },
    version: "0.1.0",
    documentationUrl: "https://skyll.app/docs",
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    defaultInputModes: ["text"],
    defaultOutputModes: ["text"],
    skills: [
      {
        id: "search-skills",
        name: "Search Skills",
        description:
          "Search for agent skills by natural language query. Returns ranked results with full SKILL.md content.",
        tags: ["search", "skills", "discovery"],
        examples: [
          "Find React performance optimization skills",
          "Search for testing best practices",
          "Find skills about MCP server development",
        ],
      },
      {
        id: "get-skill",
        name: "Get Skill",
        description:
          "Retrieve a specific skill by name or path. Returns full SKILL.md content ready for context injection.",
        tags: ["retrieve", "skill", "content"],
        examples: [
          "Get the react-best-practices skill",
          "Fetch skill from anthropics/skills/skill-creator",
        ],
      },
    ],
    authentication: {
      schemes: ["none"],
      credentials: null,
      description:
        "No authentication required. All endpoints are free and open. No API keys, OAuth tokens, or signup needed. Just make HTTP requests directly.",
    },
    interfaces: [
      {
        type: "rest",
        url: "https://api.skyll.app",
        specUrl: "https://api.skyll.app/openapi.json",
      },
      {
        type: "mcp",
        url: "https://api.skyll.app/mcp",
        transport: "streamable-http",
      },
    ],
  };

  return Response.json(agentCard, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
