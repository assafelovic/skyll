export const dynamic = "force-static";

export function GET() {
  const manifest = {
    schema_version: "v1",
    name_for_human: "Skyll - Skill Discovery for AI Agents",
    name_for_model: "skyll",
    description_for_human:
      "Search and discover agent skills (SKILL.md files) from the skills.sh ecosystem. Find best practices, workflows, and domain knowledge for any task.",
    description_for_model:
      "Skyll is a search engine for agent skills. Use it to find SKILL.md files that teach you how to complete specific tasks. Search by natural language query and get full markdown instructions. Endpoints: GET /search?q={query} for search, GET /skill/{name} to get a skill by name, POST /mcp/ for MCP protocol. Base URL: https://api.skyll.app",
    auth: {
      type: "none",
      instructions:
        "No authentication required. All API endpoints are free and open. No API keys, tokens, or signup needed.",
    },
    api: {
      type: "openapi",
      url: "https://api.skyll.app/openapi.json",
    },
    logo_url: "https://skyll.app/logo.png",
    contact_email: "assafelovic@gmail.com",
    legal_info_url: "https://opensource.org/licenses/Apache-2.0",
  };

  return Response.json(manifest, {
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
