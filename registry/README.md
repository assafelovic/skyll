# 🌱 Skill Garden Registry

This directory contains the community-curated skill registry.

## Files

- **[SKILLS.md](./SKILLS.md)** - The main skill registry file, parsed by Skill Garden

## Contributing

1. Edit `SKILLS.md`
2. Add your skill in the format: `- skill-id | owner/repo | path | Description`
3. Submit a PR

See the main [README](../README.md) for full contribution guidelines.

## Format

```markdown
- skill-id | owner/repo | path/to/skill | Short description of what the skill does
```

| Field | Description | Example |
|-------|-------------|---------|
| `skill-id` | Unique identifier | `aws-skills` |
| `owner/repo` | GitHub repository | `zxkane/aws-skills` |
| `path` | Path to SKILL.md folder (empty if root) | `skills/docx` |
| `description` | What the skill does (< 100 chars) | `AWS development with CDK` |
