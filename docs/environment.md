# Environment Variables

## Backend (`backend/.env`)

- `DATABASE_URL`  
  PostgreSQL connection string used by `backend/database.py`.

- `PORT` (optional)  
  Port for FastAPI to bind. Defaults to `8000`.

## Frontend (`frontend/.env.local`)

- `NEXT_PUBLIC_BACKEND_URL`  
  Base URL for backend API calls (e.g., `http://localhost:8000`).
