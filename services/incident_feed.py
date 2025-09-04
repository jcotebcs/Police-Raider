"""
Service for fetching local CAD/911 incidents.

This module exposes :func:`get_incidents` which retrieves incident data from a
CAD (Computer-Aided Dispatch) feed. The function uses HTTP requests to query the
feed and returns a list of incident dictionaries.

The URL of the feed can be configured via the ``CAD_FEED_URL`` environment
variable and defaults to ``http://localhost:5000/incidents``.
"""

from __future__ import annotations

import json
import os
from typing import Any, Dict, List
from urllib import error, parse, request

CAD_FEED_URL = os.environ.get("CAD_FEED_URL", "http://localhost:5000/incidents")


def get_incidents(location: str) -> List[Dict[str, Any]]:
    """Return CAD/911 incidents near the given location.

    Parameters
    ----------
    location: str
        A textual description (e.g., address or city) used to filter incidents.

    Returns
    -------
    List[Dict[str, Any]]
        A list of incident records. An empty list is returned when the feed
        is unreachable or returns no incidents.
    """
    params = parse.urlencode({"location": location})
    url = f"{CAD_FEED_URL}?{params}"

    try:
        with request.urlopen(url, timeout=10) as response:
            raw = response.read().decode("utf-8")
        data = json.loads(raw)
        if isinstance(data, dict):
            return data.get("incidents", [])
        if isinstance(data, list):
            return data
        return []
    except (error.URLError, json.JSONDecodeError):
        return []

