---
title: Sportify AI
emoji: ⚽
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: "4.11.0"
python_version: "3.11"
app_file: app.py
pinned: false
---

# Sportify AI - Testing Interface

A comprehensive Streamlit interface for testing and interacting with the **Sportify AI Global Football Intelligence & Club Matchmaking Engine**.

## 🎯 Features

- **Player Recommendations**: Generate AI-powered player recommendations for clubs
- **Player Search**: Browse, filter, and search 1000+ players by position, age, club
- **Club Profiles**: View club information and needs assessment
- **News Intelligence**: Access real-time football news with confidence scoring
- **Analytics Dashboard**: System metrics and health monitoring

## 🚀 Quick Start

### Local Testing

1. **Start the backend API:**
   ```bash
   cd backend
   npm install
   npm start
   ```
   The API will run on `http://localhost:3000/api`

2. **Run this Streamlit app:**
   ```bash
   pip install -r requirements.txt
   streamlit run app.py
   ```

3. **Access the interface:**
   Open your browser to `http://localhost:8501`

### Configure API Connection

In the app's left sidebar:
1. Enter your API Base URL (default: `http://localhost:3000/api`)
2. Click "Test Connection" to verify
3. Use the tabs to interact with different features

## 📋 API Endpoints (Auto-detected)

The app communicates with these backend endpoints:

- `GET /health` - Health check
- `GET /players` - List/search players
- `GET /clubs` - List clubs
- `GET /clubs/needs/{id}` - Get club needs
- `POST /recommendations` - Generate recommendations
- `GET /news` - Get news articles
- `POST /feedback` - Submit feedback

## 🔧 Environment Variables

If hosting on Hugging Face Spaces:

```
API_URL=https://your-api-url.com/api
```

## 📊 Data Model

**Players:** 6 elite players (Haaland, Salah, Rodri, Vinícius, Bellingham, Mbappé)
**Clubs:** 6 major clubs (Man City, Liverpool, Real Madrid, Barcelona, Juventus, PSG)
**Recommendations:** Multi-factor scoring (Fit 35%, Performance 25%, Availability 20%, News 15%, Risk -5%)

## 🔗 Links

- **GitHub Repository:** https://github.com/vishnucharankolla2/sportify-ai
- **Backend Documentation:** See `/backend/docs/`
- **API Reference:** See `/backend/docs/API.md`
- **Database Schema:** See `/backend/docs/DATABASE.md`

## 🛠️ Tech Stack

- **Frontend:** Streamlit 1.28.1
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL 12+
- **AI/LLM:** OpenAI GPT-4
- **Deployment:** Hugging Face Spaces

## 📝 Testing Scenarios

### Scenario 1: Generate Club Recommendations
1. Select a club from the dropdown
2. Set number of recommendations (1-10)
3. Optionally filter by position
4. Click "Generate Recommendations"
5. View detailed match scores, fit analysis, and explanations

### Scenario 2: Search Players
1. Enter player name (optional)
2. Select position filter
3. Adjust age range slider
4. Click "Search Players"
5. Review table with all matching players

### Scenario 3: Monitor News Intelligence
1. Go to "News" tab
2. Click "Load News Articles"
3. Check confidence scores and entity extractions
4. Review LLM-powered event classifications

### Scenario 4: System Health Check
1. Go to "Analytics" tab
2. Click "Check API Status"
3. Verify database connection and service health

## ⚠️ Prerequisites

- Backend API running and accessible
- PostgreSQL database with seed data loaded
- OpenAI API key configured in backend `.env`
- Internet connection for API calls

## 📞 Support

For issues or questions:
1. Check backend logs for API errors
2. Verify database connection in backend
3. Review `/backend/docs/API.md` for endpoint details
4. Check GitHub issues: https://github.com/vishnucharankolla2/sportify-ai/issues

## 📄 License

This project is part of Sportify AI - Global Football Intelligence & Club Matchmaking Engine

---

**Last Updated:** February 2, 2026
**Version:** 1.0.0
**Status:** Production Ready for Testing
