import os
from unittest.mock import patch

import pytest

from app.core.config import Settings, parse_cors


def test_parse_cors_json_string() -> None:
    """A JSON-like string starting with '[' is returned as-is for Pydantic to parse."""
    result = parse_cors('["http://localhost"]')
    assert result == '["http://localhost"]'


def test_parse_cors_list_passthrough() -> None:
    """A list input is returned as-is."""
    result = parse_cors(["http://a.com"])
    assert result == ["http://a.com"]


def test_parse_cors_invalid_type_raises() -> None:
    """Non-string, non-list input should raise ValueError."""
    with pytest.raises(ValueError):
        parse_cors(123)


def test_check_default_secret_raises_in_non_local() -> None:
    """Using default secret in staging/production should raise ValueError."""
    env_override = {
        k: v for k, v in os.environ.items() if k not in {"ENVIRONMENT", "SECRET_KEY"}
    }
    with patch.dict(os.environ, env_override, clear=True):
        with pytest.raises(ValueError, match="changethis"):
            Settings(
                ENVIRONMENT="staging",
                SECRET_KEY="changethis",
                POSTGRES_SERVER="localhost",
                POSTGRES_USER="postgres",
                POSTGRES_PASSWORD="safe_password",
                POSTGRES_DB="app_test",
                PROJECT_NAME="test",
                FIRST_SUPERUSER="admin@example.com",
                FIRST_SUPERUSER_PASSWORD="safe_password",
            )


def test_seed_sample_data_not_none_after_init() -> None:
    """SEED_SAMPLE_DATA should be resolved to a bool (not None) after Settings init."""
    from app.core.config import settings

    # Lines 113-114 are exercised during the global settings construction.
    # Verify the validator resolved the None default to a concrete bool.
    assert settings.SEED_SAMPLE_DATA is not None
    assert isinstance(settings.SEED_SAMPLE_DATA, bool)
