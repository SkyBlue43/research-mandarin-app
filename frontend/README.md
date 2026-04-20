# Frontend (Next.js)

This directory contains the Next.js UI for Mandarin Tone Lab.

## Requirements

- Node.js
- pnpm

## Setup

```bash
cd frontend
pnpm install
```

## Run

```bash
pnpm dev
```

Then open `http://localhost:3000`.

## Lint

```bash
pnpm lint
```

## Notes

- Frontend expects `NEXT_PUBLIC_BACKEND_URL` in `frontend/.env.local`.
- Reference audio is fetched from the backend `/sounds/*` endpoint, not from frontend static assets.
