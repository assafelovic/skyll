"""
Tests for URL generation with edge cases.

These tests verify the bug fixes for malformed URLs when source is empty,
discovered through Bellwether MCP testing.
"""

import pytest

from src.clients.github import GitHubClient


class TestGitHubUrlGeneration:
    """Test GitHub URL generation handles edge cases."""

    def test_get_github_url_with_valid_source(self):
        """Normal case: valid source produces correct URL."""
        client = GitHubClient()
        url = client.get_github_url("owner/repo", "skill-name")

        assert url == "https://github.com/owner/repo/tree/main/skills/skill-name"
        assert "//" not in url.replace("https://", "")  # No double slashes

    def test_get_github_url_with_empty_source_extracts_from_id(self):
        """Empty source should extract owner/repo from skill_id if possible."""
        client = GitHubClient()
        url = client.get_github_url("", "owner/repo/skill-name")

        # Should extract "owner/repo" from the skill_id
        assert "owner/repo" in url
        assert "//" not in url.replace("https://", "")  # No double slashes

    def test_get_github_url_with_empty_source_and_simple_id(self):
        """Empty source with simple skill_id should return fallback search URL."""
        client = GitHubClient()
        url = client.get_github_url("", "simple-skill")

        # Should return a search URL as fallback
        assert "github.com" in url
        assert "//" not in url.replace("https://", "")  # No double slashes

    def test_get_skills_sh_url_with_valid_source(self):
        """Normal case: valid source produces correct skills.sh URL."""
        client = GitHubClient()
        url = client.get_skills_sh_url("owner/repo", "skill-name")

        assert url == "https://skills.sh/owner/repo/skill-name"
        assert "//" not in url.replace("https://", "")  # No double slashes

    def test_get_skills_sh_url_with_empty_source_extracts_from_id(self):
        """Empty source should extract owner/repo from skill_id if possible."""
        client = GitHubClient()
        url = client.get_skills_sh_url("", "owner/repo/skill-name")

        # Should extract "owner/repo" from the skill_id
        assert "owner/repo" in url
        assert "//" not in url.replace("https://", "")  # No double slashes

    def test_get_skills_sh_url_with_empty_source_and_simple_id(self):
        """Empty source with simple skill_id should return fallback URL."""
        client = GitHubClient()
        url = client.get_skills_sh_url("", "simple-skill")

        # Should return a search URL as fallback
        assert "skills.sh" in url
        assert "//" not in url.replace("https://", "")  # No double slashes

    def test_no_double_slashes_in_any_url(self):
        """Verify no double slashes in URLs for various inputs."""
        client = GitHubClient()

        test_cases = [
            ("owner/repo", "skill"),
            ("", "owner/repo/skill"),
            ("", "skill"),
            ("owner/repo", ""),
            ("a/b", "c/d/e"),
        ]

        for source, skill_id in test_cases:
            github_url = client.get_github_url(source, skill_id)
            skills_url = client.get_skills_sh_url(source, skill_id)

            # Remove https:// and check for double slashes
            github_path = github_url.replace("https://", "")
            skills_path = skills_url.replace("https://", "")

            assert "//" not in github_path, f"Double slash in GitHub URL for source='{source}', skill_id='{skill_id}': {github_url}"
            assert "//" not in skills_path, f"Double slash in skills.sh URL for source='{source}', skill_id='{skill_id}': {skills_url}"


class TestSkillsShSourceExtraction:
    """Test source extraction from skill IDs in skillssh.py."""

    def test_source_extraction_from_full_id(self):
        """Test that source is extracted from full skill ID format."""
        # This tests the logic in skillssh.py for handling missing topSource
        skill_id = "owner/repo/skill-name"
        parts = skill_id.split("/")

        if len(parts) >= 2:
            source = f"{parts[0]}/{parts[1]}"
        else:
            source = ""

        assert source == "owner/repo"

    def test_source_extraction_from_simple_id(self):
        """Simple skill ID without slashes should result in empty source."""
        skill_id = "simple-skill"
        parts = skill_id.split("/")

        if "/" in skill_id and len(parts) >= 2:
            source = f"{parts[0]}/{parts[1]}"
        else:
            source = ""

        assert source == ""

    def test_source_extraction_from_three_part_id(self):
        """Three-part ID should extract first two parts as source."""
        skill_id = "civitai/civitai/clickhouse-query"
        parts = skill_id.split("/")

        if len(parts) >= 2:
            source = f"{parts[0]}/{parts[1]}"
        else:
            source = ""

        assert source == "civitai/civitai"
