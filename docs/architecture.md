# Architecture Overview

## High-Level Flow

- **Frontend (Next.js)** renders the session UI, records user audio, and calls the backend APIs.
- **Backend (FastAPI)** handles authentication, curriculum lookup, audio processing, transcription, and scoring.

## Key Modules

### Frontend

- `frontend/src/app/`: Next.js route pages (`/`, `/session`, `/testBranch`, etc.)
- `frontend/src/components/`: UI components (buttons, charts, headers)
- `frontend/src/hooks/`: Client logic for audio capture, transcription, and session state
- `frontend/src/services/api.ts`: API client to the backend

### Backend

- `backend/main.py`: FastAPI app + routes registration
- `backend/routes/`: Route logic per feature (auth, dtw, transcription, etc.)
- `backend/models.py`: Pydantic request models
- `backend/database.py`: DB connection helper
- `backend/curriculum/`: Curriculum CSV files

## Audio + Scoring Path

1. User records audio in the session UI.
2. Frontend sends audio for transcription (`/transcribe`) and pitch analysis (`/analyze-audio`).
3. Frontend calls DTW endpoint (`/dtw-characters`) to align user pitch to reference.
4. Backend returns alignment + accuracy for the UI to render.
