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
    assert response.json() == {"message": "Welcome to the Mandarin Research API!"}


def test_get_characters_success(monkeypatch):
    monkeypatch.setattr(
        main_module,
        "get_characters_from_curriculum",
        lambda test_number: {"characters": [{"index": "1", "simplified": "八"}]},
    )

    response = client.post("/get-characters", json={"test_number": "1"})

    assert response.status_code == 200
    assert response.json() == {"characters": [{"index": "1", "simplified": "八"}]}


def test_get_characters_returns_404_when_missing(monkeypatch):
    def _raise(_):
        raise FileNotFoundError("File not found")

    monkeypatch.setattr(main_module, "get_characters_from_curriculum", _raise)

    response = client.post("/get-characters", json={"test_number": "404"})

    assert response.status_code == 404
    assert response.json()["detail"] == "File not found"


def test_check_password_returns_401_for_invalid_credentials(monkeypatch):
    def _raise(_, __):
        raise PermissionError("Invalid username or password")

    monkeypatch.setattr(main_module, "authenticate_user", _raise)

    response = client.post("/check-password", json={"username": "u", "password": "p"})

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"


def test_save_accuracy_returns_422_on_value_error(monkeypatch):
    def _raise(*_):
        raise ValueError("Accuracy must be between 0 and 100")

    monkeypatch.setattr(main_module, "save_pitch_accuracy", _raise)

    response = client.post(
        "/save-accuracy",
        json={"user_id": 1, "test": "1", "accuracy": 101, "array_number": "1"},
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "Accuracy must be between 0 and 100"


def test_dtw_returns_422_on_validation_error(monkeypatch):
    def _raise(*_):
        raise ValueError("Unable to detect audio. Try recording again.")

    monkeypatch.setattr(main_module, "dtw", _raise)

    payload = {
        "reference_pitch": {"frequency": [0.1, 0.2], "time": [0.1, 0.2]},
        "user_pitch": {"frequency": [0.1, 0.2], "time": [0.1, 0.2]},
        "test": "1",
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


def test_clone_returns_422_on_value_error(monkeypatch):
    async def _raise(*_):
        raise ValueError("Audio files are required")

    monkeypatch.setattr(main_module, "shift_audio", _raise)

    response = client.post(
        "/clone",
        files={
            "reference": ("ref.wav", b"ref", "audio/wav"),
            "user": ("user.wav", b"user", "audio/wav"),
        },
    )

    assert response.status_code == 422
    assert response.json()["detail"] == "Audio files are required"
