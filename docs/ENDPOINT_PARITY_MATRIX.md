# Endpoint Parity Matrix: Node.js → Laravel

| # | Method | Node Path | Laravel Path | Auth | Middleware | Status |
|---|--------|-----------|--------------|------|------------|--------|
| 1 | GET | /api/health | /api/health | None | — | MATCHED |
| 2 | GET | /api/health/ready | /api/health/ready | None | — | MATCHED |
| 3 | POST | /api/v1/auth/register | /api/v1/auth/register | None | — | MATCHED |
| 4 | POST | /api/v1/auth/login | /api/v1/auth/login | None | — | MATCHED |
| 5 | GET | /api/v1/auth/oauth/google | /api/v1/auth/oauth/google | None | Socialite | MATCHED |
| 6 | GET | /api/v1/auth/oauth/callback | /api/v1/auth/oauth/callback | None | Socialite | MATCHED |
| 7 | POST | /api/v1/auth/refresh | /api/v1/auth/refresh | Cookie | — | MATCHED |
| 8 | POST | /api/v1/auth/logout | /api/v1/auth/logout | None | — | MATCHED |
| 9 | GET | /api/v1/auth/profile | /api/v1/auth/profile | Bearer JWT (roleGuard) | — | MATCHED |
| 10 | GET | /api/v1/auth/admin/stats | /api/v1/auth/admin/stats | Bearer JWT | role:ADMIN | MATCHED |
| 11 | GET | /api/v1/auth/player/upload | /api/v1/auth/player/upload | Bearer JWT | role:PLAYER | MATCHED |
| 12 | GET | /api/v1/fitpass/plans | /api/v1/fitpass/plans | None | — | MATCHED |
| 13 | POST | /api/v1/fitpass/subscribe | /api/v1/fitpass/subscribe | x-user-id header | — | MATCHED |
| 14 | GET | /api/v1/fitpass/me/qr | /api/v1/fitpass/me/qr | x-user-id header | — | MATCHED |
| 15 | POST | /api/v1/fitpass/checkin | /api/v1/fitpass/checkin | None | — | MATCHED |
| 16 | GET | /api/v1/company/employees | /api/v1/company/employees | requireAuth+requireRoles(COMPANY) | — | MATCHED |
| 17 | POST | /api/v1/company/employees | /api/v1/company/employees | requireAuth+requireRoles(COMPANY) | — | MATCHED |
| 18 | DELETE | /api/v1/company/employees/:id | /api/v1/company/employees/{id} | requireAuth+requireRoles(COMPANY) | — | MATCHED |
| 19 | GET | /api/v1/company/stats | /api/v1/company/stats | requireAuth+requireRoles(COMPANY) | — | MATCHED |
| 20 | GET | /api/v1/news | /api/v1/news | None | — | MATCHED |
| 21 | POST | /api/v1/news | /api/v1/news | None | — | MATCHED |
| 22 | GET | /api/v1/news/:id | /api/v1/news/{id} | None | — | MATCHED |
| 23 | POST | /api/v1/news/internal/ingest | /api/v1/news/internal/ingest | x-internal-api-key | — | MATCHED |
| 24 | POST | /api/v1/news/internal/enqueue | /api/v1/news/internal/enqueue | x-internal-api-key | — | MATCHED |
| 25 | GET | /api/v1/news/internal/queue/status | /api/v1/news/internal/queue/status | x-internal-api-key | — | MATCHED |
| 26 | POST | /api/v1/news/internal/queue/retry | /api/v1/news/internal/queue/retry | x-internal-api-key | — | MATCHED |
| 27 | GET | /api/v1/users/account | /api/v1/users/account | Bearer JWT (roleGuard) | — | MATCHED |
| 28 | GET | /api/v1/users/avatar-url | /api/v1/users/avatar-url | Bearer JWT (roleGuard) | — | MATCHED |
| 29 | PUT | /api/v1/users/photos | /api/v1/users/photos | Bearer JWT (roleGuard) | — | MATCHED |
| 30 | DELETE | /api/v1/users/account/delete | /api/v1/users/account/delete | Bearer JWT (roleGuard) | — | MATCHED |
| 31 | GET | /api/v1/profile | /api/v1/profile | Bearer JWT (roleGuard) | — | MATCHED |
| 32 | PUT | /api/v1/profile/me | /api/v1/profile/me | Bearer JWT (roleGuard) | — | MATCHED |
| 33 | POST | /api/v1/profile/me/avatar | /api/v1/profile/me/avatar | Bearer JWT | role:PLAYER,SCOUT,COMPANY,ADMIN,FAN,COACH | MATCHED |
| 34 | POST | /api/v1/profile/me/career | /api/v1/profile/me/career | Bearer JWT | role:PLAYER | MATCHED |
| 35 | PUT | /api/v1/profile/me/career/:id | /api/v1/profile/me/career/{id} | Bearer JWT | role:PLAYER | MATCHED |
| 36 | DELETE | /api/v1/profile/me/career/:id | /api/v1/profile/me/career/{id} | Bearer JWT | role:PLAYER | MATCHED |
| 37 | POST | /api/v1/profile/me/achivements | /api/v1/profile/me/achivements | Bearer JWT | role:PLAYER | MATCHED |
| 38 | DELETE | /api/v1/profile/me/achivements/:id | /api/v1/profile/me/achivements/{id} | Bearer JWT | role:PLAYER | MATCHED |
| 39 | POST | /api/v1/social/follow/:id | /api/v1/social/follow/{id} | Bearer JWT (roleGuard) | — | MATCHED |
| 40 | DELETE | /api/v1/social/unfollow/:id | /api/v1/social/unfollow/{id} | Bearer JWT (roleGuard) | — | MATCHED |
| 41 | GET | /api/v1/social/followers | /api/v1/social/followers | Bearer JWT (roleGuard) | — | MATCHED |
| 42 | GET | /api/v1/social/following | /api/v1/social/following | Bearer JWT (roleGuard) | — | MATCHED |
| 43 | GET | /api/v1/social/feed | /api/v1/social/feed | Bearer JWT (roleGuard) | — | MATCHED |
| 44 | POST | /api/v1/social/shortlist/saved/:playerId | /api/v1/social/shortlist/saved/{playerId} | Bearer JWT | role:SCOUT,CLUB,COMPANY | MATCHED |
| 45 | DELETE | /api/v1/social/shortlist/saved/:playerId | /api/v1/social/shortlist/saved/{playerId} | Bearer JWT | role:SCOUT,CLUB,COMPANY | MATCHED |
| 46 | GET | /api/v1/social/shortlist/saved | /api/v1/social/shortlist/saved | Bearer JWT | role:SCOUT,CLUB,COMPANY | MATCHED |
| 47 | GET | /api/v1/players/search | /api/v1/players/search | Bearer JWT (roleGuard) | — | MATCHED |
| 48 | GET | /api/v1/messages/conversations | /api/v1/messages/conversations | Bearer JWT (roleGuard) | — | MATCHED |
| 49 | GET | /api/v1/messages/unread-count | /api/v1/messages/unread-count | Bearer JWT (roleGuard) | — | MATCHED |
| 50 | GET | /api/v1/messages/thread/:userId | /api/v1/messages/thread/{userId} | Bearer JWT (roleGuard) | — | MATCHED |
| 51 | POST | /api/v1/messages/send/:userId | /api/v1/messages/send/{userId} | Bearer JWT (roleGuard) | — | MATCHED |
| 52 | PUT | /api/v1/messages/read/:userId | /api/v1/messages/read/{userId} | Bearer JWT (roleGuard) | — | MATCHED |

## Notes
- All 52 endpoints have been mapped with full parity.
- Auth patterns: roleGuard (JWT Bearer decode + role check) preserved as custom middleware.
- requireAuth + requireRoles(COMPANY) pattern preserved as combined middleware.
- x-user-id header auth for fitpass preserved as-is.
- x-internal-api-key for news internal endpoints preserved.
- Response envelope shapes `{success, data}` and `{status, data/message}` preserved per module.
