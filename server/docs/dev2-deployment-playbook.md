# Dev2 Deployment Playbook (Staging -> Production)

## Scope
This playbook covers Dev2-owned areas currently in scope:
- FIT-Pass API
- Company HR API
- News ingest/queue/scheduler
- AI scoring integration and fallback
- Health/readiness checks

AWS/Stripe/Firebase rollout steps remain out of scope for this phase.

## 1) Pre-Deployment Gate
- Ensure working branch is rebased/merged with latest `main`.
- Confirm CI passes for:
  - server lint + tests
  - ai-service syntax + tests
- Confirm release notes include:
  - changed endpoints
  - fallback behavior changes
  - rollback notes

## 2) Staging Deploy Checklist
- Deploy `server` and `ai-service` artifacts to staging.
- Set required environment variables:
  - `DATABASE_URL` or `DIRECT_URL`
  - `JWT_SECRET`, `JWT_REFRESH_SECRET`
  - `AI_SERVICE_URL`
- Optional but recommended:
  - `REDIS_URL` for queue mode
  - `INTERNAL_API_KEY`, `AI_INTERNAL_API_KEY`
  - scheduler vars (`NEWS_AUTO_INGEST_*`)

## 3) Post-Deploy Smoke Checks
Run from repo root:
- `npm run ops:readiness-smoke -- --base-url https://<staging-server-url>`

Expected:
- `/api/health` returns 200 and `status=ok`
- `/api/health/ready` returns 200 in staging
- readiness payload includes checks for env + queue mode

## 4) Functional Spot Checks
- FIT-Pass:
  - list plans
  - subscribe
  - get QR
  - check-in flow
- Company HR:
  - employee list/add/remove
  - stats
- News:
  - internal ingest/enqueue/status/retry
- AI:
  - verify scoring response shape (`score`, `breakdown`)
  - verify fallback still works when ai-service is unavailable

## 5) Production Promotion
- Promote only if staging smoke + spot checks are green.
- Roll out during agreed change window.
- Immediately run readiness smoke against production URL.

## 6) Rollback
- Roll back to previous known-good release if:
  - readiness returns `503` in production unexpectedly
  - queue/scheduler behavior is unstable
  - AI scoring contract breaks
- Temporary mitigations:
  - disable scheduler (`NEWS_AUTO_INGEST_ENABLED=false`)
  - keep AI fallback enabled
