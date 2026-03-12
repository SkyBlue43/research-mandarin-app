# API Endpoints

Base URL is configured via `NEXT_PUBLIC_BACKEND_URL` in the frontend.

## Health

- `GET /`
  - Returns a welcome message.

## Auth

- `POST /check-password`
  - Body: `{ "username": string, "password": string }`
  - Returns: user metadata and test assignment

## Curriculum

- `POST /get-characters`
  - Body: `{ "test_number": string }`
  - Returns: `{ characters: [...] }`

## Session/Scoring

- `POST /dtw-characters`
  - Body:
    - `reference_pitch`: `{ frequency: number[], time: number[] }`
    - `user_pitch`: `{ frequency: number[], time: number[] }`
    - `test`: string
    - `currentIndex`: string
    - `words_user`: `{ char: string, start: number, end: number }[]`
  - Returns: alignment + accuracy payload

- `POST /save-accuracy`
  - Body: `{ user_id: number, test: string, accuracy: number, array_number: string }`

- `POST /get-highest-accuracies`
  - Body: `{ user_id: number, test: string, group: string }`
  - Returns: accuracy summary

- `POST /update-test`
  - Body: `{ user_id: number }`

## Audio

- `POST /analyze-audio`
  - Form data: `file`
  - Returns: pitch analysis

- `POST /transcribe`
  - Form data: `file`, `data` (phrase string)
  - Returns: timestamped character segments

- `POST /clone`
  - Form data: `reference`, `user`
  - Returns: corrected audio blob

## Static

- `GET /sounds/*`
  - Static audio files served from `backend/sounds/`
