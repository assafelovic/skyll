"""
SKILL.md parser for extracting frontmatter and content.

Parses the YAML frontmatter (between --- markers) and separates
the markdown body for structured access.
"""

import logging
import re
from dataclasses import dataclass, field
from typing import Any

import yaml

logger = logging.getLogger(__name__)

# Regex to match YAML frontmatter between --- markers
FRONTMATTER_PATTERN = re.compile(
    r"^---\s*\n(.*?)\n---\s*\n",
    re.DOTALL,
)


@dataclass
class ParsedSkill:
    """
    Parsed SKILL.md content with separated frontmatter and body.
    
    Attributes:
        name: Skill name from frontmatter (required)
        description: Skill description from frontmatter
        version: Semantic version
        allowed_tools: List of allowed tool names
        content: Markdown body (frontmatter removed)
        raw: Original raw content including frontmatter
        metadata: Any additional frontmatter fields
    """

    name: str
    description: str | None = None
    version: str | None = None
    allowed_tools: list[str] | None = None
    content: str = ""
    raw: str = ""
    metadata: dict[str, Any] = field(default_factory=dict)


class ParseError(Exception):
    """Exception raised when SKILL.md parsing fails."""

    pass


class SkillParser:
    """
    Parser for SKILL.md files following the Agent Skills specification.
    
    Extracts YAML frontmatter and markdown content, normalizing
    fields to a consistent structure.
    
    Example:
        parser = SkillParser()
        parsed = parser.parse(raw_content)
        print(parsed.name, parsed.description)
        print(parsed.content)  # Markdown without frontmatter
    """

    def parse(self, raw_content: str) -> ParsedSkill:
        """
        Parse SKILL.md content into structured data.
        
        Args:
            raw_content: Raw SKILL.md file content
            
        Returns:
            ParsedSkill with extracted fields
            
        Raises:
            ParseError: If content cannot be parsed (missing frontmatter, invalid YAML)
        """
        if not raw_content or not raw_content.strip():
            raise ParseError("Empty content")

        # Extract frontmatter
        match = FRONTMATTER_PATTERN.match(raw_content)
        if not match:
            # No frontmatter - treat entire content as body
            logger.warning("No frontmatter found in SKILL.md")
            return ParsedSkill(
                name="unknown",
                content=raw_content.strip(),
                raw=raw_content,
            )

        # Parse YAML frontmatter
        frontmatter_yaml = match.group(1)
        try:
            frontmatter = yaml.safe_load(frontmatter_yaml) or {}
        except yaml.YAMLError as e:
            raise ParseError(f"Invalid YAML frontmatter: {e}") from e

        if not isinstance(frontmatter, dict):
            raise ParseError(f"Frontmatter must be a dictionary, got {type(frontmatter)}")

        # Extract body (everything after frontmatter)
        body = raw_content[match.end():].strip()

        # Parse allowed-tools (can be string or list)
        allowed_tools = self._parse_allowed_tools(frontmatter.get("allowed-tools"))

        # Build metadata dict with non-standard fields
        standard_fields = {"name", "description", "version", "allowed-tools"}
        metadata = {k: v for k, v in frontmatter.items() if k not in standard_fields}

        return ParsedSkill(
            name=frontmatter.get("name", "unknown"),
            description=frontmatter.get("description"),
            version=frontmatter.get("version"),
            allowed_tools=allowed_tools,
            content=body,
            raw=raw_content,
            metadata=metadata,
        )

    def _parse_allowed_tools(self, value: Any) -> list[str] | None:
        """
        Parse allowed-tools field which can be string or list.
        
        Examples:
            "Bash, Read, Write" -> ["Bash", "Read", "Write"]
            ["Bash", "Read"] -> ["Bash", "Read"]
            None -> None
        """
        if value is None:
            return None

        if isinstance(value, list):
            return [str(v).strip() for v in value if v]

        if isinstance(value, str):
            # Split by comma and clean up
            return [tool.strip() for tool in value.split(",") if tool.strip()]

        return None

    def extract_title(self, content: str) -> str | None:
        """
        Extract the first H1 heading from markdown content.
        
        Useful for getting a display title when frontmatter name is technical.
        """
        lines = content.split("\n")
        for line in lines:
            line = line.strip()
            if line.startswith("# "):
                return line[2:].strip()
        return None
