"""Offline dataset cache and retrieval utilities.

This module provides a small helper :class:`OfflineStore` that can download
reference datasets and serve them from the local filesystem.  The class is
used by the application when the ``--offline`` flag is supplied.  When the
flag is set the store will refuse network access and rely solely on the
cached copies stored on disk.

Two datasets are supported out of the box:

``HazMat``
    Hazardous materials table.  For demonstration purposes this module
    downloads a small CSV file from the ``seaborn-data`` repository.  The
    actual application can override the URL mapping if required.

``DOT``
    Department of Transportation sample dataset.  Again a small CSV file from
    ``seaborn-data`` is used.

The design intentionally keeps the surface area minimal so it can be easily
mocked during testing.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict

import requests


# ---------------------------------------------------------------------------
# Dataset metadata
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class Dataset:
    """Metadata required to download and cache a dataset."""

    name: str
    url: str
    filename: str


DATASETS: Dict[str, Dataset] = {
    "HazMat": Dataset(
        name="HazMat",
        url="https://raw.githubusercontent.com/mwaskom/seaborn-data/master/tips.csv",
        filename="hazmat.csv",
    ),
    "DOT": Dataset(
        name="DOT",
        url="https://raw.githubusercontent.com/mwaskom/seaborn-data/master/flights.csv",
        filename="dot.csv",
    ),
}


class OfflineStore:
    """A tiny helper for downloading datasets and serving them from disk.

    Parameters
    ----------
    data_dir:
        Directory where datasets should be cached.  By default a ``datasets``
        folder next to this module is used.
    offline:
        When ``True`` the store will not attempt any network access and will
        raise a :class:`RuntimeError` if the dataset is missing locally.
    """

    def __init__(self, data_dir: Path | None = None, *, offline: bool = False):
        self.data_dir = Path(data_dir) if data_dir is not None else Path(__file__).resolve().parent / "datasets"
        self.offline = offline
        self.data_dir.mkdir(parents=True, exist_ok=True)

    # ------------------------------------------------------------------
    # public API
    # ------------------------------------------------------------------
    def get_path(self, name: str) -> Path:
        """Return a local file path for ``name``.

        If the dataset is not cached locally it will be downloaded unless the
        store is operating in offline mode.
        """

        dataset = DATASETS.get(name)
        if dataset is None:
            raise KeyError(f"Unknown dataset: {name!r}")

        path = self.data_dir / dataset.filename
        if path.exists():
            return path

        if self.offline:
            raise RuntimeError(
                f"Dataset {name!r} not available in offline mode. Run once without"
                " --offline to download it."
            )

        self._download(dataset, path)
        return path

    # ------------------------------------------------------------------
    # internal helpers
    # ------------------------------------------------------------------
    def _download(self, dataset: Dataset, path: Path) -> None:
        """Download ``dataset`` to ``path``."""

        response = requests.get(dataset.url, timeout=30)
        response.raise_for_status()
        path.write_bytes(response.content)


__all__ = ["OfflineStore", "DATASETS", "Dataset"]
