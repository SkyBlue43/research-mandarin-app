# Mandarin Tone Lab (Research App)

This repo contains a research app for Mandarin tone practice, split into a Next.js frontend and a Python backend.

## Project Layout

- `frontend/`: Next.js app (UI, client-side logic)
- `backend/`: Python API + processing (audio, scoring, curriculum)

## Requirements

- Node.js + pnpm (frontend)
- Python 3.10+ (backend)

## Environment

You will likely need:

- `backend/.env` for backend secrets/config
- `frontend/.env.local` for the frontend to point at the backend

Example:

```bash
# backend/.env
DATABASE_URL=...
SECRET_KEY=...

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
