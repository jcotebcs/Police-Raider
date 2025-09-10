"""Service routing with failover support."""

from importlib import import_module
import json
from pathlib import Path

FAILOVER_CONFIG = Path(__file__).resolve().parents[1] / "config" / "failover.json"

def route(service_category: str):
    """Route to the service for ``service_category``.

    The function first attempts to use the primary service whose module name
    matches ``service_category``. If that fails, it iterates over failover
    services defined in :mod:`config/failover.json`.

    Parameters
    ----------
    service_category:
        Name of the service category to route to.

    Returns
    -------
    Any
        The result returned by the first successfully called service handler.

    Raises
    ------
    RuntimeError
        If all services fail to handle the request.
    """

    # Load failover configuration
    try:
        with FAILOVER_CONFIG.open("r", encoding="utf-8") as fh:
            failover = json.load(fh)
    except FileNotFoundError as exc:
        raise RuntimeError("Failover configuration missing") from exc

    # Primary service is the first candidate
    services_to_try = [service_category]
    services_to_try.extend(failover.get(service_category, []))

    last_exc = None
    for service_name in services_to_try:
        try:
            module = import_module(f"services.{service_name}")
            handler = getattr(module, "handle")
            return handler()
        except Exception as exc:  # pragma: no cover - runtime behavior
            last_exc = exc
            continue

    raise RuntimeError(
        f"All services for {service_category!r} failed"
    ) from last_exc
