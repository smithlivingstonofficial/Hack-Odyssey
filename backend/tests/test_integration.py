"""
Integration tests for the unified Climate Property Intelligence & XGBoost ML API.
"""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_root_endpoint():
    res = client.get("/")
    assert res.status_code == 200
    data = res.json()
    assert "Tamil Nadu Climate" in data["message"]


def test_predict_harishraja_contract():
    payload = {
        "district": "Pudukkottai",
        "city": "Pudukkottai",
        "latitude": 10.3797,
        "longitude": 78.8208,
        "area_sqft": 1200,
        "market_rate_per_sqft": 2800,
    }
    res = client.post("/predict", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["valuation"]["base_value"] == 3360000.0
    assert data["valuation"]["risk_score"] == 0.293
    assert data["risk_breakdown"]["cyclone_intensity"] == 0.714
    assert data["risk_breakdown"]["heat_risk"] == 0.501
    assert data["data_sources"]["heat"] == "exact_block"
    assert data["data_sources"]["cyclone"] == "historical_track_100km"
    assert "Flood" in data["available_factors"]


def test_analyze_enterprise_endpoint():
    payload = {
        "latitude": 12.9815,
        "longitude": 80.2180,
        "property_type": "residential",
        "area_sqft": 1500,
        "market_rate_per_sqft": 6500,
        "address": "Velachery, Chennai, Tamil Nadu",
    }
    res = client.post("/api/v1/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["overall_risk_score"] > 0
    assert data["valuation"]["base_value_inr"] > 0
    assert data["valuation"]["adjusted_value_inr"] > 0
    assert data["valuation"]["ml_predicted_base_value"] is not None
    assert len(data["risk_scores"]) >= 3


if __name__ == "__main__":
    print("Running integration tests...")
    test_root_endpoint()
    print("✓ test_root_endpoint passed")
    test_predict_harishraja_contract()
    print("✓ test_predict_harishraja_contract passed")
    test_analyze_enterprise_endpoint()
    print("✓ test_analyze_enterprise_endpoint passed")
    print("\nALL INTEGRATION TESTS PASSED PERFECTLY!")
