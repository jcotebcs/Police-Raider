import requests

FDA_API_URL = "https://api.fda.gov/drug/label.json"


def check_interaction(drug1: str, drug2: str) -> dict:
    """Check for potential interactions between two drugs using the FDA API.

    Parameters
    ----------
    drug1 : str
        Name of the first drug.
    drug2 : str
        Name of the second drug.

    Returns
    -------
    dict
        Dictionary containing keys:
        - "interaction" (bool): True if an interaction is found.
        - "details" (str): Description of interaction or reason for failure.
    """
    params = {
        "search": f'openfda.generic_name:"{drug1}"+AND+drug_interactions:"{drug2}"',
        "limit": 1,
    }

    try:
        response = requests.get(FDA_API_URL, params=params, timeout=10)
        response.raise_for_status()
    except requests.RequestException as exc:
        return {"interaction": False, "details": f"API request failed: {exc}"}

    data = response.json()
    results = data.get("results") or []
    if not results:
        return {"interaction": False, "details": "No interaction data found."}

    interactions = results[0].get("drug_interactions", [])
    if interactions:
        return {"interaction": True, "details": interactions[0]}
    return {"interaction": True, "details": "Interaction found but no details provided."}
