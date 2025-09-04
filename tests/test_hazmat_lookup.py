from services.hazmat_lookup import lookup


def test_lookup_existing():
    data = lookup("1203")
    assert data is not None
    assert data["proper_shipping_name"] == "Gasoline"
    assert data["hazard_class"] == "3"


def test_lookup_missing():
    assert lookup("9999") is None
