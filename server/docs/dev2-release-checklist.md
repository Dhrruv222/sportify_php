# Dev2 Release Checklist

## 1) Branch and Sync
- [ ] Branch is up to date with `main`.
- [ ] No unresolved merge conflicts.
- [ ] No accidental changes to Dev1-owned social/messaging scope unless explicitly coordinated.

## 2) Environment Readiness
- [ ] `DATABASE_URL` or `DIRECT_URL` configured.
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` configured for production.
- [ ] `AI_SERVICE_URL` configured.
- [ ] Internal API keys aligned (`INTERNAL_API_KEY`, `AI_INTERNAL_API_KEY`) where required.
- [ ] `REDIS_URL` configured for BullMQ mode (or inline fallback intentionally accepted).

## 3) Validation
- [ ] `npm run lint -w server`
- [ ] `npm run test -w server`
- [ ] `python -m pytest ai-service/tests -q`
- [ ] `GET /api/health` returns `200`.
- [ ] `GET /api/health/ready` returns expected status for target environment.

## 4) Module Spot Checks
- [ ] FIT-Pass: plans/subscription/check-in paths verified.
- [ ] Company HR: employee list/add/remove and stats verified.
- [ ] News: ingest/enqueue/status/retry endpoints verified.
- [ ] AI scoring path validated (AI or fallback response shape).

## 5) CI / GitHub
- [ ] CI workflow passes for server and ai-service jobs.
- [ ] Commit messages are scoped and descriptive.
- [ ] PR summary includes what changed, risks, and rollback notes.

## 6) Rollback Notes
- [ ] Keep prior stable commit hash documented.
- [ ] If queue causes incidents, disable scheduler (`NEWS_AUTO_INGEST_ENABLED=false`) and use manual ingest.
- [ ] If AI path is unstable, keep fallback enabled until ai-service/OpenAI reliability is restored.
