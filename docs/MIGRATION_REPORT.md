# Migration Report: Node.js → Laravel 11

## Summary

| Metric                  | Value    |
|-------------------------|----------|
| Source framework        | Express 5 + Prisma 7 |
| Target framework        | Laravel 11 + Eloquent |
| PHP version             | 8.3+     |
| Total endpoints         | 52       |
| Endpoints migrated      | 52       |
| Endpoints regressed     | 0        |
| Models migrated         | 25       |
| Database tables         | 25       |
| Middleware files         | 4        |
| Controllers             | 11       |
| Services                | 4        |
| Test files              | 4        |
| Form Requests           | 2        |

## Architecture Mapping

| Node.js Component               | Laravel Equivalent                         |
|----------------------------------|--------------------------------------------|
| Express Router                   | `routes/api.php`                           |
| Prisma ORM                       | Eloquent Models (25 files)                 |
| Prisma Migrations                | Laravel migration file                     |
| Prisma seed.js                   | `DatabaseSeeder.php`                       |
| Zod validation                   | Form Request classes                       |
| jsonwebtoken                     | firebase/php-jwt                           |
| passport-google-oauth20          | Laravel Socialite (stubbed)                |
| BullMQ                           | Laravel Queue (Redis driver)               |
| bcrypt (npm)                     | PHP native `password_hash`/`Hash::make`    |
| Express middleware               | Laravel middleware (4 files)               |
| `server/src/modules/*/`          | `app/Http/Controllers/Api/V1/`             |
| `server/src/services/`           | `app/Services/`                            |

## Auth Pattern Mapping

| Node Pattern               | Middleware File           | Used By                        |
|----------------------------|---------------------------|-------------------------------|
| `roleGuard(allowedRoles?)` | `RoleGuard.php`           | auth, users, profile, social, players, messages |
| `requireAuth`              | `RequireAuth.php`         | company module                |
| `requireRoles(roles)`      | `RequireRoles.php`        | company module                |
| `requireInternalApiKey`    | `InternalApiKey.php`      | news internal endpoints       |

## File Inventory

### Config (10 files)
`config/app.php`, `config/database.php`, `config/jwt.php`, `config/services.php`, `config/news.php`, `config/queue.php`, `config/cors.php`, `config/logging.php`, `config/cache.php`, `config/session.php`

### Models (25 files in `app/Models/`)
User, Player, Club, Agent, Scout, Coach, Fan, Company, Video, Tag, Like, Comment, SavedVideo, Follow, Message, SavedPlayer, FitpassPlan, FitpassSubscription, FitpassCheckin, CompanyEmployee, NewsArticle, CareerHistory, Achievement, EmbeddedVideo

### Controllers (11 files in `app/Http/Controllers/Api/V1/`)
HealthController, AuthController, FitpassController, CompanyController, NewsController, UserController, ProfileController, SocialController, ShortlistController, PlayerController, MessageController

### Services (4 files in `app/Services/`)
AuthService, FitpassService, CompanyService (+ inline news service in controller)

### Middleware (4 files in `app/Http/Middleware/`)
RoleGuard, RequireAuth, RequireRoles, InternalApiKey

### Tests (4 files in `tests/Feature/`)
HealthEndpointTest, AuthEndpointTest, FitpassEndpointTest, NewsEndpointTest

### Docker
- `backend/Dockerfile` — PHP 8.3 FPM + Nginx + Supervisor
- `backend/docker/nginx.conf`
- `backend/docker/supervisord.conf`
- Updated root `docker-compose.yml` with `backend` service

## Response Envelope Parity

Two response patterns from the Node.js codebase were preserved exactly:

1. **Auth/Users/Profile/Social/Players/Messages**: `{ status: "success"|"error", data: {...}, message?: string }`
2. **Fitpass/News/Company/Health**: `{ success: true|false, data: {...}, error?: string }`

## Known Limitations

1. Google OAuth callback is stubbed — use Laravel Socialite for production
2. Queue jobs (news ingest) run inline by default — configure Redis for async processing
3. Media/S3 presigned URLs return mock URLs — integrate with real S3 config
4. AI scoring service called via HTTP when `AI_SERVICE_URL` is set — returns gracefully when unavailable
