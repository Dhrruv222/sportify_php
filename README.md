# Sportify_1

Monorepo for Sportify MVP with web (`client`), backend (`server`), mobile (`mobile`), and AI microservice (`ai-service`).

## Current Implementation Status (Done)

### Dev 2 Progress Snapshot (Latest)
- FIT-Pass module implemented (`plans`, `subscribe`, `me/qr`, `checkin`) with tests.
- Company HR module implemented (`employees` list/add/remove, `stats`) with tests.
- News module implemented with internal ingest, queue enqueue, queue status/retry, and scheduler tests.
- AI scoring integrated (`server` -> `ai-service`) with fallback behavior and tests.
- Startup environment guardrails added (`server/src/config/env.js`) and validated in tests.
- Health checks expanded with readiness endpoint (`/api/health/ready`).
- CI extended to include `ai-service` syntax + tests.

### 1) Environment & Tooling
- Flutter installed and configured globally on Windows.
- `flutter doctor -v` completed with no issues.
- Runtime pin files added:
  - `.nvmrc` → `20`
  - `.python-version` → `3.11`
- Docker Compose scaffold added for local infra.

### 2) Git/GitHub Setup
- Repository initialized and pushed to GitHub.
- Remote configured: `origin -> https://github.com/Dhrruv222/Sportify_1.git`
- `main` branch active and tracking remote.
- Nested `client` gitlink/submodule issue fixed so `client` files are now tracked normally.

### 3) Prisma + Supabase (Server)
- Prisma v7 config aligned to `prisma.config.ts` datasource usage.
- `schema.prisma` updated to Prisma v7-compatible datasource format (no `url`/`directUrl` inside schema datasource block).
- Connection string troubleshooting completed (URL encoding and pooler format issues addressed).
- Migration successfully created and applied:
  - `server/prisma/migrations/20260225204740_init_supabase_cloud/migration.sql`
- Prisma Studio verified as runnable.

### 4) AI Service Scaffold (FastAPI)
- `ai-service` folder created.
- Python virtual environment created under `ai-service/venv`.
- Dependencies installed in venv: `fastapi`, `uvicorn`, `openai`, `requests`.
- Clean `ai-service/requirements.txt` generated from local venv.
- Health endpoint scaffold added in `ai-service/main.py`.

### 5) Environment Templates
- Env template(s) started for AI service:
  - `ai-service/.env.example`
- Backup env workflow used during DB URL fixes (`.env.bak`) and excluded from commits via `.gitignore` updates.

### 6) Handoff/Scaffolding Files
- Backend service scaffolding added under:
  - `server/src/services/index.ts`
  - `server/src/services/handoffs.ts`

---

## Repository Structure

- `client/` → Next.js frontend
- `server/` → Node.js + Prisma backend
- `mobile/` → Flutter app
- `ai-service/` → FastAPI microservice
- `docker-compose.yml` → local service orchestration scaffold

---

## Verified Commands (So Far)

### Flutter
- `flutter --version`
- `flutter doctor -v`

### Prisma
- `npx prisma validate`
- `npx prisma migrate dev --name init_supabase_cloud`
- `npx prisma studio`

### AI Service
- `./venv/Scripts/python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000` (PowerShell equivalent path used on Windows)

---

## In Progress / Next Roadmap Focus (Dev 2)

1. Continue infra readiness tasks that do not require AWS/Stripe/Firebase rollout.
2. Keep backend quality gates green while integrating parallel Dev1 merges.
3. Expand deployment playbook from staging to production handoff.

### Dev 2 Ops Docs
- Runbook: `server/docs/dev2-operations-runbook.md`
- Failure Matrix: `server/docs/dev2-failure-matrix.md`
- Release Checklist: `server/docs/dev2-release-checklist.md`
- Deployment Playbook: `server/docs/dev2-deployment-playbook.md`

### Dev 2 Smoke Command
- `npm run ops:readiness-smoke -- --base-url http://localhost:3000`

---

## Notes
- Keep secrets out of git; use `.env` locally and `.env.example` for shared templates.
- Use encoded passwords in Postgres URLs when special characters are present.
- Keep migration announcements coordinated before applying shared/staging DB changes.
