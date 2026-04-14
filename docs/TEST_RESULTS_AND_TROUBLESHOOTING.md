# Dev 2 Test Results and Troubleshooting Log

## Scope
This document logs Dev 2 validation work across:
- Backend test suite execution (`server` workspace, Jest-style API tests run via Node test runner)
- AI microservice pytest runs (`ai-service/tests`)
- Deployment and production smoke checks (Railway + health/readiness + live endpoint verification)

---

## Summary of Current Status
- Local backend lint/test: **passing** after dependency correction.
- AI microservice pytest: **passing** (`4 passed`).
- Railway health/readiness: **passing** (`/api/health`, `/api/health/ready`).
- Full production endpoint sweep: identified and fixed two real runtime bugs:
  - `GET /api/v1/company/employees` pagination crash
  - `GET /api/v1/news` pagination crash

---

## Scenario 1 — Server Lint/Test Execution Failed Locally

| Section | Details |
|---|---|
| **Test/Scenario Name** | CI/CD Pipeline Jest Execution (local server suite bootstrap) |
| **Expected Result** | `npm run lint -w server` and `npm run test -w server` should run all backend checks successfully. |
| **Actual Result / The Mistake** | Lint and tests failed immediately due to missing dev tooling dependencies. |
| **Root Cause (The 'Why')** | The local environment had an install state missing devDependencies, so commands requiring `eslint` and `supertest` failed. |
| **The Fix (The 'How')** | Reinstalled server dependencies including dev packages, then re-ran lint/tests. |

**Error log snippets**

> `'eslint' is not recognized as an internal or external command`  
> `Error: Cannot find module 'supertest'`

**Commands used**
- `npm install -w server --include=dev --no-fund --no-audit`
- `npm run lint -w server`
- `npm run test -w server`

---

## Scenario 2 — AI Microservice Test Verification

| Section | Details |
|---|---|
| **Test/Scenario Name** | AI Microservice Pytest Run |
| **Expected Result** | `python -m pytest ai-service/tests -q` should pass all AI service tests. |
| **Actual Result / The Mistake** | Final execution succeeded; no blocking test failures remained. |
| **Root Cause (The 'Why')** | N/A (verification scenario). |
| **The Fix (The 'How')** | Ensured Python environment could run pytest and executed suite. |

**Result snippet**

> `4 passed in 1.44s`

---

## Scenario 3 — Readiness Smoke Failed Before Server Was Running

| Section | Details |
|---|---|
| **Test/Scenario Name** | Deployment Smoke Check (Local Readiness Script) |
| **Expected Result** | `npm run ops:readiness-smoke` should validate `/api/health` and `/api/health/ready`. |
| **Actual Result / The Mistake** | Smoke script failed with `fetch failed`. |
| **Root Cause (The 'Why')** | Readiness script targeted `http://localhost:3000`, but the backend process was not running yet. |
| **The Fix (The 'How')** | Started server process, then reran smoke script successfully. |

**Error log snippet**

> `Running readiness smoke checks against http://localhost:3000`  
> `❌ Smoke check failed with runtime error`  
> `fetch failed`

**Commands used**
- `npm run start -w server`
- `npm run ops:readiness-smoke`

---

## Scenario 4 — Railway Startup Crash (`.prisma/client/default`)

| Section | Details |
|---|---|
| **Test/Scenario Name** | Prisma Deployment Runtime Initialization |
| **Expected Result** | Railway should start server and pass healthcheck after deployment. |
| **Actual Result / The Mistake** | Runtime crashed with missing Prisma client module. |
| **Root Cause (The 'Why')** | Prisma client artifacts were not guaranteed to exist at startup in deploy/runtime context. |
| **The Fix (The 'How')** | Added explicit Prisma generation before start via `prestart` hook and `prisma:generate` script in `server/package.json`; ensured `prisma` availability in runtime dependencies. |

**Error log snippet**

> `Cannot find module '.prisma/client/default'`

**Code/command fix summary**
- Added to `server/package.json`:
  - `"prisma:generate": "prisma generate --schema=prisma/schema.prisma"`
  - `"prestart": "npm run prisma:generate"`
- Deploy then passed Railway healthcheck.

---

## Scenario 5 — Production Endpoint Sweep Found Company Pagination Bug

| Section | Details |
|---|---|
| **Test/Scenario Name** | Company Module Endpoint Verification (`GET /api/v1/company/employees`) |
| **Expected Result** | Endpoint should return `200` with paginated employee payload. |
| **Actual Result / The Mistake** | Endpoint returned `400` with Prisma argument error. |
| **Root Cause (The 'Why')** | `skip`/`take` were derived from `page`/`limit` without hard fallback at service layer; runtime path received undefined pagination values. |
| **The Fix (The 'How')** | Hardened pagination normalization in `company.service.js` to guarantee numeric defaults (`page=1`, `limit=20`) before Prisma query execution. |

**Error log snippet**

> `Invalid prisma.companyEmployee.findMany() invocation`  
> `Argument 'skip' is missing.`

**Code change**
- `server/src/modules/company/company.service.js`
  - Added `normalizedPage`/`normalizedLimit`
  - Computed `skip` from normalized values
  - Used normalized `take`
  - Returned normalized values in pagination response

---

## Scenario 6 — Production Endpoint Sweep Found News Pagination Bug

| Section | Details |
|---|---|
| **Test/Scenario Name** | News Module Endpoint Verification (`GET /api/v1/news`) |
| **Expected Result** | Endpoint should return `200` with paginated published news payload. |
| **Actual Result / The Mistake** | Endpoint returned `500` with Prisma argument error. |
| **Root Cause (The 'Why')** | Same class of pagination defect as company list: undefined `page`/`limit` reaching Prisma list query. |
| **The Fix (The 'How')** | Added defensive page/limit normalization in `news.service.js` and used normalized values in `skip/take` and response pagination. |

**Error log snippet**

> `Invalid prisma.newsArticle.findMany() invocation`  
> `Argument 'skip' is missing.`

**Code change**
- `server/src/modules/news/news.service.js`
  - Added `normalizedPage`/`normalizedLimit`
  - Computed `skip` from normalized values
  - Used normalized `take`
  - Returned normalized values in pagination response

---

## Scenario 7 — OAuth Route Expectation Mismatch During API Sweep

| Section | Details |
|---|---|
| **Test/Scenario Name** | OAuth Endpoint Behavior Validation |
| **Expected Result** | OAuth endpoints should redirect to provider. |
| **Actual Result / The Mistake** | Initial matrix expected different statuses due redirect-follow behavior in the HTTP client. |
| **Root Cause (The 'Why')** | Some tooling followed redirects automatically, masking initial response code semantics. |
| **The Fix (The 'How')** | Rechecked with raw headers and no redirect-follow assumptions; confirmed `302 Found` with `Location` header to Google OAuth URL. |

**Header check snippet**

> `HTTP/1.1 302 Found`  
> `Location: https://accounts.google.com/o/oauth2/v2/auth?...`

---

## Scenario 8 — RBAC Admin Route Verification Limitation

| Section | Details |
|---|---|
| **Test/Scenario Name** | Admin RBAC Endpoint Check (`/api/v1/auth/admin/stats`) |
| **Expected Result** | Validate admin-only success path and non-admin forbidden path. |
| **Actual Result / The Mistake** | Direct registration using role `ADMIN` failed. |
| **Root Cause (The 'Why')** | Prisma `UserRole` enum does not define `ADMIN`; route exists, but role is not seedable via normal register flow. |
| **The Fix (The 'How')** | Confirmed schema role set and treated this as a design inconsistency, not deployment/runtime outage; non-admin forbidden behavior still validated. |

**Error log snippet**

> `Invalid value for argument 'role'. Expected UserRole.`

---

## Commands Used for Verification
- Local backend checks:
  - `npm run lint -w server`
  - `npm run test -w server`
- AI microservice checks:
  - `python -m pytest ai-service/tests -q`
- Smoke checks:
  - `npm run ops:readiness-smoke`
- Production checks:
  - `GET /api/health`
  - `GET /api/health/ready`
  - Endpoint matrix against `/api/v1/*` routes

---

## Files Changed for Bug Fixes
- `server/src/modules/company/company.service.js`
- `server/src/modules/news/news.service.js`

---

## Post-Fix Validation Plan
- Re-run local server lint/test.
- Re-run AI pytest.
- Re-run targeted Railway checks:
  - `GET /api/v1/company/employees` (with COMPANY auth)
  - `GET /api/v1/news`
- Re-run full endpoint matrix script for regression confidence.
