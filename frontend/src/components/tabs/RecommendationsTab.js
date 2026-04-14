import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VisualizationDashboard from '../VisualizationDashboard';
import ChatbotWidget from '../ChatbotWidget';
import './RecommendationsTab.css';

export default function RecommendationsTab({ apiUrl }) {
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState('');
  const [numRecs, setNumRecs] = useState(5);
  const [positions, setPositions] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClubs();
  }, [apiUrl]);

  const fetchClubs = async () => {
    try {
      const response = await axios.get(`${apiUrl}/clubs`, { timeout: 10000 });
      const clubNames = response.data.map(c => c.name);
      setClubs(clubNames);
      if (clubNames.length > 0) {
        setSelectedClub(clubNames[0]);
      }
    } catch (err) {
      setError('Failed to load clubs');
    }
  };

  const handleGenerate = async () => {
    if (!selectedClub) {
      setError('Please select a club');
      return;
    }

    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const payload = {
        club_id: 1,
        limit: numRecs
      };

      if (positions) {
        payload.positions = positions.split(',').map(p => p.trim());
      }

      const response = await axios.post(`${apiUrl}/recommendations`, payload, {
        timeout: 15000
      });

      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError('Failed to generate recommendations: ' + (err.response?.statusText || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="recommendations-tab">
      <h2>🎯 AI-Powered Recommendations</h2>
      <p className="subtitle">Generate personalized player recommendations using multi-factor scoring</p>

      <div className="controls">
        <div className="control-group">
          <label>Select Club</label>
          <select 
            value={selectedClub} 
            onChange={(e) => setSelectedClub(e.target.value)}
          >
            {clubs.map(club => (
              <option key={club} value={club}>{club}</option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Number of Recommendations: {numRecs}</label>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={numRecs}
            onChange={(e) => setNumRecs(parseInt(e.target.value))}
          />
        </div>

        <div className="control-group">
          <label>Filter by Position (optional)</label>
          <input
            type="text"
            placeholder="e.g., Forward, Midfielder"
            value={positions}
            onChange={(e) => setPositions(e.target.value)}
          />
        </div>

        <button 
          onClick={handleGenerate} 
          disabled={loading}
          className="generate-btn"
        >
          {loading ? 'Generating...' : '🚀 Generate Recommendations'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="recommendations-list">
        {recommendations.length > 0 ? (
          recommendations.map((rec, idx) => (
            <div key={idx} className="recommendation-card">
              <div className="card-header">
                <h3>{rec.player_name}</h3>
                <span className="position-badge">{rec.position}</span>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <span className="label">Current Club:</span>
                  <span className="value">{rec.current_club}</span>
                </div>
                <div className="info-row">
                  <span className="label">Age:</span>
                  <span className="value">{rec.age}</span>
                </div>
                <div className="scores">
                  <div className="score-item">
                    <div className="score-label">Match Score</div>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${rec.match_score}%` }}></div>
                    </div>
                    <div className="score-value">{rec.match_score?.toFixed(1) || 0}%</div>
                  </div>
                  <div className="score-item">
                    <div className="score-label">Fit Score</div>
                    <div className="score-bar">
                      <div className="score-fill" style={{ width: `${rec.fit_score}%` }}></div>
                    </div>
                    <div className="score-value">{rec.fit_score?.toFixed(1) || 0}%</div>
                  </div>
                </div>
                {rec.explanation && (
                  <div className="explanation">
                    <strong>Why:</strong> {rec.explanation}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="empty">Click generate to see recommendations</p>
        )}
      </div>

      {/* Visualization Dashboard */}
      {recommendations.length > 0 && (
        <VisualizationDashboard
          apiUrl={apiUrl}
          data={recommendations}
        />
      )}

      {/* Chatbot Widget */}
      <ChatbotWidget
        apiUrl={apiUrl}
        analysisData={{
          recommendations: recommendations,
          selected_club: selectedClub
        }}
      />
    </div>
  );
}
