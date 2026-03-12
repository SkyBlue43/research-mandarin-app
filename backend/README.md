# Backend (Python API)

This directory contains the Python backend for Mandarin Tone Lab.

## Main Entry

- `backend/main.py` starts the API.

## Requirements

- Python 3.10+

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
python main.py
```

## Tests

```bash
pytest
```

## Notes

- Curriculum CSVs live in `backend/curriculum/`.
- API routes live in `backend/routes/`.
