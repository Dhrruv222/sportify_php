# Rollback Runbook — PHP Migration

## Overview

The Node.js backend (`server/`) remains untouched and fully operational. Rolling back means simply pointing traffic back to the Node.js service.

## Docker Rollback

```bash
# Stop the PHP backend
docker compose stop backend

# The Node.js server can be started independently:
cd server
npm install
npm run dev
```

## Railway / Production Rollback

1. Re-deploy the Node.js service from the `server/` directory
2. Remove or stop the PHP backend service
3. Re-point DNS/proxy to the Node.js backend port (default 3001)
4. No database rollback needed — both backends share the same PostgreSQL schema

## Database Considerations

- Both the Prisma schema and the Laravel migration produce identical table structures
- No destructive schema changes were made
- The Node.js Prisma client will continue to work against the same database
- Seed data is idempotent (uses `upsert` / `updateOrCreate`)

## Checklist

- [ ] Verify Node.js `server/` still has all dependencies (`node_modules` or run `npm install`)
- [ ] Verify `.env` in `server/` still has `DATABASE_URL` pointing to same PostgreSQL
- [ ] Start Node.js server: `npm run dev` in `server/`
- [ ] Run smoke test: `curl http://localhost:3001/health`
- [ ] Confirm client (`client/`) API base URL points to Node.js port (3001)
