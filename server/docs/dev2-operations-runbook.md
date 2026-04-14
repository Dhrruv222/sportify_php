# Dev2 Operations Runbook

## Scope
This runbook covers Dev2 backend and AI delivery areas currently in repository scope:
- FIT-Pass APIs
- Company HR APIs
- News ingestion (API, queue, scheduler)
- AI scoring integration (`server` <-> `ai-service`)
- Health/readiness and environment guardrails

AWS / Stripe / Firebase rollout tasks are intentionally excluded for this phase.

## Current Implementation Snapshot
- Health endpoints:
  - `GET /api/health`
  - `GET /api/health/ready`
- News internals:
  - `POST /api/v1/news/internal/ingest`
  - `POST /api/v1/news/internal/enqueue`
  - `GET /api/v1/news/internal/queue/status`
  - `POST /api/v1/news/internal/queue/retry`
- Queue behavior:
  - Uses BullMQ when `REDIS_URL` exists.
  - Falls back to inline ingestion when `REDIS_URL` is absent.
- AI scoring:
  - `ai-service` endpoint: `POST /internal/scout-score`
  - Internal API key enforcement when `INTERNAL_API_KEY` is set.
  - Fallback scoring enabled by default when OpenAI call fails.

## Environment Checklist
Required for server startup:
- `DATABASE_URL` or `DIRECT_URL`

Required in production:
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`

Recommended for full Dev2 behavior:
- `AI_SERVICE_URL`
- `AI_INTERNAL_API_KEY` and `INTERNAL_API_KEY`
- `REDIS_URL` (enables BullMQ mode)
- `NEWS_AUTO_INGEST_ENABLED=true` to activate scheduler loop

Reference template:
- `server/.env.example`

## Readiness Semantics
`GET /api/health/ready` returns:
- `200` when ready, or when degraded in non-production environments.
- `503` when degraded in production (required env missing).

The response includes checks for:
- database config
- JWT config
- AI service URL presence
- queue mode (`bullmq` or `inline`)
- centralized env validation status (`ok`, errors, warnings, `nodeEnv`)

## Validation Commands
Run before pushing:
- `npm run lint -w server`
- `npm run test -w server`
- `python -m pytest ai-service/tests -q`

## On-Call Quick Actions
### News ingest backlog
1. Check queue status via `GET /api/v1/news/internal/queue/status`.
2. Retry failed jobs with `POST /api/v1/news/internal/queue/retry`.
3. If Redis is unavailable, ingestion runs inline (degraded throughput expected).

### AI scoring unavailable
1. Confirm `ai-service` health endpoint.
2. Confirm `AI_SERVICE_URL` is reachable from server runtime.
3. Verify internal API keys match between caller and service.
4. If OpenAI fails and fallback is enabled, scoring remains available with fallback source.

## Remaining Dev2 Work (Near-Term)
- Expand runbook with deploy-stage playbook (staging to production handoff).
- Add endpoint-level failure matrix and expected fallback behavior examples.
- Add release checklist entry template per sprint/milestone.
