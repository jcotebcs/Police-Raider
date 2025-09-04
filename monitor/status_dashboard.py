"""Status dashboard for API keys and quotas."""

from __future__ import annotations

import json
from pathlib import Path

from tabulate import tabulate

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "config"


def _load_json(path: Path) -> dict:
    with path.open("r", encoding="utf-8") as f:
        return json.load(f)


def main() -> None:
    """Load API keys and quota metadata then print a table."""
    api_keys_path = CONFIG_DIR / "api_keys.json"
    quota_path = CONFIG_DIR / "quota_metadata.json"

    api_keys = _load_json(api_keys_path)
    quota_meta = _load_json(quota_path)

    rows = []
    for service, key in api_keys.items():
        quota = quota_meta.get(service, {})
        rows.append(
            [
                service,
                key,
                quota.get("used", "N/A"),
                quota.get("limit", "N/A"),
            ]
        )

    print(tabulate(rows, headers=["Service", "API Key", "Used", "Limit"]))


if __name__ == "__main__":  # pragma: no cover - CLI entry point
    main()
