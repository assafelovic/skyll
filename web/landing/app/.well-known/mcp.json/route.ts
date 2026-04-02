export const dynamic = "force-static";

export function GET() {
  const mcpManifest = {
    name: "skyll",
    description:
      "Skill discovery for AI agents. Search and retrieve agent skills (SKILL.md files) at runtime.",
    url: "https://api.skyll.app/mcp",
    transport: {
      type: "streamable-http",
      url: "https://api.skyll.app/mcp",
    },
    version: "0.1.0",
    tools: [
      {
        name: "search_skills",
        description:
          "Search for agent skills by query. Returns ranked results with full SKILL.md content, scored 0-100 by relevance.",
        inputSchema: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Natural language search query",
            },
            limit: {
              type: "integer",
              description: "Maximum number of results (1-50)",
              default: 10,
            },
            include_references: {
              type: "boolean",
              description: "Include reference .md files",
              default: false,
            },
          },
          required: ["query"],
        },
      },
      {
        name: "get_skill",
        description:
          "Get a specific skill by source repository and skill ID.",
        inputSchema: {
          type: "object",
          properties: {
            source: {
              type: "string",
              description: "Source repository (e.g. 'anthropics/skills')",
            },
            skill_id: {
              type: "string",
              description: "Skill identifier",
            },
          },
          required: ["source", "skill_id"],
        },
      },
      {
        name: "add_skill",
        description:
          "Get a skill by name or full path. Like 'npx skills add' for runtime context injection.",
        inputSchema: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description:
                "Skill name or full path (e.g. 'react-best-practices' or 'vercel-labs/agent-skills/vercel-react-best-practices')",
            },
          },
          required: ["name"],
        },
      },
      {
        name: "get_cache_stats",
        description: "Get cache statistics for debugging and monitoring.",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
    links: {
      homepage: "https://skyll.app",
      documentation: "https://skyll.app/docs",
      github: "https://github.com/assafelovic/skyll",
      openapi: "https://api.skyll.app/openapi.json",
    },
  };

  return Response.json(mcpManifest, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
