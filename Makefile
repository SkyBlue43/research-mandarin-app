setup:
	cd backend && python -m venv .venv && . .venv/bin/activate && pip install -r requirements.txt
	cd frontend && pnpm install

dev:
	./scripts/dev.sh

backend-test:
	cd backend && . .venv/bin/activate && pytest

frontend-lint:
	cd frontend && pnpm lint
