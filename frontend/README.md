# Frontend (Next.js)

This directory contains the Next.js UI for Mandarin Tone Lab.

For most setup and run instructions, use the root [README](../README.md). This file is just a quick frontend-specific reference.

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

- The frontend defaults to `http://localhost:8000`, so `frontend/.env.local` is only needed if your backend runs somewhere else.
- Reference audio is fetched from the backend `/sounds/*` endpoint, not from frontend static assets.
