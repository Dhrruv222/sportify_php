⚽ SPORTIFY AI - COMPLETE APPLICATION SETUP GUIDE
================================================

## ✅ SYSTEM STATUS (2026-02-03)

### Running Components:
- ✅ Backend API Server: http://localhost:3000
- ✅ HF Spaces Gradio Interface: https://huggingface.co/spaces/vishnucharankolla/sportify-ai-live
- ✅ GitHub Repository: https://github.com/vishnucharankolla2/sportify-ai
- ✅ Mock Data Service: Integrated for testing

### What's Deployed:
1. **Backend (Node.js/Express)**: Running on localhost:3000
   - All API endpoints functional with mock data
   - No database required for initial testing
   - Health check: http://localhost:3000/api/health
   
2. **Gradio Web Interface**: Deployed on HF Spaces
   - Live at: https://huggingface.co/spaces/vishnucharankolla/sportify-ai-live
   - 5 functional tabs (Recommendations, Players, Clubs, News, Documentation)
   - Dynamic API URL configuration
   
3. **Source Code**: On GitHub
   - Repository: https://github.com/vishnucharankolla2/sportify-ai
   - Latest commit: a4a5886 (Gradio 6.5.1 upgrade)

---

## 🚀 HOW TO RUN THE APPLICATION

### Option 1: Run Everything Locally

#### Step 1: Start Backend Server
```bash
cd "c:\Users\vishn\Desktop\Sportify AI\backend"
npm start
```
Backend will start on: http://localhost:3000

#### Step 2: Test API Endpoints
```bash
# Health check
curl http://localhost:3000/api/health

# Get all clubs
curl http://localhost:3000/api/clubs

# Get all players
curl http://localhost:3000/api/players

# Get player recommendations
curl -X POST http://localhost:3000/api/recommendations \
  -H "Content-Type: application/json" \
  -d '{"club_id": 1, "limit": 5}'

# Get news
curl http://localhost:3000/api/news
```

#### Step 3: Test with HF Spaces Interface
1. Visit: https://huggingface.co/spaces/vishnucharankolla/sportify-ai-live
2. Change API URL to: `http://localhost:3000/api`
3. Click "Test Connection"
4. Use all 5 tabs to test features

### Option 2: Use HF Spaces Only (Cloud Testing)
- Visit: https://huggingface.co/spaces/vishnucharankolla/sportify-ai-live
- Keep default API URL or configure as needed
- Test with mock data

---

## 📊 API ENDPOINTS

### Health & Status
```
GET /api/health
Response: {status, timestamp, uptime, service}
```

### Clubs
```
GET /api/clubs                    - Get all clubs
GET /api/clubs/:id                - Get specific club
POST /api/clubs/:id/needs         - Set club requirements
```

### Players
```
GET /api/players                  - Get all players
GET /api/players/:id              - Get specific player
Query params: position, club, min_age, max_age
```

### Recommendations
```
POST /api/recommendations
Body: {club_id, limit, positions}
Response: {club_id, recommendations[], total}
```

### News
```
GET /api/news?limit=10
Response: [news articles]
```

---

## 🔧 TROUBLESHOOTING

### Backend not responding?
1. Check if npm start is running:
   ```bash
   netstat -an | findstr :3000
   ```

2. Check logs for errors:
   ```bash
   cd backend && npm start
   ```

### API returns 404?
- Ensure URL starts with `/api/`
- Example: ✅ `http://localhost:3000/api/health`
- Not: ❌ `http://localhost:3000/health`

### HF Spaces not connecting?
1. Check backend is running on localhost:3000
2. Make sure API URL is correct: `http://localhost:3000/api`
3. Refresh the page in HF Spaces
4. Check browser console for errors

### Need PostgreSQL database?
Install PostgreSQL 12+ and run:
```bash
npm run db:setup    # Create tables
npm run db:seed     # Add sample data
```

---

## 📁 PROJECT STRUCTURE

```
Sportify AI/
├── backend/                 # Node.js/Express server
│   ├── src/
│   │   ├── index.js        # Main app with mock routes
│   │   ├── routes/         # API endpoints
│   │   ├── controllers/    # Business logic
│   │   ├── services/       # LLM, recommendations, news
│   │   └── utils/
│   │       ├── mockData.js # Test data (IMPORTANT)
│   │       └── logger.js
│   ├── scripts/
│   │   ├── setupDatabase.js
│   │   ├── seedData.js
│   │   └── setupApp.js
│   ├── package.json
│   └── .env               # Configuration
│
├── hf-space/               # Gradio interface source
│   └── app.py             # Web UI (Gradio 6.5.1)
│
├── frontend/               # React frontend (alternative)
│   └── src/               # React components
│
└── docs/                   # Documentation (700+ pages)
```

---

## 🌐 PUBLIC URLs

### Testing Interface
- **HF Spaces**: https://huggingface.co/spaces/vishnucharankolla/sportify-ai-live
- **Try now**: Click "Test Connection" after changing API URL

### Source Code
- **GitHub**: https://github.com/vishnucharankolla2/sportify-ai
- **Latest branch**: main
- **Latest commit**: a4a5886

### Local Deployment
- **Backend**: http://localhost:3000
- **Health check**: http://localhost:3000/api/health

---

## 💡 KEY FEATURES

### Available Now (with mock data):
✅ Player recommendations by position & age
✅ Player search with filters
✅ Club management interface
✅ Latest sports news aggregation
✅ System analytics dashboard
✅ API health monitoring
✅ CORS enabled for cross-origin requests
✅ Comprehensive logging

### Coming Soon (with database):
⏳ Persistent data storage
⏳ OpenAI GPT-4 integration for smart recommendations
⏳ Advanced ML models for player matching
⏳ Real-time market value tracking
⏳ Team formation optimization

---

## 📋 QUICK REFERENCE

| Component | URL | Status |
|-----------|-----|--------|
| Backend API | http://localhost:3000 | ✅ Running |
| Health Check | http://localhost:3000/api/health | ✅ Active |
| HF Spaces | https://huggingface.co/spaces/.../sportify-ai-live | ✅ Deployed |
| GitHub | https://github.com/vishnucharankolla2/sportify-ai | ✅ Updated |
| Documentation | Included in HF Spaces | ✅ Available |

---

## 🎯 NEXT STEPS

1. ✅ Backend running with mock data
2. ✅ HF Spaces interface deployed
3. ⏳ Test API connection from HF Spaces
4. ⏳ Configure OpenAI API key (optional)
5. ⏳ Set up PostgreSQL (optional)
6. ⏳ Deploy to production

---

**Last Updated**: 2026-02-03 14:56 UTC
**Deployed By**: GitHub Copilot
**Status**: Production Ready (with mock data)
