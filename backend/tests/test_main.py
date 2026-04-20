import os
import sys

from fastapi.testclient import TestClient


BACKEND_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
os.chdir(BACKEND_DIR)
sys.path.insert(0, BACKEND_DIR)

import main as main_module


client = TestClient(main_module.app)


def test_root_returns_welcome_message():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Mandarin Tone Practice API!"}


def test_get_characters_success(monkeypatch):
    monkeypatch.setattr(
        main_module,
        "get_characters_from_curriculum",
        lambda lesson_id: {"characters": [{"index": "1", "simplified": "八"}]},
    )

    response = client.post("/get-characters", json={"lesson_id": "1"})

    assert response.status_code == 200
    assert response.json() == {"characters": [{"index": "1", "simplified": "八"}]}


def test_get_characters_returns_404_when_missing(monkeypatch):
    def _raise(_):
        raise FileNotFoundError("File not found")

    monkeypatch.setattr(main_module, "get_characters_from_curriculum", _raise)

    response = client.post("/get-characters", json={"lesson_id": "404"})

    assert response.status_code == 404
    assert response.json()["detail"] == "File not found"


def test_get_characters_requires_lesson_id():
    response = client.post("/get-characters", json={})

    assert response.status_code == 422
    assert response.json()["detail"] == "Lesson ID is required."


def test_dtw_returns_422_on_validation_error(monkeypatch):
    def _raise(*_):
        raise ValueError("Unable to detect audio. Try recording again.")

    monkeypatch.setattr(main_module, "dtw", _raise)

    payload = {
        "reference_pitch": {"frequency": [0.1, 0.2], "time": [0.1, 0.2]},
        "user_pitch": {"frequency": [0.1, 0.2], "time": [0.1, 0.2]},
        "lesson_id": "1",
        "currentIndex": "1",
        "words_user": [{"char": "八", "start": 0.1, "end": 0.2}],
    }

    response = client.post("/dtw-characters", json=payload)

    assert response.status_code == 422
    assert response.json()["detail"] == "Unable to detect audio. Try recording again."


def test_analyze_audio_success(monkeypatch):
    monkeypatch.setattr(main_module, "analyze_given_audio", lambda _: {"pitch": [{"time": 0.1, "frequency": 0.3}]})

    response = client.post(
        "/analyze-audio",
        files={"file": ("sample.wav", b"bytes", "audio/wav")},
    )

    assert response.status_code == 200
    assert response.json() == {"pitch": [{"time": 0.1, "frequency": 0.3}]}


def test_analyze_audio_returns_422(monkeypatch):
    def _raise(_):
        raise ValueError("Unable to detect pitch from audio. Try recording again.")

    monkeypatch.setattr(main_module, "analyze_given_audio", _raise)

    response = client.post(
        "/analyze-audio",
        files={"file": ("bad.wav", b"bad", "audio/wav")},
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "Unable to detect pitch from audio. Try recording again."


def test_transcribe_success(monkeypatch):
    async def _mock_transcribe(file, phrase):
        return [{"char": "八", "start": 0.0, "end": 0.1}]

    monkeypatch.setattr(main_module, "transcribe_audio", _mock_transcribe)

    response = client.post(
        "/transcribe",
        files={"file": ("sample.mp3", b"bytes", "audio/mpeg")},
        data={"data": "八"},
    )

    assert response.status_code == 200
    assert response.json() == [{"char": "八", "start": 0.0, "end": 0.1}]


def test_transcribe_returns_500_for_runtime_error(monkeypatch):
    async def _raise(*_):
        raise RuntimeError("Unable to convert audio to WAV.")

    monkeypatch.setattr(main_module, "transcribe_audio", _raise)

    response = client.post(
        "/transcribe",
        files={"file": ("sample.mp3", b"bytes", "audio/mpeg")},
        data={"data": "八"},
    )

    assert response.status_code == 500
    assert response.json()["detail"] == "Unable to convert audio to WAV."
