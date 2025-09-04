import json
from datetime import datetime, timezone
from pathlib import Path
import sys

import pytest

# Ensure the package under test is importable when tests are executed from the
# ``tests`` directory.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from quota.reset_detector import detect_reset


def test_detect_reset_updates_config(tmp_path):
    config_file = tmp_path / "quotas.json"
    headers = {"X-RateLimit-Reset": "1700000000"}
    returned = detect_reset(headers, service="api", config_path=config_file)

    with open(config_file, "r", encoding="utf-8") as fh:
        data = json.load(fh)

    expected = datetime.fromtimestamp(1700000000, tz=timezone.utc)
    expected_iso = expected.isoformat().replace("+00:00", "Z")

    assert returned == expected
    assert data["api"]["reset"] == expected_iso


def test_detect_reset_missing_header(tmp_path):
    config_file = tmp_path / "quotas.json"
    headers = {}
    assert detect_reset(headers, config_path=config_file) is None
    assert not config_file.exists()
