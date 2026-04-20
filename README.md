# Mandarin Tone Lab

This repo contains a self-contained Mandarin tone practice app, split into a Next.js frontend and a Python backend. It is set up to run locally without a database or account system.

## Project Layout

- `frontend/`: Next.js app (UI, client-side logic)
- `backend/`: Python API + processing (audio, scoring, curriculum)

## Requirements

- Node.js + pnpm (frontend)
- Python 3.10+ (backend)
- `ffmpeg` available on your `PATH` for audio conversion in the backend

## Environment

The frontend defaults to `http://localhost:8000` for the backend, so `frontend/.env.local` is optional for standard local use. You only need it if your backend runs somewhere else:

```bash
# frontend/.env.local
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

## Run Locally

### 1) Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2) Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

## First Run Notes

- The backend downloads the Mandarin Vosk speech model the first time you use transcription. That initial run can take a while depending on your connection.
- Reference lesson audio is served from the backend at `/sounds/*`.

## Tests

### Backend

```bash
cd backend
pytest
```

### Frontend

```bash
cd frontend
pnpm lint
```

## Notes

- Curriculum CSVs live in `backend/curriculum/`.
- Audio and alignment logic runs in the backend.
- Reference audio and transcript assets are bundled in the repo.
