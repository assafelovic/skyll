"""
Pydantic models for skills and API request/response schemas.

These models define the structured JSON format for skill data,
optimized for LLM consumption with clear, typed fields.
"""

from typing import Any

from pydantic import BaseModel, Field


class SkillReference(BaseModel):
    """
    A reference/resource file associated with a skill.
    
    Many skills include additional documentation in references/ or resources/
    directories. These provide deeper context and examples.
    """
    
    name: str = Field(
        ...,
        description="Filename of the reference",
        examples=["js-lists-flatlist-flashlist.md"],
    )
    path: str = Field(
        ...,
        description="Full path in the repository",
        examples=["skills/react-native-best-practices/references/js-lists-flatlist-flashlist.md"],
    )
    content: str | None = Field(
        default=None,
        description="Full markdown content of the reference file",
    )
    raw_url: str | None = Field(
        default=None,
        description="Direct URL to fetch the raw content",
    )


class SkillRefs(BaseModel):
    """
    Reference URLs for a skill.
    
    Provides direct links to view the skill in various contexts.
    """

    skills_sh: str = Field(
        ...,
        description="Skills.sh marketplace page URL",
        examples=["https://skills.sh/vercel-labs/agent-skills/vercel-react-best-practices"],
    )
    github: str = Field(
        ...,
        description="GitHub repository URL (best guess based on common paths)",
        examples=["https://github.com/vercel-labs/agent-skills/tree/main/skills/vercel-react-best-practices"],
    )
    raw: str | None = Field(
        default=None,
        description="Direct raw content URL if successfully fetched",
        examples=["https://raw.githubusercontent.com/vercel-labs/agent-skills/main/skills/vercel-react-best-practices/SKILL.md"],
    )


class Skill(BaseModel):
    """
    A complete agent skill with parsed metadata and content.
    
    This is the primary response object, containing all information
    an LLM needs to understand and use a skill.
    
    Attributes:
        id: Unique skill identifier (slug format)
        title: Human-readable skill name from frontmatter
        description: What the skill does and when to use it
        version: Semantic version if specified
        allowed_tools: List of tools the skill can use (e.g., ["Bash", "Read", "Write"])
        source: GitHub owner/repo where the skill lives
        refs: URLs for viewing the skill
        install_count: Number of installs from skills.sh telemetry
        relevance_score: Ranking score (currently = install_count, future = semantic)
        content: Full markdown content (excluding frontmatter)
        raw_content: Original raw SKILL.md including frontmatter
        metadata: Additional frontmatter fields not in standard schema
        fetch_error: Error message if content couldn't be fetched
    """

    id: str = Field(
        ...,
        description="Skill identifier/slug",
        examples=["vercel-react-best-practices"],
    )
    title: str = Field(
        ...,
        description="Skill display name",
        examples=["vercel-react-best-practices"],
    )
    description: str | None = Field(
        default=None,
        description="What the skill does and when to use it",
        examples=["React and Next.js performance optimization guidelines from Vercel Engineering"],
    )
    version: str | None = Field(
        default=None,
        description="Semantic version",
        examples=["1.0.0"],
    )
    allowed_tools: list[str] | None = Field(
        default=None,
        description="Tools the skill is allowed to use",
        examples=[["Bash", "Read", "Write"]],
    )
    source: str = Field(
        ...,
        description="GitHub owner/repo",
        examples=["vercel-labs/agent-skills"],
    )
    refs: SkillRefs = Field(
        ...,
        description="Reference URLs for viewing the skill",
    )
    install_count: int = Field(
        default=0,
        description="Total installs from skills.sh",
        examples=[74200],
    )
    relevance_score: float = Field(
        default=0.0,
        description="Ranking score (higher = more relevant). Currently based on install count.",
        examples=[74200.0],
    )
    content: str | None = Field(
        default=None,
        description="Skill instructions in markdown (frontmatter removed)",
    )
    raw_content: str | None = Field(
        default=None,
        description="Original SKILL.md content including frontmatter",
    )
    metadata: dict[str, Any] = Field(
        default_factory=dict,
        description="Additional frontmatter fields",
    )
    references: list[SkillReference] = Field(
        default_factory=list,
        description="Additional reference/resource files associated with this skill",
    )
    fetch_error: str | None = Field(
        default=None,
        description="Error message if content fetch failed",
    )

    @property
    def has_content(self) -> bool:
        """True if skill content was successfully fetched."""
        return self.content is not None
    
    @property
    def has_references(self) -> bool:
        """True if skill has reference files."""
        return len(self.references) > 0


class SearchRequest(BaseModel):
    """
    Request schema for POST /search endpoint.
    
    Provides more control than GET query parameters.
    """

    query: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Search query",
        examples=["react performance optimization"],
    )
    limit: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Maximum number of results",
    )
    include_content: bool = Field(
        default=True,
        description="Whether to fetch full SKILL.md content",
    )
    include_raw: bool = Field(
        default=False,
        description="Include raw SKILL.md with frontmatter in response",
    )
    include_references: bool = Field(
        default=False,
        description="Fetch reference files (in references/, resources/ directories)",
    )


class SearchResponse(BaseModel):
    """
    Response schema for skill search.
    
    Contains query metadata and list of matching skills.
    """

    query: str = Field(
        ...,
        description="The search query that was executed",
    )
    count: int = Field(
        ...,
        description="Number of skills returned",
    )
    skills: list[Skill] = Field(
        default_factory=list,
        description="Matching skills sorted by relevance_score (descending)",
    )


class HealthResponse(BaseModel):
    """Health check response."""

    status: str = Field(default="healthy")
    version: str = Field(default="0.1.0")
    cache_stats: dict[str, Any] | None = Field(default=None)


class ErrorResponse(BaseModel):
    """Error response for API errors."""

    error: str = Field(..., description="Error type")
    message: str = Field(..., description="Human-readable error message")
    detail: str | None = Field(default=None, description="Additional details")
