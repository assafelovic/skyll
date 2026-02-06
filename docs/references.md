# Skill References

Many skills include additional documentation beyond the main SKILL.md file. Skyll can fetch these "reference files" to provide richer context.

## What are References?

Reference files are additional markdown documents that provide:

- Detailed guides and tutorials
- Code examples and templates
- Best practices and patterns
- API documentation

## Directory Structure

Skills with references typically have this structure:

```
skill-folder/
├── SKILL.md              # Main skill instructions
├── references/           # Primary reference directory
│   ├── concept-1.md
│   ├── concept-2.md
│   └── examples.md
├── resources/            # Alternative directory
├── docs/                 # Alternative directory
├── examples/             # Alternative directory
└── rules/                # Alternative directory
```

Skyll also detects sibling `.md` files in the same directory as SKILL.md.

## Fetching References

### REST API

```bash
# Include references in search results
curl "https://api.skyll.app/search?q=react+native&include_references=true"

# Add skill with references
curl "https://api.skyll.app/skill/react-best-practices?include_references=true"

# Fetch a specific skill with references
curl "https://api.skyll.app/skills/owner/repo/skill-id?include_references=true"
```

### MCP

```json
{
  "name": "add_skill",
  "arguments": {
    "name": "react-best-practices",
    "include_references": true
  }
}
```

```json
{
  "name": "search_skills",
  "arguments": {
    "query": "react native",
    "limit": 3,
    "include_references": true
  }
}
```

## Response Format

When `include_references=true`, the response includes a `references` array:

```json
{
  "id": "react-native-best-practices",
  "content": "# React Native Best Practices\n\nMain skill content...",
  "references": [
    {
      "name": "flatlist-optimization.md",
      "path": "skills/react-native/references/flatlist-optimization.md",
      "content": "# FlatList Optimization\n\nFull reference content...",
      "raw_url": "https://raw.githubusercontent.com/owner/repo/main/skills/react-native/references/flatlist-optimization.md"
    },
    {
      "name": "navigation-patterns.md",
      "path": "skills/react-native/references/navigation-patterns.md",
      "content": "# Navigation Patterns\n\n...",
      "raw_url": "https://raw.githubusercontent.com/..."
    }
  ]
}
```

## Reference Detection

Skyll looks for reference files in these directories (relative to SKILL.md):

1. `references/`
2. `resources/`
3. `docs/`
4. `examples/`
5. `rules/`
6. Sibling `.md` files in the same directory

Only `.md` files are included. Binary files, images, and other formats are excluded.

## Performance Considerations

Fetching references requires additional GitHub API calls:

- **Without references**: 1 API call per skill (for SKILL.md)
- **With references**: 1 + N API calls (where N = number of reference files)

To minimize API usage:

1. Only request references when needed (`include_references=true`)
2. Use a GitHub token to increase rate limits (60 → 5,000 requests/hour)
3. Results are cached to avoid repeated fetches

## Ranking Boost

When `include_references=true`, skills with references receive a ranking boost (15 points out of 100). This surfaces skills with richer documentation.

See [Ranking](./ranking.md) for details.
