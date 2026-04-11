# Environment Variable Migration Matrix

| Variable | Node Usage | Laravel Equivalent | Required | Default |
|----------|-----------|-------------------|----------|---------|
| DATABASE_URL | Prisma/pg Pool connection | DB_CONNECTION=pgsql + DB_HOST/DB_PORT/DB_DATABASE/DB_USERNAME/DB_PASSWORD | Yes (one of DB_URL or components) | — |
| DIRECT_URL | Prisma direct connection (non-pooled) | Same as above (single connection mode) | Alt to DATABASE_URL | — |
| JWT_SECRET | jsonwebtoken sign/verify | JWT_SECRET (custom config/jwt.php) | Prod: required | — |
| JWT_REFRESH_SECRET | Refresh token sign/verify | JWT_REFRESH_SECRET (custom config/jwt.php) | Prod: required | — |
| GOOGLE_CLIENT_ID | passport-google-oauth20 | GOOGLE_CLIENT_ID (config/services.php) | Optional | dummy_id |
| GOOGLE_CLIENT_SECRET | passport-google-oauth20 | GOOGLE_CLIENT_SECRET (config/services.php) | Optional | dummy_secret |
| GOOGLE_CALLBACK_URL | OAuth callback URL | GOOGLE_CALLBACK_URL (config/services.php) | Optional | — |
| AI_SERVICE_URL | fetch() to AI microservice | AI_SERVICE_URL (config/services.php) | Optional | http://localhost:8000 |
| AI_INTERNAL_API_KEY | x-internal-api-key header to AI | AI_INTERNAL_API_KEY (config/services.php) | Optional | — |
| REDIS_URL | BullMQ queue connection | REDIS_URL or REDIS_HOST/REDIS_PORT | Optional | — |
| INTERNAL_API_KEY | x-internal-api-key middleware check | INTERNAL_API_KEY (config/app.php) | Optional | — |
| PORT | Express listen port | APP_PORT / server block in nginx | Optional | 3000→8000 |
| NODE_ENV | Environment mode | APP_ENV (production/local/staging) | Optional | development→local |
| EMAIL_PROVIDER | Mock email service | MAIL_MAILER (config/mail.php) | Optional | mock→log |
| MEDIA_PROVIDER | Mock media/S3 uploads | MEDIA_PROVIDER (config/services.php) | Optional | mock |
| MEDIA_MOCK_BASE_URL | Mock S3 base URL | MEDIA_MOCK_BASE_URL (config/services.php) | Optional | http://mock-s3.local/upload |
| NEWS_QUEUE_NAME | BullMQ queue name | QUEUE_CONNECTION + queue name in job | Optional | news-ingestion |
| NEWS_AUTO_INGEST_ENABLED | Scheduler toggle | NEWS_AUTO_INGEST_ENABLED (config/news.php) | Optional | false |
| NEWS_AUTO_INGEST_LOCALES | CSV locale list | NEWS_AUTO_INGEST_LOCALES (config/news.php) | Optional | en |
| NEWS_AUTO_INGEST_LIMIT | Articles per tick | NEWS_AUTO_INGEST_LIMIT (config/news.php) | Optional | 5 |
| NEWS_AUTO_INGEST_INTERVAL_MS | Scheduler interval | Converted to cron schedule in Kernel | Optional | 900000 (15min) |
| NEWS_AUTO_INGEST_RUN_ON_START | Run immediately on boot | Handled in artisan command | Optional | false |

## New Laravel-Specific Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| APP_KEY | Laravel encryption key | Generated via `php artisan key:generate` |
| APP_ENV | Environment | local |
| APP_DEBUG | Debug mode | true |
| APP_URL | Application URL | http://localhost:8000 |
| LOG_CHANNEL | Logging driver | stack |
| CACHE_DRIVER | Cache backend | file |
| QUEUE_CONNECTION | Queue driver | sync (redis when REDIS_URL set) |
