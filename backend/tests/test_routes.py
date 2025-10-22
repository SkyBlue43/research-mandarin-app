from fastapi.testclient import TestClient
from backend.main import app  # make sure this path matches where your main FastAPI app is

# Create a TestClient using your FastAPI app
client = TestClient(app)

def test_get_characters_work():
    payload = {"test_number": "1"}
    response = client.post("/get-characters", json=payload)

    assert response.status_code == 200
    assert response.json()['characters'][0] == {'index': '1', 'simplified': '八', 'traditional': '八', 'pinyin': 'bā', 'english': 'eight', 'hint': 'First tone'}

def test_file_not_found():
    payload = {"test_number": "17"}
    response = client.post("/get-characters", json=payload)

    assert response.status_code == 404
    assert 'File not found.' == response.json()['detail']