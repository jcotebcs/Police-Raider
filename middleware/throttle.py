"""Throttle middleware for requests sessions.

This module provides :class:`ThrottleSession`, which wraps ``requests.Session``
adding simple throttling based on a configurable quota.  The quota
configuration is stored in ``config/quotas.json`` and is expected to contain
``limit`` and ``period`` keys representing the maximum number of requests
per time period (in seconds).

The implementation is intentionally lightweight and only enforces a single
quota for all requests issued through the session.  It relies on a
``collections.deque`` of timestamps and will sleep as necessary to avoid
exceeding the configured quota.
"""

from __future__ import annotations

import json
import time
from collections import deque
from pathlib import Path
from threading import Lock
from typing import Any

import requests

# Location of the quota configuration file relative to this module
DEFAULT_QUOTA_FILE = Path(__file__).resolve().parent.parent / "config" / "quotas.json"


class ThrottleSession(requests.Session):
    """``requests.Session`` that enforces a simple request quota.

    Parameters
    ----------
    quota_file:
        Path to a JSON file containing ``limit`` and ``period`` values.  If not
        provided, ``config/quotas.json`` relative to the project root is used.
    """

    def __init__(self, quota_file: Path | str | None = None, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        self.quota_file = Path(quota_file) if quota_file else DEFAULT_QUOTA_FILE
        self._lock = Lock()
        self._load_quota()
        self._request_times: deque[float] = deque()

    def _load_quota(self) -> None:
        """Load quota configuration from ``self.quota_file``."""
        try:
            with self.quota_file.open("r", encoding="utf-8") as fh:
                data = json.load(fh)
        except FileNotFoundError:
            # Fall back to a permissive default if no file is present
            data = {"limit": 1_000_000, "period": 1}

        self.limit = int(data.get("limit", 1_000_000))
        self.period = float(data.get("period", 1))

    # Overriding ``request`` ensures throttling applies to all HTTP verbs.
    def request(self, method: str, url: str, *args: Any, **kwargs: Any) -> requests.Response:  # type: ignore[override]
        with self._lock:
            self._throttle()
        return super().request(method, url, *args, **kwargs)

    def _throttle(self) -> None:
        """Sleep if performing the next request would exceed the quota."""
        now = time.time()
        # Remove timestamps that are outside the quota window
        while self._request_times and self._request_times[0] <= now - self.period:
            self._request_times.popleft()

        if len(self._request_times) >= self.limit:
            sleep_time = self.period - (now - self._request_times[0])
            if sleep_time > 0:
                time.sleep(sleep_time)
            # After sleeping, purge expired timestamps again
            now = time.time()
            while self._request_times and self._request_times[0] <= now - self.period:
                self._request_times.popleft()

        self._request_times.append(time.time())


__all__ = ["ThrottleSession"]
