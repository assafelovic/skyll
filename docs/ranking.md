# Ranking Algorithm

Skyll uses a multi-signal ranking algorithm to order search results by relevance. Each skill receives a score from 0-100 based on weighted factors, with a small additional boost for curated registry skills.

## Why Options Matter

Today, developers pre-install skills manually before agents can use them. With Skyll, agents can explore and make their own decisions. The ranked list enables:

- **Agent autonomy**: Agents choose skills based on user requests, task context, or their own judgment
- **Discovery**: Surface popular and trending skills the agent (or developer) didn't know existed
- **Flexibility**: Filter by score, pick the top match, or let the agent evaluate multiple options

Options give agents the freedom to discover and decide, rather than being limited to pre-installed choices.

## Scoring Formula

```
relevance_score = content + references + query_match + popularity + curated_boost
```

The base score is 0-100. The curated boost can add up to 8 additional points for highly relevant registry skills.

## Signals

### 1. Content Availability (40 points)

Skills with successfully fetched SKILL.md content receive 40 points. Skills without content are sorted last (not filtered) since they may still serve as pointers.

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

How well the skill matches the search query. Checks multiple fields in priority order:

**ID Matching (strongest signal):**

| Match Type | Score | Points |
|------------|-------|--------|
| Exact ID match | 1.0 | 30 |
| All query terms in ID | 0.9 | 27 |
| All ID terms in query | 0.85 | 25.5 |

**Title Matching:**

| Match Type | Score | Points |
|------------|-------|--------|
| All query terms in title | 0.8 | 24 |
| All terms across ID + title combined | 0.75 | 22.5 |

**Description Matching:**

| Match Type | Score | Points |
|------------|-------|--------|
| All query terms in description | 0.7 | 21 |
| Partial description match | 0.0-0.35 | 0-10.5 |

**Content Matching (weakest signal, first 2000 chars):**

| Match Type | Score | Points |
|------------|-------|--------|
| Partial content match | 0.0-0.15 | 0-4.5 |

The ranker computes all applicable scores and takes the highest. For example, a skill whose ID partially matches but whose description fully matches will use the description score (0.7) rather than the partial ID score.

**Example:** Query "deep research" on skill "gpt-researcher"
- ID "gpt-researcher" → partial match ("research" found) → 0.25
- Description "Autonomous deep research agent..." → all terms found → 0.7
- Best score: 0.7 → 21 points

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

### 5. Curated Registry Boost (up to 10 points)

Skills from the local curated registry (`registry/SKILLS.md`) receive a boost **scaled by their query relevance**. This rewards hand-picked quality skills without letting irrelevant registry entries jump the ranks.

```python
curated_boost = is_curated × 8 × query_match
```

| Query Match | Boost |
|-------------|-------|
| Strong match (0.9) | +7.2 |
| Description match (0.7) | +5.6 |
| Partial match (0.25) | +2 |
| No match (0.0) | 0 |

**Example:** Curated skill "gpt-researcher" for query "deep research"
- Query match: 0.7 (description match)
- Curated boost: 8 × 0.7 = 5.6 points

## Search Pipeline

Before ranking, the search pipeline:

1. **Over-fetches** from sources (2× requested limit) to give the ranker more candidates
2. **Deduplicates** by source/ID, preferring skills.sh results (which have install counts)
3. **Fetches content** from GitHub for all candidates in parallel
4. **Ranks** using the scoring formula above
5. **Trims** to the requested limit

## Example Scores

| Skill | Content | Refs | Query | Pop. | Curated | Total |
|-------|---------|------|-------|------|---------|-------|
| Exact match, popular, with content | 40 | 15 | 30 | 15 | 0 | **100** |
| Good match, popular, with content | 40 | 0 | 25 | 12 | 0 | **77** |
| Curated, description match, no installs | 40 | 0 | 21 | 0 | 5.6 | **66.6** |
| Partial match, new skill | 40 | 0 | 15 | 0 | 0 | **55** |
| No content (fetch failed) | 0 | 0 | 30 | 15 | 0 | **45** |

## Design Rationale

1. **Content is king**: Skills without content are less useful, so content availability dominates the score.

2. **Query relevance matters**: Exact matches should rank above partial matches, regardless of popularity.

3. **Multi-field matching**: Skills can match via ID, title, description, or content. A skill about "deep research" should surface even if its ID is "gpt-researcher" - the description match catches this.

4. **Popularity is a signal, not the answer**: Log scaling prevents extremely popular skills from dominating. A skill with 100 installs and good query match can outrank a skill with 10,000 installs and poor match.

5. **Curated skills get a nudge**: Registry skills are hand-picked for quality. The boost is scaled by relevance to prevent irrelevant registry skills from jumping the ranks.

6. **References add value**: When users request references, skills that provide them are more valuable.

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
