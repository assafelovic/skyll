# Ranking Algorithm

Skill Garden uses a multi-signal ranking algorithm to order search results by relevance. Each skill receives a score from 0-100 based on four weighted factors.

## Why Scores Matter

Today, developers pre-install skills manually before agents can use them. With Skill Garden, agents can explore and make their own decisions. The ranked list enables:

- **Agent autonomy**: Agents choose skills based on user requests, task context, or their own judgment
- **Discovery**: Surface popular and trending skills the agent (or developer) didn't know existed
- **Flexibility**: Filter by score, pick the top match, or let the agent evaluate multiple options

Scores give agents the freedom to discover and decide, rather than being limited to pre-installed choices.

## Scoring Formula

```
relevance_score = content_score + references_score + query_match_score + popularity_score
```

## Signals

### 1. Content Availability (40 points)

Skills with successfully fetched SKILL.md content receive 40 points. This ensures skills with actual content rank above those that failed to fetch.

| Condition | Points |
|-----------|--------|
| Has content | 40 |
| No content (fetch failed) | 0 |

### 2. References (15 points)

When `include_references=true`, skills with reference files receive a 15-point boost. This surfaces skills with richer documentation.

| Condition | Points |
|-----------|--------|
| Has references (when requested) | 15 |
| No references | 0 |

### 3. Query Match (30 points max)

How well the skill ID matches the search query:

| Match Type | Score | Points |
|------------|-------|--------|
| Exact ID match | 1.0 | 30 |
| All query terms in ID | 0.9 | 27 |
| All ID terms in query | 0.85 | 25.5 |
| Partial term matches | 0.0-0.5 | 0-15 |
| No match | 0 | 0 |

**Example:** Query "gpt researcher" on skill "gpt-researcher"
- Skill ID normalized: "gpt researcher"
- All ID terms ("gpt", "researcher") appear in query
- Score: 0.85 × 30 = 25.5 points

### 4. Popularity (15 points max)

Install count from skills.sh, using logarithmic scaling:

```python
popularity = min(log10(install_count + 1) / 4, 1.0) × 15
```

| Install Count | Score | Points |
|---------------|-------|--------|
| 0 | 0 | 0 |
| 10 | 0.25 | 3.75 |
| 100 | 0.5 | 7.5 |
| 1,000 | 0.75 | 11.25 |
| 10,000+ | 1.0 | 15 |

## Example Scores

| Skill | Content | Refs | Query Match | Popularity | Total |
|-------|---------|------|-------------|------------|-------|
| Exact match, popular, with content | 40 | 15 | 30 | 15 | **100** |
| Good match, popular, with content | 40 | 0 | 25 | 12 | **77** |
| Partial match, new skill | 40 | 0 | 15 | 0 | **55** |
| No content (fetch failed) | 0 | 0 | 30 | 15 | **45** |

## Design Rationale

1. **Content is king**: Skills without content are not useful, so content availability dominates.

2. **Query relevance matters**: Exact matches should rank above partial matches, regardless of popularity.

3. **Popularity is a signal, not the answer**: Log scaling prevents extremely popular skills from dominating. A skill with 100 installs and good query match can outrank a skill with 10,000 installs and poor match.

4. **References add value**: When users request references, skills that provide them are more valuable.

## Customizing Ranking

The ranking algorithm is modular. To create a custom ranker:

```python
from src.ranking.base import Ranker

class MyCustomRanker(Ranker):
    def rank(self, skills, query="", include_references=False):
        for skill in skills:
            # Your scoring logic
            skill.relevance_score = ...
        return sorted(skills, key=lambda s: s.relevance_score, reverse=True)
```

Register in `src/core/service.py`:

```python
self._ranker = MyCustomRanker()
```

## Future Enhancements

The ranking system is designed for extension:

- **Semantic search**: Use embeddings to match query intent, not just keywords
- **Recency**: Boost recently updated skills
- **Quality signals**: Factor in documentation completeness, test coverage
- **User feedback**: Learn from click-through rates

We welcome community contributions to improve ranking. Open an issue or PR to discuss!
