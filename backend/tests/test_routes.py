from fastapi.testclient import TestClient
from backend.main import app  # make sure this path matches where your main FastAPI app is

# Create a TestClient using your FastAPI app
client = TestClient(app)

def test_get_characters():
    # Step 3a: Prepare the data to send
    payload = {"test": "example input"}

    # Step 3b: Send a POST request to /get-characters
    response = client.post("/get-characters", json=payload)

    # Step 3c: Check that the server responds with status code 200
    assert response.status_code == 200

    # Step 3d: Check the returned JSON
    # Currently your route returns nothing, so it will be null
    assert response.json() is None