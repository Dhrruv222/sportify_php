<<<<<<< HEAD
# Sportify AI - Global Football Intelligence & Club Matchmaking Engine

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- OpenAI API Key (for LLM intelligence)
- Weaviate (optional, for vector embeddings)

### Installation

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
```

### Database Setup

```bash
npm run db:setup
npm run db:seed
```

### Run Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## API Documentation

### 1. Club Management

#### Define Club Needs
**POST** `/api/clubs/:club_id/needs`

```json
{
  "positions_required": ["CM", "CDM"],
  "age_min": 23,
  "age_max": 32,
  "budget_min_eur": 40000000,
  "budget_max_eur": 80000000,
  "contract_preference": "permanent",
  "preferred_foot": "left",
  "tactical_style": "pressing",
  "urgency_level": "high",
  "min_experience_years": 3,
  "role_archetypes": ["ball_carrier", "defensive"],
  "description": "Need a box-to-box midfielder for squad depth"
}
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "id": 1,
    "club_id": 2,
    "positions_required": ["CM", "CDM"],
    "created_at": "2025-02-02T10:00:00Z"
  },
  "message": "Club needs profile created/updated"
}
```

#### Get Club Needs
**GET** `/api/clubs/:club_id/needs`

---

### 2. Recommendations Engine

#### Generate Recommendations
**POST** `/api/recommendations`

```json
{
  "club_id": 2,
  "limit": 20
}
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 5,
      "player_id": 3,
      "full_name": "Rodri Hernández",
      "primary_position": "CDM",
      "age": 27,
      "rank_position": 1,
      "fit_score": 0.92,
      "performance_score": 0.88,
      "availability_score": 1.0,
      "risk_penalty": 0.0,
      "final_score": 0.903,
      "explanation": {
        "top_reasons": [
          "Position match: CDM",
          "Age fit: 27 (target: 23-32)",
          "Recent form score: 88%",
          "Market value: €100,000,000"
        ],
        "stats_evidence": {
          "fit_score": "92",
          "performance_score": "88",
          "availability_score": "100"
        },
        "risk_indicators": [],
        "recommendation_timestamp": "2025-02-02T10:30:00Z"
      }
    }
  ],
  "count": 20,
  "timestamp": "2025-02-02T10:30:00Z"
}
```

#### Get Cached Recommendations
**GET** `/api/recommendations/:club_id?limit=20`

---

### 3. Player Intelligence

#### Search Players
**GET** `/api/players/search?position=CM&age_min=25&age_max=32&limit=50`

#### Get Player Signals
**GET** `/api/players/:player_id/signals`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "player_id": 3,
      "signal_type": "injury",
      "signal_value": 0.5,
      "confidence_score": 0.8,
      "source": "news_extraction",
      "evidence": "Hamstring injury reported by Sky Sports",
      "expires_at": "2025-02-09T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### 4. News & Intelligence

#### Get Recent News
**GET** `/api/news?entity_id=3&entity_type=player&limit=50`

#### Get News with Extractions
**GET** `/api/news/:article_id`

**Response:**
```json
{
  "status": "success",
  "data": {
    "article": {
      "id": 1,
      "title": "Rodri wins Ballon d'Or 2024",
      "content": "...",
      "source_name": "Goal.com",
      "published_at": "2025-02-01T15:30:00Z"
    },
    "extractions": [
      {
        "event_type": "award",
        "confidence_score": 0.95,
        "extracted_entities": {
          "players": ["Rodri"],
          "clubs": ["Manchester City"]
        },
        "key_facts": ["Ballon d'Or 2024 winner"]
      }
    ]
  }
}
```

---

### 5. Feedback Loop

#### Submit Club Feedback
**POST** `/api/feedback`

```json
{
  "club_id": 2,
  "player_id": 3,
  "recommendation_id": 1,
  "feedback_type": "interested",
  "rating": 5,
  "comment": "Excellent recommendation, initiating contact with club"
}
```

#### Get Feedback History
**GET** `/api/feedback/:club_id`

---

## System Architecture

### Data Flow
1. **News Ingestion** → Raw articles from multiple sources
2. **LLM Extraction** → Structured signals with confidence scores
3. **Signal Storage** → Player signals (injuries, form, transfers)
4. **Matching Engine** → Filter candidates → Rank with multi-factor scoring
5. **Explanation Layer** → Generate explainable recommendations
6. **Feedback Loop** → Club feedback improves future rankings

### Scoring Components

#### Final Score Formula
```
Final Score = 
  (Fit Score × 0.35) +
  (Performance Score × 0.25) +
  (Availability Score × 0.20) +
  (News Confidence × 0.15) -
  (Risk Penalty × 0.05)
```

**Fit Score (35%)**: Position, age, budget, tactical fit
**Performance Score (25%)**: Recent form, consistency
**Availability Score (20%)**: Injury/suspension status
**News Confidence (15%)**: Recent news signal confidence
**Risk Penalty (5%)**: Injury, suspension, disciplinary history

---

## Database Schema

### Core Tables
- **players**: Player profiles with demographics and contract info
- **clubs**: Club information and league data
- **club_needs**: Club-specific requirements for recruitment
- **player_signals**: Risk indicators, form, news-driven signals
- **player_performance**: Season statistics and metrics
- **news_articles**: Raw football news articles
- **news_extractions**: LLM-extracted structured information
- **recommendations**: Ranked player recommendations
- **club_feedback**: Club feedback on recommendations

---

## LLM Intelligence

### News Extraction
The system uses OpenAI GPT-4 to:
1. Identify entities (players, clubs)
2. Classify event types (transfer, injury, contract, form)
3. Extract facts from unstructured text
4. Assign confidence scores
5. Distinguish rumors from confirmed facts

### Key Constraints
- **No rumors as facts**: Rumors marked with confidence < 0.7
- **Evidence-based**: Only extract explicitly stated facts
- **Language support**: English, Arabic, German
- **Confidence weighted**: News confidence influences final scores

---

## Real-Time Updates

### Automatic Refresh Triggers
- Major news events (transfer confirmed, injury)
- Club profile updates
- Scheduled: Every 30 minutes (configurable)

### Caching Strategy
- Recommendations cached for 24 hours
- Invalidated on significant news
- Player signals auto-expire based on event type

---

## Data Sources & Licensing

### Approved Sources
- ESPN (public API)
- Sky Sports (with permission/scraping rules)
- Goal.com (with terms compliance)
- Transfermarkt (attribution required)
- Official club announcements

### Legal Compliance
✓ No ToS-violating scraping
✓ Proper attribution for all data
✓ Respect for robot.txt
✓ Rate limiting on external APIs

---

## Deployment

### Environment Variables
See `.env.example` for all required variables

### Database Migration
```bash
npm run db:setup    # Create schema
npm run db:seed     # Seed initial data
```

### Production Checklist
- [ ] HTTPS enabled
- [ ] JWT authentication configured
- [ ] Rate limiting enabled
- [ ] Database backups configured
- [ ] Error logging set up
- [ ] LLM API key secured
- [ ] CORS configured for frontend domain

---

## Week 1-2 Milestones

### Week 1 ✅
- [x] Data source planning & schema design
- [x] Entity resolution strategy
- [x] Initial player dataset (seed data)
- [x] News ingestion pipeline
- [x] LLM extraction with evidence

### Week 2 ✅
- [x] Club needs model
- [x] Matching & ranking baseline
- [x] Real-time updates framework
- [x] Explainability layer
- [x] API integration
- [x] Performance tuning

---

## Support & Troubleshooting

### Database Connection Issues
```bash
# Test connection
psql -h localhost -U sportify_user -d sportify_ai
```

### LLM API Errors
Check `OPENAI_API_KEY` in `.env` and verify rate limits.

### News Ingestion Delays
Monitor `logs/` for ingestion errors. Adjust `NEWS_INGEST_INTERVAL_MINUTES`.

---

**Built with ❤️ for global football intelligence**
