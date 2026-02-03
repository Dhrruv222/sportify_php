---
title: Sportify AI
emoji: "soccer"
colorFrom: blue
colorTo: green
sdk: gradio
sdk_version: "4.11.0"
python_version: "3.11"
app_file: app.py
pinned: false
---

# Sportify AI - Testing Interface

A comprehensive Gradio interface for testing and interacting with the **Sportify AI Global Football Intelligence & Club Matchmaking Engine**.

##  Features

- **Player Recommendations**: Generate AI-powered player recommendations for clubs
- **Player Search**: Browse, filter, and search 1000+ players by position, age, club
- **Club Profiles**: View club information and needs assessment
- **News Intelligence**: Access real-time football news with confidence scoring
- **Analytics Dashboard**: System metrics and health monitoring

##  Quick Start

### Using HF Spaces
Simply configure the API URL and start interacting with the Sportify AI system.

### Local Testing

1. **Start the backend API:**
   `bash
   cd backend
   npm install
   npm start
   `
   The API will run on http://localhost:3000/api

2. **Run this Gradio app locally:**
   `bash
   pip install -r requirements.txt
   python app.py
   `

## Configuration

Set the API_URL environment variable to point to your Sportify AI backend:

`bash
export API_URL=http://your-backend:3000/api
python app.py
`

## Features

### 1. Player Recommendations
- Specify club name and player position
- Get AI-powered recommendations for matching players
- View detailed player profiles and stats

### 2. Player Search
- Browse all available players (1000+)
- Filter by position, age, club, and nationality
- Sort by various attributes

### 3. Club Profiles
- View club information and structure
- See current squad composition
- Understand club needs and recruitment targets

### 4. News Intelligence
- Access real-time football news
- View confidence scores for different topics
- Filter by date and relevance

### 5. System Analytics
- Monitor system health and status
- View API response times
- Check data ingestion progress

## Requirements

- Python 3.11+
- Gradio 4.11.0
- Requests library
- Pandas

See 
equirements.txt for full dependency list.

## About Sportify AI

Sportify AI is a comprehensive football intelligence platform that combines:
- Advanced player matching algorithms
- Real-time news and market intelligence
- AI-powered recommendation engine
- Multi-language support (English, Arabic, German)

Built with love for the global football community.
