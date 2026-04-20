from fastapi.testclient import TestClient

import sys
import os

sys.path.append(os.path.abspath(os.path.dirname(__file__) + "/.."))
from main import app


client = TestClient(app)


def test_get_characters_works():
    payload = {"lesson_id": "1"}
    response = client.post("/get-characters", json=payload)

    assert response.status_code == 200
    assert response.json()["characters"][0] == {
        "index": "1",
        "curriculumId": "1",
        "simplified": "八",
        "traditional": "八",
        "pinyin": "bā",
        "english": "eight",
        "hint": "First tone",
    }


def test_file_not_found_get_characters():
    payload = {"lesson_id": "17"}
    response = client.post("/get-characters", json=payload)

    assert response.status_code == 404
    assert response.json()["detail"] == "File not found"


def test_missing_lesson_id_returns_422():
    response = client.post("/get-characters", json={})

    assert response.status_code == 422
    assert response.json()["detail"] == "Lesson ID is required."
