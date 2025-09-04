"""Lookup hazardous material information using PHMSA dataset.

This module loads the Hazardous Materials Table published by PHMSA
(Pipeline and Hazardous Materials Safety Administration) from a local
CSV file.  If the file is missing it will attempt to download it from a
configured URL and cache it locally.  The dataset is then queried by
UN/NA number to obtain details about a material.
"""
from __future__ import annotations

from functools import lru_cache
from pathlib import Path
import csv
from typing import Dict, Optional

try:  # requests is not part of the standard library but may be available
    import requests  # type: ignore
except Exception:  # pragma: no cover - requests may not be installed
    requests = None

# Location of the cached dataset relative to repository root
DATA_FILE = Path(__file__).resolve().parent.parent / "data" / "phmsa_hazmat.csv"

# Public URL for the PHMSA dataset.  This may change over time.  The value
# here is primarily used as a fall back if the local cache is missing.
PHMSA_DATA_URL = (
    "https://www.phmsa.dot.gov/sites/phmsa.dot.gov/files/2024-05/"
    "Hazmat%20Table%20-%2005.10.2024.csv"
)


def _ensure_data_file() -> Path:
    """Ensure that the hazmat dataset exists locally.

    If the dataset is not present locally and the :mod:`requests`
    dependency is available, the file will be downloaded from
    ``PHMSA_DATA_URL`` and saved to :data:`DATA_FILE`.

    Returns
    -------
    Path
        Path to the dataset CSV file.
    """
    if DATA_FILE.exists():
        return DATA_FILE

    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)

    if requests is None:  # pragma: no cover - download is optional
        raise FileNotFoundError(
            f"Dataset not found at {DATA_FILE} and 'requests' is unavailable"
        )

    # Attempt to download the dataset
    try:  # pragma: no cover - network access may be disabled
        resp = requests.get(PHMSA_DATA_URL, timeout=30)
        resp.raise_for_status()
        DATA_FILE.write_bytes(resp.content)
        return DATA_FILE
    except Exception as exc:  # pragma: no cover - network failure
        raise FileNotFoundError(
            f"Unable to download PHMSA dataset from {PHMSA_DATA_URL!r}: {exc}"
        ) from exc


@lru_cache()
def _load_dataset() -> Dict[str, Dict[str, str]]:
    """Load the hazmat dataset into memory.

    Returns
    -------
    Dict[str, Dict[str, str]]
        Mapping of UN/NA number (as zero-padded four character string)
        to the associated row from the dataset.
    """
    path = _ensure_data_file()
    data: Dict[str, Dict[str, str]] = {}
    with path.open(newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            key = row.get("un_na")
            if not key:
                continue
            key = key.strip().zfill(4)
            data[key] = row
    return data


def lookup(un_na_number: str | int) -> Optional[Dict[str, str]]:
    """Retrieve chemical details for a given UN/NA number.

    Parameters
    ----------
    un_na_number:
        Identification number assigned by the United Nations or North
        America (UN/NA).  The value can be provided as an ``int`` or
        ``str``.  It will be normalized to a 4-digit string for lookup.

    Returns
    -------
    dict or None
        A dictionary of chemical details if the number exists in the
        dataset, otherwise ``None``.
    """
    key = str(un_na_number).strip().zfill(4)
    return _load_dataset().get(key)


__all__ = ["lookup"]
