from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Mapping, Optional

# Default location of the quotas configuration file
CONFIG_PATH = Path(__file__).resolve().parent.parent / "config" / "quotas.json"


def detect_reset(
    headers: Mapping[str, str],
    service: str = "default",
    config_path: Path = CONFIG_PATH,
) -> Optional[datetime]:
    """Update quota reset timestamps based on HTTP headers.

    Parameters
    ----------
    headers:
        Mapping of HTTP headers from a response.
    service:
        Identifier for the service or endpoint whose quota is being updated.
    config_path:
        Path to the quotas configuration JSON file.

    Returns
    -------
    datetime | None
        The parsed reset timestamp if the header was present and valid,
        otherwise ``None``.
    """
    reset_str = headers.get("X-RateLimit-Reset")
    if not reset_str:
        return None

    try:
        reset_ts = int(reset_str)
    except (TypeError, ValueError):
        return None

    reset_time = datetime.fromtimestamp(reset_ts, tz=timezone.utc)

    if config_path.exists():
        with open(config_path, "r", encoding="utf-8") as fh:
            data = json.load(fh)
    else:
        data = {}

    service_info = data.get(service, {})
    service_info["reset"] = reset_time.isoformat().replace("+00:00", "Z")
    data[service] = service_info

    config_path.parent.mkdir(parents=True, exist_ok=True)
    with open(config_path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, sort_keys=True)

    return reset_time
