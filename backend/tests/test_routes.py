from fastapi.testclient import TestClient

import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__) + "/.."))
from main import app


client = TestClient(app)


def test_get_characters_works():
    payload = {"test_number": "1"}
    response = client.post("/get-characters", json=payload)

    assert response.status_code == 200
    assert response.json()['characters'][0] == {'index': '1', 'simplified': '八', 'traditional': '八', 'pinyin': 'bā', 'english': 'eight', 'hint': 'First tone'}


def test_file_not_found_get_characters():
    payload = {"test_number": "17"}
    response = client.post("/get-characters", json=payload)

    assert response.status_code == 404
    assert response.json()['detail'] == 'File not found.'


def test_check_password_works():
    payload = {"username": "test", "password": "test"}
    response = client.post("/check-password", json=payload)

    assert response.status_code == 200
    assert response.json() == {"name": "test_person", "group": "a", "test": "pre"}


def test_check_username_and_password_is_invalid():
    payload = {"username": "test", "password": "none"}
    response = client.post("/check-password", json=payload)

    assert response.status_code == 401
    assert response.json()["detail"] == 'Invalid username or password'

    payload = {"username": "none", "password": "test"}
    response = client.post("/check-password", json=payload)

    assert response.status_code == 401
    assert response.json()["detail"] == 'Invalid username or password'


