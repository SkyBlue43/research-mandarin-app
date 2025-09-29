import pytest
from fastapi.testclient import TestClient
from main import app  # or wherever you define your FastAPI app

client = TestClient(app)

def test_check_password():
    response = client.post("/check-password/", json={"password": None})
    assert response.status_code == 200
    assert response.json() is None