#!/usr/bin/env python3
"""
Sportify AI - Gradio Testing Interface
Optimized for Hugging Face Spaces
"""

import gradio as gr
import requests
import json
import os
from typing import List, Dict, Any

# Configuration
API_BASE_URL = os.getenv("API_URL", "http://localhost:3000/api")
API_TIMEOUT = 15

class SportifyAPI:
    """API client for Sportify AI"""
    
    def __init__(self, base_url: str):
        self.base_url = base_url
    
    def test_connection(self) -> tuple[str, bool]:
        """Test API connection"""
        try:
            response = requests.get(f"{self.base_url}/health", timeout=5)
            if response.status_code == 200:
                return "✅ Connected to API!", True
            else:
                return f"⚠️ API returned status {response.status_code}", False
        except Exception as e:
            return f"❌ Connection failed: {str(e)}", False
    
    def get_clubs(self) -> List[str]:
        """Get list of clubs"""
        try:
            response = requests.get(f"{self.base_url}/clubs", timeout=API_TIMEOUT)
            if response.status_code == 200:
                clubs = response.json()
                return [club.get('name', 'Unknown') for club in clubs]
            return ["Error fetching clubs"]
        except:
            return ["Connection error"]
    
    def generate_recommendations(self, club_name: str, num_recommendations: int, 
                               positions: str = "") -> str:
        """Generate player recommendations"""
        try:
            # Find club ID (for demo, using club_id=1)
            payload = {
                "club_id": 1,
                "limit": num_recommendations
            }
            
            if positions:
                payload["positions"] = [p.strip() for p in positions.split(",")]
            
            response = requests.post(
                f"{self.base_url}/recommendations",
                json=payload,
                timeout=API_TIMEOUT
            )
            
            if response.status_code == 201:
                data = response.json()
                recommendations = data.get('recommendations', [])
                
                if not recommendations:
                    return "No recommendations found."
                
                result = f"## 🎯 Recommendations for {club_name}\n\n"
                for i, rec in enumerate(recommendations, 1):
                    result += f"### {i}. {rec.get('player_name', 'Unknown')}\n"
                    result += f"- **Position:** {rec.get('position')}\n"
                    result += f"- **Current Club:** {rec.get('current_club')}\n"
                    result += f"- **Age:** {rec.get('age')}\n"
                    result += f"- **Match Score:** {rec.get('match_score', 0):.1f}%\n"
                    result += f"- **Fit Score:** {rec.get('fit_score', 0):.1f}%\n"
                    if rec.get('explanation'):
                        result += f"- **Why:** {rec.get('explanation')}\n"
                    result += "\n"
                
                return result
            else:
                return f"Error: API returned status {response.status_code}"
        except Exception as e:
            return f"Error generating recommendations: {str(e)}"
    
    def search_players(self, search_name: str = "", position: str = "", 
                      min_age: int = 18, max_age: int = 40) -> str:
        """Search players"""
        try:
            params = {
                "limit": 20,
                "min_age": min_age,
                "max_age": max_age
            }
            
            if search_name:
                params["search"] = search_name
            if position and position != "All":
                params["position"] = position
            
            response = requests.get(
                f"{self.base_url}/players",
                params=params,
                timeout=API_TIMEOUT
            )
            
            if response.status_code == 200:
                players = response.json()
                
                if not players:
                    return "No players found matching criteria."
                
                result = f"## 👥 Found {len(players)} Players\n\n"
                result += "| Name | Position | Club | Age | Rating | Status |\n"
                result += "|------|----------|------|-----|--------|--------|\n"
                
                for p in players[:20]:
                    status = "✅ Available" if p.get('is_available') else "❌ Not Available"
                    result += f"| {p.get('name')} | {p.get('position')} | {p.get('club')} | {p.get('age')} | {p.get('rating', 'N/A')} | {status} |\n"
                
                return result
            else:
                return f"Error: API returned status {response.status_code}"
        except Exception as e:
            return f"Error searching players: {str(e)}"
    
    def get_news(self) -> str:
        """Get latest news"""
        try:
            response = requests.get(
                f"{self.base_url}/news",
                params={"limit": 10},
                timeout=API_TIMEOUT
            )
            
            if response.status_code == 200:
                articles = response.json()
                
                if not articles:
                    return "No news articles available."
                
                result = "## 📰 Latest News\n\n"
                
                for article in articles[:10]:
                    confidence = article.get('confidence_score', 0)
                    confidence_emoji = "🟢" if confidence > 0.8 else "🟡" if confidence > 0.6 else "🔴"
                    
                    result += f"### {article.get('title')}\n"
                    result += f"- **Source:** {article.get('source')}\n"
                    result += f"- **Date:** {article.get('published_date')}\n"
                    result += f"- **Confidence:** {confidence_emoji} {confidence:.0%}\n"
                    result += f"- **Summary:** {article.get('summary', 'N/A')}\n\n"
                
                return result
            else:
                return f"Error: API returned status {response.status_code}"
        except Exception as e:
            return f"Error fetching news: {str(e)}"
    
    def get_clubs_data(self) -> str:
        """Get clubs data"""
        try:
            response = requests.get(f"{self.base_url}/clubs", timeout=API_TIMEOUT)
            
            if response.status_code == 200:
                clubs = response.json()
                
                result = "## 🏟️ Club Profiles\n\n"
                
                for club in clubs:
                    result += f"### {club.get('name')}\n"
                    result += f"- **Country:** {club.get('country')}\n"
                    result += f"- **League:** {club.get('league')}\n"
                    result += f"- **Founded:** {club.get('founded_year')}\n"
                    result += f"- **Stadium:** {club.get('stadium')}\n"
                    result += f"- **Budget:** ${club.get('budget', 'N/A')}M\n\n"
                
                return result
            else:
                return f"Error: API returned status {response.status_code}"
        except Exception as e:
            return f"Error fetching clubs: {str(e)}"

# Initialize API client
api = SportifyAPI(API_BASE_URL)

# Get clubs list for dropdown
try:
    clubs_list = api.get_clubs()
except:
    clubs_list = ["Connection Error"]

# ==================== GRADIO INTERFACE ====================

def interface():
    """Create Gradio interface"""
    
    with gr.Blocks(theme=gr.themes.Soft(), title="Sportify AI Testing") as demo:
        # Header
        gr.HTML("""
        <div style='text-align: center; padding: 20px;'>
            <h1>⚽ Sportify AI - Testing Interface</h1>
            <p style='font-size: 16px; color: #666;'>
                Global Football Intelligence & Club Matchmaking Engine
            </p>
        </div>
        """)
        
        # API Status
        with gr.Row():
            api_status = gr.Textbox(label="API Status", interactive=False, value="Testing...")
            test_btn = gr.Button("🔗 Test Connection")
        
        def check_status():
            status, _ = api.test_connection()
            return status
        
        test_btn.click(check_status, outputs=api_status)
        
        # Tabs
        with gr.Tabs():
            
            # ============= TAB 1: RECOMMENDATIONS =============
            with gr.TabItem("🎯 Recommendations"):
                gr.Markdown("### Generate Player Recommendations")
                
                with gr.Row():
                    club_dropdown = gr.Dropdown(
                        choices=clubs_list,
                        label="Select Club",
                        value=clubs_list[0] if clubs_list else "Manchester City"
                    )
                    num_recs = gr.Slider(1, 10, value=5, step=1, label="Number of Recommendations")
                
                with gr.Row():
                    positions_input = gr.Textbox(
                        label="Filter by Position (comma-separated)",
                        placeholder="e.g., Forward, Midfielder",
                        lines=1
                    )
                
                recommendations_output = gr.Markdown()
                generate_btn = gr.Button("🚀 Generate Recommendations", variant="primary")
                
                generate_btn.click(
                    api.generate_recommendations,
                    inputs=[club_dropdown, num_recs, positions_input],
                    outputs=recommendations_output
                )
            
            # ============= TAB 2: PLAYERS =============
            with gr.TabItem("👥 Players"):
                gr.Markdown("### Search Players")
                
                with gr.Row():
                    player_search = gr.Textbox(label="Search by Name", placeholder="e.g., Haaland")
                    position_filter = gr.Dropdown(
                        ["All", "Forward", "Midfielder", "Defender", "Goalkeeper"],
                        label="Position",
                        value="All"
                    )
                
                with gr.Row():
                    age_slider = gr.Slider(18, 40, value=[22, 35], label="Age Range")
                
                players_output = gr.Markdown()
                search_btn = gr.Button("🔍 Search Players", variant="primary")
                
                search_btn.click(
                    api.search_players,
                    inputs=[player_search, position_filter, age_slider],
                    outputs=players_output
                )
            
            # ============= TAB 3: CLUBS =============
            with gr.TabItem("🏟️ Clubs"):
                gr.Markdown("### Club Profiles")
                
                clubs_output = gr.Markdown()
                load_clubs_btn = gr.Button("📂 Load All Clubs", variant="primary")
                
                load_clubs_btn.click(api.get_clubs_data, outputs=clubs_output)
            
            # ============= TAB 4: NEWS =============
            with gr.TabItem("📰 News"):
                gr.Markdown("### Latest Football News")
                
                news_output = gr.Markdown()
                load_news_btn = gr.Button("📡 Load News Articles", variant="primary")
                
                load_news_btn.click(api.get_news, outputs=news_output)
            
            # ============= TAB 5: DOCUMENTATION =============
            with gr.TabItem("📚 Documentation"):
                gr.Markdown("""
                ## 📚 Documentation & Resources
                
                ### Quick Start
                1. **Configure API URL:** Set `API_URL` environment variable
                2. **Test Connection:** Click "Test Connection" button
                3. **Start Testing:** Use tabs above to explore features
                
                ### API Configuration
                - **Default API URL:** `http://localhost:3000/api`
                - **For local testing:** Use your machine IP instead of localhost
                - **For deployed API:** Set full API URL with domain
                
                ### Features
                - **🎯 Recommendations:** AI-powered player matching with multi-factor scoring
                - **👥 Players:** Search database, filter by position/age/club
                - **🏟️ Clubs:** View club profiles and requirements
                - **📰 News:** Real-time football news with confidence scoring
                
                ### Technologies
                - **Backend:** Node.js + Express.js
                - **Database:** PostgreSQL (13 optimized tables)
                - **AI:** OpenAI GPT-4 for intelligent extraction
                - **Frontend:** Gradio interface (this page)
                
                ### Links
                - **GitHub:** [https://github.com/vishnucharankolla2/sportify-ai](https://github.com/vishnucharankolla2/sportify-ai)
                - **API Docs:** See `/backend/docs/API.md`
                - **Database Schema:** See `/backend/docs/DATABASE.md`
                - **Deployment Guide:** See `HF_SPACES_DEPLOYMENT.md`
                
                ### Recommendation Algorithm
                - **Fit Score (35%):** Player profile match with club needs
                - **Performance (25%):** Current rating and statistics
                - **Availability (20%):** Transfer status and window
                - **News Impact (15%):** Recent performance and injuries
                - **Risk Factor (-5%):** Stability concerns
                
                ### Sample Data
                - **Players:** 6 elite players (Haaland, Salah, Rodri, Vinícius, Bellingham, Mbappé)
                - **Clubs:** 6 major clubs (Man City, Liverpool, Real Madrid, Barcelona, Juventus, PSG)
                - **Ready to test:** All APIs functional with example data
                """)
        
        # Footer
        gr.HTML("""
        <div style='text-align: center; padding: 20px; border-top: 1px solid #ddd; margin-top: 20px;'>
            <p style='color: #666; font-size: 14px;'>
                Sportify AI - Global Football Intelligence & Club Matchmaking Engine<br>
                <a href='https://github.com/vishnucharankolla2/sportify-ai' target='_blank'>GitHub Repository</a> | 
                Built with Gradio | Deployed on Hugging Face Spaces
            </p>
        </div>
        """)
    
    return demo

if __name__ == "__main__":
    demo = interface()
    demo.launch(server_name="0.0.0.0", server_port=7860)
