# Backend (Python API)

This directory contains the Python backend for Mandarin Tone Lab.

## Main Entry

- `backend/main.py` starts the API.

## Requirements

- Python 3.10+
- `ffmpeg`

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python -m uvicorn main:app --reload --port 8000
```

## Tests

```bash
pytest
```

## Notes

- Curriculum CSVs live in `backend/curriculum/`.
- API routes live in `backend/routes/`.
- The Vosk model is downloaded automatically the first time transcription is used.
