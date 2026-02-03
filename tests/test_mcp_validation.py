"""
Tests for MCP server input validation.

These tests verify the bug fixes for input validation and error handling
discovered through Bellwether MCP testing.
"""

import pytest

# Import the constants and validation logic
# We test the validation by importing the module and checking the logic
from src.mcp_server import MAX_QUERY_LENGTH, MAX_SOURCE_LENGTH, MAX_SKILL_ID_LENGTH


class TestInputValidationConstants:
    """Test that validation constants are properly defined."""

    def test_max_query_length_is_reasonable(self):
        """Query length limit should be reasonable for natural language queries."""
        assert MAX_QUERY_LENGTH == 500
        assert MAX_QUERY_LENGTH > 100  # Allow reasonable queries
        assert MAX_QUERY_LENGTH < 10000  # But not unbounded

    def test_max_source_length_is_reasonable(self):
        """Source length should accommodate owner/repo format."""
        assert MAX_SOURCE_LENGTH == 200
        # GitHub username max is 39, repo name max is 100
        assert MAX_SOURCE_LENGTH > 140  # 39 + 1 + 100

    def test_max_skill_id_length_is_reasonable(self):
        """Skill ID length should accommodate typical identifiers."""
        assert MAX_SKILL_ID_LENGTH == 200


class TestSearchSkillsValidation:
    """Test search_skills input validation."""

    @pytest.mark.asyncio
    async def test_empty_query_returns_error(self):
        """Empty query should return clear error, not timeout."""
        from src.mcp_server import search_skills, _service

        # Skip if service not initialized (unit test without full setup)
        result = await search_skills(query="", limit=5)
        assert "error" in result
        assert "empty" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_whitespace_query_returns_error(self):
        """Whitespace-only query should return clear error."""
        from src.mcp_server import search_skills

        result = await search_skills(query="   ", limit=5)
        assert "error" in result
        assert "empty" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_query_too_long_returns_error(self):
        """Query exceeding max length should return clear error."""
        from src.mcp_server import search_skills

        long_query = "x" * (MAX_QUERY_LENGTH + 1)
        result = await search_skills(query=long_query, limit=5)
        assert "error" in result
        assert "too long" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_limit_zero_is_allowed(self):
        """limit=0 should be allowed (for 'check if exists' use case)."""
        from src.mcp_server import search_skills

        # This should not error on the limit validation
        # (it may error on service not initialized, but not on limit)
        result = await search_skills(query="test", limit=0)
        # If service not initialized, we get that error, not a limit error
        if "error" in result:
            assert "limit" not in result["error"].lower()


class TestGetSkillValidation:
    """Test get_skill input validation."""

    @pytest.mark.asyncio
    async def test_empty_source_returns_error(self):
        """Empty source should return clear error."""
        from src.mcp_server import get_skill

        result = await get_skill(source="", skill_id="test-skill")
        assert "error" in result
        assert "empty" in result["error"].lower() or "cannot be empty" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_source_without_slash_returns_error(self):
        """Source without owner/repo format should return error."""
        from src.mcp_server import get_skill

        result = await get_skill(source="invalid-source", skill_id="test-skill")
        assert "error" in result
        assert "format" in result["error"].lower() or "owner/repo" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_empty_skill_id_returns_error(self):
        """Empty skill_id should return clear error."""
        from src.mcp_server import get_skill

        result = await get_skill(source="owner/repo", skill_id="")
        assert "error" in result
        assert "empty" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_source_too_long_returns_error(self):
        """Source exceeding max length should return error."""
        from src.mcp_server import get_skill

        long_source = "x" * (MAX_SOURCE_LENGTH + 1)
        result = await get_skill(source=long_source, skill_id="test")
        assert "error" in result
        assert "too long" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_skill_id_too_long_returns_error(self):
        """Skill ID exceeding max length should return error."""
        from src.mcp_server import get_skill

        long_skill_id = "x" * (MAX_SKILL_ID_LENGTH + 1)
        result = await get_skill(source="owner/repo", skill_id=long_skill_id)
        assert "error" in result
        assert "too long" in result["error"].lower()

    @pytest.mark.asyncio
    async def test_valid_source_format_accepted(self):
        """Valid owner/repo format should pass validation."""
        from src.mcp_server import get_skill

        # This should pass validation and fail only on service/not-found
        result = await get_skill(source="valid-owner/valid-repo", skill_id="test-skill")
        if "error" in result:
            # Should not be a format error
            assert "format" not in result["error"].lower()
            assert "owner/repo" not in result["error"].lower()
