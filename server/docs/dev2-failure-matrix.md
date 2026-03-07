# Dev2 Endpoint Failure Matrix

## Purpose
This matrix documents expected failure behavior for Dev2-owned backend/AI endpoints so QA and operations can verify fallback and recovery quickly.

## API Failure Matrix

| Area | Endpoint | Failure Condition | Expected Response | Recovery Action |
|---|---|---|---|---|
| Health | `GET /api/health/ready` | Missing required env in production | `503` + `status: degraded` + `checks.envValidation.errors` | Set required env (`DATABASE_URL`/`DIRECT_URL`, JWT secrets), redeploy |
| News ingest | `POST /api/v1/news/internal/ingest` | Missing/invalid internal API key | `401` | Set/correct `INTERNAL_API_KEY` in caller and server |
| News enqueue | `POST /api/v1/news/internal/enqueue` | `REDIS_URL` not configured | `200` with `mode: inline`, `queued: false` | Add Redis and `REDIS_URL` for queue mode |
| News queue status | `GET /api/v1/news/internal/queue/status` | `REDIS_URL` not configured | `200` with `enabled: false`, `mode: inline` | Configure Redis to enable BullMQ worker queue |
| News retry | `POST /api/v1/news/internal/queue/retry` | Invalid body (ex: limit out of range/type) | `400` validation error | Fix payload (`limit` numeric and valid) |
| FIT-Pass subscribe | `POST /api/v1/fitpass/subscribe` | Missing `x-user-id` header | `401` | Send authenticated user context header |
| FIT-Pass check-in | `POST /api/v1/fitpass/checkin` | Invalid/expired QR value | `400` | Re-subscribe/get active QR and retry |
| Company HR | `GET /api/v1/company/employees` | Missing auth or wrong role | `401` or `403` | Use valid token for `COMPANY` role |
| AI scoring | `POST /internal/scout-score` (ai-service) | Invalid internal API key (when configured) | `401` | Align `INTERNAL_API_KEY` and `x-internal-api-key` |
| AI scoring | `POST /internal/scout-score` (ai-service) | OpenAI unavailable + fallback disabled | `502` (`AI scoring unavailable`) | Re-enable fallback or restore OpenAI connectivity |
| AI scoring | Server -> ai-service integration | ai-service unreachable | Server returns fallback score (`source: fallback`) | Restore ai-service network/URL (`AI_SERVICE_URL`) |

## Notes
- Queue fallback to inline mode is expected behavior, not a crash state.
- In production, readiness should be treated as blocking when `503` is returned.
- AWS/Stripe/Firebase failure scenarios are excluded from this phase.
