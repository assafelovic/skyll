---
name: skyll
description: Search and retrieve agent skills at runtime. This skill should be used when the agent needs to find specialized capabilities, workflows, or domain knowledge to accomplish a task. Skyll aggregates skills from skills.sh and returns full SKILL.md content ready for context injection.
license: Apache-2.0
---

# Skyll - Agent Skill Discovery

Skyll enables agents to dynamically discover and retrieve skills at runtime. Instead of having all skills pre-loaded, agents can search for relevant skills on-demand and inject them into context.

## When to Use This Skill

Use Skyll when:
- The current task requires specialized knowledge or workflows not in context
- Looking for best practices for a specific framework, library, or domain
- Needing procedural knowledge for complex multi-step tasks
- Wanting to enhance capabilities with community-contributed skills

## Quick Usage

### Option 1: Python Client (Recommended)

```python
from skyll import Skyll

async with Skyll() as client:
    # Search for relevant skills
    skills = await client.search("react performance optimization", limit=3)
    
    for skill in skills:
        print(f"Skill: {skill.title}")
        print(f"Score: {skill.relevance_score}")
        print(skill.content)  # Full SKILL.md content
```

### Option 2: REST API

Search for skills:
```bash
curl "https://api.skyll.app/search?q=react+performance&limit=3"
```

Get a specific skill:
```bash
curl "https://api.skyll.app/skills/anthropics/skills/skill-creator"
```

## Response Format

The API returns ranked skills with relevance scores (0-100):

```json
{
  "query": "react performance",
  "count": 3,
  "skills": [
    {
      "id": "react-best-practices",
      "title": "React Best Practices",
      "description": "Performance optimization for React and Next.js",
      "source": "vercel-labs/agent-skills",
      "relevance_score": 85.5,
      "install_count": 82800,
      "content": "# React Best Practices\n\n## Performance\n..."
    }
  ]
}
```

## Key Fields

| Field | Description |
|-------|-------------|
| `id` | Skill identifier |
| `title` | Human-readable title |
| `description` | What the skill does |
| `source` | GitHub repository (owner/repo) |
| `relevance_score` | 0-100 match score |
| `install_count` | Popularity from skills.sh |
| `content` | Full SKILL.md markdown content |
| `references` | Additional reference files (if requested) |

## Search Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `q` / `query` | required | Search query |
| `limit` | 10 | Max results (1-50) |
| `include_content` | true | Fetch full SKILL.md content |
| `include_references` | false | Include reference files |

## Example Workflow

When an agent needs to build a React Native app but lacks mobile expertise:

1. **Search for relevant skills:**
   ```python
   skills = await client.search("react native best practices", limit=2)
   ```

2. **Inject top skill into context:**
   ```python
   context = skills[0].content  # Full SKILL.md content
   ```

3. **Use the skill's knowledge to complete the task**

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /search?q={query}` | Search skills |
| `POST /search` | Search with JSON body |
| `GET /skills/{source}/{skill_id}` | Get specific skill |
| `GET /health` | Health check |
| `GET /docs` | Interactive API documentation |

## Installation

For Python agents:
```bash
pip install skyll
```

For other languages, use the REST API directly at `https://api.skyll.app`.

## Links

- API: https://api.skyll.app
- Docs: https://api.skyll.app/docs
- Demo: https://skyll.app
- GitHub: https://github.com/assafelovic/skyll
