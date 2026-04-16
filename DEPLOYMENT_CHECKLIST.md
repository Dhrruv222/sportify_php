# 🚀 Sportify AI Production Deployment Checklist

## Pre-Deployment Checklist
- [ ] Create feature branch: `git checkout -b feature/production-alignment`
- [ ] Test all builds locally
- [ ] Update all `.env` files with production values
- [ ] Backup existing production data (if any)

## 1. Database Setup
- [ ] Create MySQL database on hosting server
- [ ] Note database credentials (host, username, password, database name)
- [ ] Ensure MySQL version 8.0+ for UUID support

## 2. Backend Deployment (Laravel)
- [ ] Upload entire `backend/` folder to PHP hosting
- [ ] Run `backend/deploy.sh` on server (or follow manual steps)
- [ ] Verify `.env` file is configured:
  ```
  APP_ENV=production
  APP_KEY=generated-by-artisan
  DB_CONNECTION=mysql
  DB_HOST=your_mysql_host
  DB_PORT=3306
  DB_DATABASE=your_database
  DB_USERNAME=your_username
  DB_PASSWORD=your_password
  SERVICES_AI_URL=https://your-ai-service-url
  ```
- [ ] Test Laravel: Visit `https://your-domain.com/api/health`

## 3. Frontend Deployment (Static Next.js)
- [ ] Upload `client/out/` contents to web root
- [ ] Ensure all files uploaded (including `_next/` folder)
- [ ] Test frontend: Visit `https://your-domain.com`

## 4. AI Service Deployment
- [ ] Deploy `ai-service/` to separate hosting
- [ ] Configure environment variables
- [ ] Test AI service: `curl https://your-ai-service/health`
- [ ] Update Laravel `.env` with AI service URL

## 5. Post-Deployment Testing
- [ ] Frontend loads correctly
- [ ] API endpoints respond:
  - [ ] `GET /api/health` ✅
  - [ ] `GET /api/v1/news` ✅
  - [ ] `POST /api/v1/auth/login` ✅
- [ ] Database connections work
- [ ] AI service integration works
- [ ] Static assets load (CSS, JS, images)

## 6. Security & Optimization
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Enable HTTPS/SSL certificate
- [ ] Configure firewall rules
- [ ] Set up monitoring/logging
- [ ] Enable Laravel caching: `php artisan config:cache`

## 7. Final Steps
- [ ] Update DNS if needed
- [ ] Test from different devices/browsers
- [ ] Monitor error logs
- [ ] Create rollback plan
- [ ] Merge feature branch to main: `git merge feature/production-alignment`

## Emergency Rollback
If issues occur:
1. Revert to previous deployment
2. Check logs: `tail -f storage/logs/laravel.log`
3. Verify database integrity
4. Contact hosting support if needed

## Support
- Laravel docs: https://laravel.com/docs
- Next.js docs: https://nextjs.org/docs
- FileZilla: https://filezilla-project.org

✅ **Deployment Complete!** Your Sportify AI app is now live on PHP hosting.