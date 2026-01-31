# Skill Sources

Skill Garden aggregates skills from multiple sources, providing a unified search interface.

## Available Sources

| Source | Description | Install Counts | Status |
|--------|-------------|----------------|--------|
| **[skills.sh](https://skills.sh)** | Vercel's skill marketplace | ✅ Yes | Enabled by default |
| **[Skill Garden Registry](../registry/SKILLS.md)** | Community-curated list | ❌ No | Enabled by default |

## How Multi-Source Works

1. **Parallel search**: All enabled sources are queried simultaneously
2. **Result merging**: Results are combined into a single list
3. **Deduplication**: Skills are deduplicated by `owner/repo/skill-id` (skills.sh takes priority)
4. **Content fetch**: GitHub API fetches actual SKILL.md content
5. **Ranking**: Combined results are ranked by relevance score

## skills.sh

The primary source, powered by [skills.sh](https://skills.sh). Provides:

- Search API with full-text search
- Install counts (popularity data)
- Metadata about skill repositories

Skills from skills.sh have popularity data, which contributes to ranking.

## Skill Garden Registry

A community-curated list maintained in this repository at [`registry/SKILLS.md`](../registry/SKILLS.md).

### Contributing to the Registry

1. Edit `registry/SKILLS.md`
2. Add your skill in the format:
   ```markdown
   - skill-id | owner/repo | path/to/skill | Short description
   ```
3. Submit a PR

**Requirements:**
- Your repo must have a valid `SKILL.md` file
- Follow the [Agent Skills Spec](https://agentskills.io)
- Keep descriptions under 80 characters

See [`registry/README.md`](../registry/README.md) for full guidelines.

## Adding Custom Sources

Implement the `SkillSource` protocol:

```python
# src/sources/my_source.py
from src.sources.base import SkillSource, SkillSearchResult

class MyCustomSource:
    """Custom skill source."""
    
    REGISTRY_NAME = "my-source"
    
    def __init__(self, enabled: bool = True):
        self._enabled = enabled
    
    @property
    def name(self) -> str:
        return self.REGISTRY_NAME
    
    @property
    def enabled(self) -> bool:
        return self._enabled
    
    async def __aenter__(self):
        # Initialize (e.g., load data, connect to API)
        return self
    
    async def __aexit__(self, *args):
        # Cleanup
        pass
    
    async def search(self, query: str, limit: int = 10) -> list[SkillSearchResult]:
        """Search for skills matching the query."""
        results = []
        
        # Your search logic here
        # Return SkillSearchResult objects:
        results.append(SkillSearchResult(
            id="skill-id",
            name="Skill Name",
            source="owner/repo",
            source_registry=self.REGISTRY_NAME,
            installs=0,  # Set to 0 if no popularity data
            description="What the skill does",
        ))
        
        return results[:limit]
```

### Register the Source

In `src/core/service.py`:

```python
from src.sources.my_source import MyCustomSource

# In SkillSearchService.__init__:
self._sources = [
    SkillsShSource(enabled=True),
    SkillRegistrySource(enabled=True),
    MyCustomSource(enabled=True),  # Add your source
]
```

### Export from Package

In `src/sources/__init__.py`:

```python
from src.sources.my_source import MyCustomSource

__all__ = [
    # ... existing exports
    "MyCustomSource",
]
```

## Disabling Sources

Use environment variables:

```bash
# Disable the community registry
ENABLE_REGISTRY=false uvicorn src.main:app --port 8000
```

## Source Priority

When the same skill appears in multiple sources:

1. **skills.sh wins**: It has install counts, so its data is preferred
2. **First seen wins**: For ties, the first source to return the skill wins

This ensures popularity data is preserved while allowing community sources to fill gaps.
