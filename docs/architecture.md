# Architecture

Skyll is designed as a modular, extensible system for skill discovery.

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Skyll                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    ┌───────────────────┐    ┌──────────────┐ │
│  │   REST API   │───▶│ SkillSearchService │◀───│  MCP Server  │ │
│  │  (FastAPI)   │    │   (Core Engine)    │    │  (FastMCP)   │ │
│  │  Port 8000   │    │                    │    │  stdio/SSE   │ │
│  └──────────────┘    └─────────┬──────────┘    └──────────────┘ │
│                                │                                │
│                    ┌───────────┴───────────┐                   │
│                    ▼                       ▼                   │
│         ┌─────────────────┐    ┌─────────────────────┐         │
│         │  Skill Sources  │    │  GitHubClient       │         │
│         │  (search APIs)  │    │  (content fetcher)  │         │
│         └─────────────────┘    └──────────┬──────────┘         │
│                                           │                    │
│                               ┌───────────┴───────────┐        │
│                               ▼                       ▼        │
│                    ┌─────────────────┐    ┌─────────────────┐  │
│                    │  CacheBackend   │    │  SkillParser    │  │
│                    │  (pluggable)    │    │  (YAML+MD)      │  │
│                    └─────────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Core Components

### SkillSearchService (`src/core/service.py`)

The central orchestrator that:

- Manages skill sources
- Coordinates parallel searches
- Deduplicates results
- Fetches content via GitHub client
- Applies ranking

### Skill Sources (`src/sources/`)

Pluggable sources for skill discovery:

- `SkillsShSource`: Queries skills.sh API
- `SkillRegistrySource`: Reads local registry file

See [Sources](./sources.md) for adding custom sources.

### GitHubClient (`src/clients/github.py`)

Fetches SKILL.md content from GitHub:

- Uses GitHub Tree API for efficient file location
- Handles branch detection (main/master)
- Fetches reference files
- Caches repository trees

### Ranker (`src/ranking/`)

Computes relevance scores:

- `RelevanceRanker`: Default multi-signal ranker
- `HybridRanker`: Placeholder for future hybrid approach
- `SemanticRanker`: Placeholder for embedding-based ranking

See [Ranking](./ranking.md) for algorithm details.

### CacheBackend (`src/cache/`)

Pluggable caching layer:

- `InMemoryCache`: Default, TTL-based
- Extensible for Redis, Memcached, etc.

### SkillParser (`src/core/parser.py`)

Parses SKILL.md files:

- Extracts YAML frontmatter
- Parses markdown content
- Returns structured data

## Request Flow

1. **Request arrives** (REST or MCP)
2. **Search sources** in parallel
3. **Deduplicate** by owner/repo/skill-id
4. **Fetch content** from GitHub (with caching)
5. **Parse** YAML frontmatter and markdown
6. **Rank** by relevance score
7. **Return** structured JSON

## Extending Skyll

### Custom Cache Backend

```python
from src.cache.base import CacheBackend

class RedisCache(CacheBackend):
    def __init__(self, redis_url: str):
        import redis.asyncio as redis
        self.redis = redis.from_url(redis_url)
    
    async def get(self, key: str):
        data = await self.redis.get(key)
        return json.loads(data) if data else None
    
    async def set(self, key: str, value, ttl: int = None):
        await self.redis.set(key, json.dumps(value), ex=ttl)
    
    async def delete(self, key: str):
        await self.redis.delete(key)
    
    async def clear(self):
        await self.redis.flushdb()
```

### Custom Ranker

```python
from src.ranking.base import Ranker

class SemanticRanker(Ranker):
    def __init__(self):
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
    
    def rank(self, skills, query="", include_references=False):
        query_embedding = self.model.encode(query)
        
        for skill in skills:
            text = f"{skill.id} {skill.description or ''}"
            skill_embedding = self.model.encode(text)
            similarity = cosine_similarity(query_embedding, skill_embedding)
            skill.relevance_score = similarity * 100
        
        return sorted(skills, key=lambda s: s.relevance_score, reverse=True)
```

### Custom Skill Source

See [Sources](./sources.md) for the full guide.

## Directory Structure

```
src/
├── api/
│   └── routes.py          # FastAPI REST endpoints
├── cache/
│   ├── base.py            # CacheBackend protocol
│   └── memory.py          # InMemoryCache implementation
├── clients/
│   ├── github.py          # GitHub content fetcher
│   └── skillssh.py        # skills.sh API client
├── core/
│   ├── models.py          # Pydantic models
│   ├── parser.py          # SKILL.md parser
│   └── service.py         # Main service orchestrator
├── ranking/
│   ├── base.py            # Ranker protocol
│   ├── relevance.py       # RelevanceRanker
│   ├── hybrid.py          # Placeholder
│   └── semantic.py        # Placeholder
├── sources/
│   ├── base.py            # SkillSource protocol
│   ├── skillssh.py        # skills.sh source
│   └── registry.py        # Local registry source
├── main.py                # FastAPI app
└── mcp_server.py          # MCP server
```

## Configuration

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 8000 |
| `GITHUB_TOKEN` | GitHub PAT for API access | None |
| `CACHE_TTL` | Cache TTL in seconds | 3600 |
| `LOG_LEVEL` | Logging level | INFO |
| `ENABLE_REGISTRY` | Enable community registry | true |

## MCP Server

Uses the official [Model Context Protocol SDK](https://github.com/modelcontextprotocol/python-sdk):

- **stdio transport**: For Claude Desktop, Cursor, and local agents
- **SSE transport**: For web-based MCP clients
- **Tools**: `search_skills`, `get_skill`, `get_cache_stats`
