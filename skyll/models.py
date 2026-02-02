"""
Pydantic models for Skyll API responses.
"""

from typing import Any
from pydantic import BaseModel, Field


class SkillReference(BaseModel):
    """A reference/resource file associated with a skill."""
    
    name: str = Field(..., description="Filename of the reference")
    path: str = Field(..., description="Full path in the repository")
    content: str | None = Field(default=None, description="Markdown content")
    raw_url: str | None = Field(default=None, description="Direct URL to raw content")


class SkillRefs(BaseModel):
    """Reference URLs for a skill."""
    
    skills_sh: str = Field(..., description="Skills.sh marketplace page")
    github: str = Field(..., description="GitHub repository URL")
    raw: str | None = Field(default=None, description="Direct raw content URL")


class Skill(BaseModel):
    """
    A complete agent skill with parsed metadata and content.
    
    This is the primary response object, containing all information
    needed to understand and use a skill.
    """
    
    id: str = Field(..., description="Skill identifier/slug")
    title: str = Field(..., description="Skill display name")
    description: str | None = Field(default=None, description="What the skill does")
    version: str | None = Field(default=None, description="Semantic version")
    allowed_tools: list[str] | None = Field(default=None, description="Tools the skill can use")
    source: str = Field(..., description="GitHub owner/repo")
    refs: SkillRefs = Field(..., description="Reference URLs")
    install_count: int = Field(default=0, description="Total installs from skills.sh")
    relevance_score: float = Field(default=0.0, description="Ranking score (higher = more relevant)")
    content: str | None = Field(default=None, description="Skill instructions in markdown")
    raw_content: str | None = Field(default=None, description="Original SKILL.md with frontmatter")
    metadata: dict[str, Any] = Field(default_factory=dict, description="Additional frontmatter fields")
    references: list[SkillReference] = Field(default_factory=list, description="Reference files")
    fetch_error: str | None = Field(default=None, description="Error message if fetch failed")

    @property
    def has_content(self) -> bool:
        """True if skill content was successfully fetched."""
        return self.content is not None
    
    @property
    def has_references(self) -> bool:
        """True if skill has reference files."""
        return len(self.references) > 0


class SearchResponse(BaseModel):
    """Response from a skill search."""
    
    query: str = Field(..., description="The search query that was executed")
    count: int = Field(..., description="Number of skills returned")
    skills: list[Skill] = Field(default_factory=list, description="Matching skills")
