# Sportify PHP Monorepo

Sportify monorepo with web, mobile, AI service, and a Laravel 11 backend migrated from Node.js.

## Services

- `backend/` Laravel 11 API (PHP 8.3+, PostgreSQL, Redis)
- `client/` Next.js frontend
- `mobile/` Flutter app
- `ai-service/` FastAPI AI scoring service
- `server/` legacy Node.js backend kept for rollback compatibility

## Backend API Status

- Endpoint parity completed: 52/52 API endpoints
- Data parity completed: 25 models and tables
- Auth parity completed: JWT role guard, company auth/roles, internal API key
- Dockerized backend available on port `8000`

Reference docs:

- `docs/ENDPOINT_PARITY_MATRIX.md`
- `docs/DATA_PARITY_MATRIX.md`
- `docs/ENV_MIGRATION_MATRIX.md`
- `docs/MIGRATION_REPORT.md`
- `docs/TEST_VERIFICATION_REPORT.md`
- `docs/DEPLOYMENT_RUNBOOK_PHP.md`
- `docs/ROLLBACK_RUNBOOK.md`

## Quick Start (Docker)

From repo root:

```bash
docker compose up --build -d
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan db:seed --force
```

Health checks:

```bash
curl http://127.0.0.1:8000/api/health
curl http://127.0.0.1:8000/api/health/ready
```

Note for Windows: prefer `127.0.0.1` instead of `localhost` for backend smoke requests.

## Backend Development (Without Docker)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve --port=8000
```

## Backend Test and Quality Commands

```bash
cd backend
php artisan test
./vendor/bin/phpstan analyse
./vendor/bin/pint --test
```

## Repository Layout

```text
backend/   Laravel 11 API
client/    Next.js app
mobile/    Flutter app
ai-service/ FastAPI service
server/    Legacy Node.js backend (fallback)
docs/      Migration and ops documentation
scripts/   Smoke and ops scripts
```

## Environment Notes

- Keep secrets out of git; use local `.env` files.
- Core backend variables are documented in `docs/ENV_MIGRATION_MATRIX.md`.
- If Redis is not configured, news queue endpoints run in inline fallback mode.

## Rollback Strategy

Node backend is preserved under `server/` and can be redeployed if needed. See `docs/ROLLBACK_RUNBOOK.md`.
