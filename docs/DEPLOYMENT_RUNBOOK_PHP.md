# Deployment Runbook — PHP Backend

## Prerequisites

- Docker & Docker Compose
- PHP 8.3+ (for local dev without Docker)
- Composer 2.x
- PostgreSQL 16
- Redis 7 (optional, for queue)

## Local Development (Docker)

```bash
# Start all services (postgres + redis + backend)
docker compose up --build

# Run migrations
docker compose exec backend php artisan migrate

# Run seeder
docker compose exec backend php artisan db:seed

# Verify health
curl http://localhost:8000/api/health
curl http://localhost:8000/api/health/ready
```

## Local Development (without Docker)

```bash
cd backend

# Install dependencies
composer install

# Copy env
cp .env.example .env

# Edit .env — set DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET

# Generate app key
php artisan key:generate

# Run migrations
php artisan migrate

# Seed data
php artisan db:seed

# Start server
php artisan serve --port=8000
```

## Running Tests

```bash
cd backend

# Run all tests
php artisan test

# Or with PHPUnit directly
./vendor/bin/phpunit

# Run specific suite
./vendor/bin/phpunit --testsuite=Feature
```

## Static Analysis

```bash
cd backend

# PHPStan (level 6)
./vendor/bin/phpstan analyse

# Code style (Laravel Pint)
./vendor/bin/pint --test   # Check only
./vendor/bin/pint           # Fix
```

## Production Deployment (Railway / generic)

1. Set env vars (see `ENV_MIGRATION_MATRIX.md` for full list)
2. Build: `docker build -t sportify-backend ./backend`
3. Run migrations: `php artisan migrate --force`
4. Seed if first deploy: `php artisan db:seed`
5. Start: container runs supervisor (php-fpm + nginx) on port 8000

## Required Environment Variables

| Variable             | Required | Default        |
|----------------------|----------|----------------|
| APP_KEY              | Yes      | —              |
| DB_HOST              | Yes      | 127.0.0.1      |
| DB_PORT              | Yes      | 5432           |
| DB_DATABASE          | Yes      | sportify       |
| DB_USERNAME          | Yes      | sportify       |
| DB_PASSWORD          | Yes      | sportify       |
| JWT_SECRET           | Yes      | —              |
| JWT_REFRESH_SECRET   | Yes      | —              |
| REDIS_HOST           | No       | 127.0.0.1      |
| REDIS_PORT           | No       | 6379           |
| AI_SERVICE_URL       | No       | —              |
| INTERNAL_API_KEY     | No       | —              |

## Smoke Test

```bash
# Health check
curl -s http://localhost:8000/api/health | jq .

# Readiness
curl -s http://localhost:8000/api/health/ready | jq .

# Register
curl -s -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password1","gdprConsent":true}' | jq .

# Fitpass plans
curl -s http://localhost:8000/api/v1/fitpass/plans | jq .
```
