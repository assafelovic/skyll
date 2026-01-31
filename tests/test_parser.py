"""Tests for SKILL.md parser."""

import pytest

from src.core.parser import SkillParser, ParseError


@pytest.fixture
def parser():
    return SkillParser()


class TestSkillParser:
    """Tests for SkillParser."""

    def test_parse_valid_skill(self, parser):
        """Test parsing a valid SKILL.md with all fields."""
        content = """---
name: test-skill
description: A test skill for unit testing
version: 1.0.0
allowed-tools: "Bash, Read, Write"
---

# Test Skill

This is the skill content.

## Steps

1. Do something
2. Do something else
"""
        result = parser.parse(content)

        assert result.name == "test-skill"
        assert result.description == "A test skill for unit testing"
        assert result.version == "1.0.0"
        assert result.allowed_tools == ["Bash", "Read", "Write"]
        assert "# Test Skill" in result.content
        assert "---" not in result.content

    def test_parse_minimal_skill(self, parser):
        """Test parsing a skill with minimal frontmatter."""
        content = """---
name: minimal-skill
---

# Minimal

Just the basics.
"""
        result = parser.parse(content)

        assert result.name == "minimal-skill"
        assert result.description is None
        assert result.version is None
        assert result.allowed_tools is None
        assert "# Minimal" in result.content

    def test_parse_allowed_tools_list(self, parser):
        """Test parsing allowed-tools as a list."""
        content = """---
name: list-tools
allowed-tools:
  - Bash
  - Read
  - Write
---

Content here.
"""
        result = parser.parse(content)

        assert result.allowed_tools == ["Bash", "Read", "Write"]

    def test_parse_with_metadata(self, parser):
        """Test parsing extra metadata fields."""
        content = """---
name: metadata-skill
custom-field: custom value
nested:
  key: value
---

Content.
"""
        result = parser.parse(content)

        assert result.metadata["custom-field"] == "custom value"
        assert result.metadata["nested"]["key"] == "value"

    def test_parse_no_frontmatter(self, parser):
        """Test parsing content without frontmatter."""
        content = """# Just Markdown

No frontmatter here.
"""
        result = parser.parse(content)

        assert result.name == "unknown"
        assert "# Just Markdown" in result.content

    def test_parse_empty_content(self, parser):
        """Test parsing empty content raises error."""
        with pytest.raises(ParseError, match="Empty content"):
            parser.parse("")

    def test_parse_invalid_yaml(self, parser):
        """Test parsing invalid YAML raises error."""
        content = """---
name: [invalid yaml
---

Content.
"""
        with pytest.raises(ParseError, match="Invalid YAML"):
            parser.parse(content)

    def test_extract_title(self, parser):
        """Test extracting H1 title from content."""
        content = """Some intro text.

# The Real Title

More content.
"""
        title = parser.extract_title(content)
        assert title == "The Real Title"

    def test_extract_title_none(self, parser):
        """Test extracting title when no H1 exists."""
        content = """No heading here.

Just paragraphs.
"""
        title = parser.extract_title(content)
        assert title is None

    def test_raw_content_preserved(self, parser):
        """Test that raw content is preserved."""
        content = """---
name: raw-test
---

Body content.
"""
        result = parser.parse(content)

        assert result.raw == content
        assert "---" in result.raw
