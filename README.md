# Mandarin Tone Lab

This repo contains a self-contained Mandarin tone practice app, split into a Next.js frontend and a Python backend. It is set up to run locally without a database or account system.

## Project Layout

- `frontend/`: Next.js app (UI, client-side logic)
- `backend/`: Python API + processing (audio, scoring, curriculum)

## Requirements

- Node.js + pnpm (frontend)
- Python 3.10+ (backend)

## Environment

The only environment setting you typically need is the frontend backend URL:

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
python main.py
```

### 2) Frontend

```bash
cd frontend
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

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
pnpm test
```

## Notes

- Curriculum CSVs live in `backend/curriculum/`.
- Audio and alignment logic runs in the backend.
- Reference audio and transcript assets are bundled in the repo.
