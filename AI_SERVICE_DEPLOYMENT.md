# Sportify AI Service Deployment Guide

## Overview
The AI service is a separate Python microservice that provides:
- Player scouting scores via OpenAI
- News feed data
- Other AI-powered features

## Deployment Options

### Option 1: Cloud Hosting (Recommended)
Deploy to services like:
- **Railway** (as currently configured)
- **Render**
- **Heroku**
- **DigitalOcean App Platform**
- **AWS Lambda**

### Option 2: VPS/Cloud Server
1. Upload `ai-service/` directory
2. Install Python 3.11+
3. Install dependencies: `pip install -r requirements.txt`
4. Run: `uvicorn main:app --host 0.0.0.0 --port 8000`

## Environment Variables
Create a `.env` file with:
```
OPENAI_API_KEY=your_openai_key
INTERNAL_API_KEY=your_internal_key
OPENAI_MODEL=gpt-4o-mini
OPENAI_TIMEOUT_MS=30000
AI_FALLBACK_ENABLED=true
```

## Health Check
Test the service:
```bash
curl http://your-ai-service-url/health
```

## Integration with Laravel
Update `backend/.env`:
```
SERVICES_AI_URL=http://your-ai-service-url
```

## API Endpoints
- `GET /health` - Health check
- `POST /internal/scout-score` - Player scoring (internal)
- `GET /api/v1/news/feed` - News feed data

## Security
- Use HTTPS in production
- Set strong `INTERNAL_API_KEY`
- Restrict access to Laravel backend only