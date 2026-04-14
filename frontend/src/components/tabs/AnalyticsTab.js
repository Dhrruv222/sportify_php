import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VisualizationDashboard from './VisualizationDashboard';
import ChatbotWidget from './ChatbotWidget';
import './AnalyticsTab.css';

/**
 * Analytics Tab Component
 * Unified dashboard for data visualization, analysis, and chatbot
 */
export default function AnalyticsTab({ apiUrl }) {
  const [analysisType, setAnalysisType] = useState('recommendations');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [entities, setEntities] = useState([]);
  const [analysisData, setAnalysisData] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadEntities();
  }, [apiUrl, analysisType]);

  const loadEntities = async () => {
    try {
      setLoading(true);
      let endpoint = '';

      if (analysisType === 'players') {
        endpoint = `${apiUrl}/players`;
      } else if (analysisType === 'clubs') {
        endpoint = `${apiUrl}/clubs`;
      } else {
        setLoading(false);
        return;
      }

      const response = await axios.get(endpoint, { timeout: 10000 });
      setEntities(response.data || []);
      if (response.data?.length > 0) {
        setSelectedEntity(response.data[0].id);
      }
    } catch (err) {
      setError('Failed to load entities');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeEntity = async (entityId) => {
    if (!entityId) return;

    try {
      setLoading(true);
      setError('');
      let endpoint = '';

      if (analysisType === 'players') {
        endpoint = `${apiUrl}/analytics/player/${entityId}`;
      } else if (analysisType === 'clubs') {
        endpoint = `${apiUrl}/analytics/club/${entityId}`;
      }

      const response = await axios.get(endpoint, { timeout: 15000 });
      setAnalysisData(response.data);
      await generateInsights(response.data);
    } catch (err) {
      setError('Failed to analyze entity: ' + (err.response?.statusText || err.message));
      setAnalysisData(null);
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async (data) => {
    try {
      const response = await axios.post(
        `${apiUrl}/analytics/insights`,
        {
          data_type: analysisType === 'players' ? 'player' : 'team',
          context: data
        },
        { timeout: 10000 }
      ).catch(() => null);

      if (response?.data?.insights) {
        setInsights(response.data.insights);
      }
    } catch (err) {
      console.warn('Could not generate insights');
    }
  };

  const handleCompareEntities = async (ids) => {
    if (ids.length < 2) {
      setError('Please select at least 2 entities to compare');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(
        `${apiUrl}/analytics/compare`,
        { entity_ids: ids, entity_type: analysisType },
        { timeout: 15000 }
      );

      setAnalysisData(response.data);
      setActiveTab('comparison');
    } catch (err) {
      setError('Failed to compare entities');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!analysisData) {
      setError('No analysis data available');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${apiUrl}/analytics/report`,
        {
          data: analysisData,
          format: 'pdf'
        },
        { timeout: 15000, responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analysis_report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="analytics-tab">
      <h2>📊 Advanced Analytics & Intelligence</h2>

      {/* Control Panel */}
      <div className="analytics-controls">
        <div className="control-group">
          <label>Analysis Type</label>
          <select
            value={analysisType}
            onChange={(e) => {
              setAnalysisType(e.target.value);
              setAnalysisData(null);
              setInsights([]);
            }}
          >
            <option value="recommendations">Recommendations</option>
            <option value="players">Player Analysis</option>
            <option value="clubs">Club Analysis</option>
            <option value="market">Market Trends</option>
          </select>
        </div>

        {(analysisType === 'players' || analysisType === 'clubs') && (
          <div className="control-group">
            <label>Select {analysisType === 'players' ? 'Player' : 'Club'}</label>
            <select
              value={selectedEntity || ''}
              onChange={(e) => setSelectedEntity(e.target.value)}
            >
              <option value="">-- Choose --</option>
              {entities.map(entity => (
                <option key={entity.id} value={entity.id}>
                  {entity.full_name || entity.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="control-buttons">
          <button
            className="btn btn-primary"
            onClick={() => handleAnalyzeEntity(selectedEntity)}
            disabled={!selectedEntity || loading}
          >
            {loading ? 'Analyzing...' : '🔍 Analyze'}
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleGenerateReport}
            disabled={!analysisData || loading}
          >
            📄 Report
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Analysis Results */}
      {analysisData ? (
        <div className="analysis-results">
          {/* Tab Navigation */}
          <div className="tabs-nav">
            <button
              className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`tab-btn ${activeTab === 'visualization' ? 'active' : ''}`}
              onClick={() => setActiveTab('visualization')}
            >
              Visualization
            </button>
            <button
              className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`}
              onClick={() => setActiveTab('insights')}
            >
              Insights
            </button>
            <button
              className={`tab-btn ${activeTab === 'comparison' ? 'active' : ''}`}
              onClick={() => setActiveTab('comparison')}
            >
              Comparison
            </button>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content overview-content">
              <div className="data-grid">
                {renderOverviewData(analysisData, analysisType)}
              </div>
            </div>
          )}

          {/* Visualization Tab */}
          {activeTab === 'visualization' && (
            <div className="tab-content">
              <VisualizationDashboard
                apiUrl={apiUrl}
                data={analysisData.visualization_data || analysisData}
              />
            </div>
          )}

          {/* Insights Tab */}
          {activeTab === 'insights' && (
            <div className="tab-content insights-content">
              {insights.length > 0 ? (
                <div className="insights-grid">
                  {insights.map((insight, idx) => (
                    <div key={idx} className="insight-card">
                      <h4>{insight.title}</h4>
                      <p>{insight.description}</p>
                      {insight.data_points && (
                        <ul className="data-points">
                          {insight.data_points.map((point, pidx) => (
                            <li key={pidx}>{point}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-data">No insights available</p>
              )}
            </div>
          )}

          {/* Comparison Tab */}
          {activeTab === 'comparison' && (
            <div className="tab-content comparison-content">
              {analysisData.comparative_analysis ? (
                <div>
                  <h4>Comparative Analysis</h4>
                  <div className="comparison-grid">
                    <div className="comparison-item">
                      <span className="label">Top Candidates:</span>
                      <span className="value">
                        {analysisData.comparative_analysis.top_candidates?.join(', ') || 'N/A'}
                      </span>
                    </div>
                    <div className="comparison-item">
                      <span className="label">Diversity Score:</span>
                      <span className="value">
                        {(analysisData.comparative_analysis.diversity_score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="comparison-item">
                      <span className="label">Consistency:</span>
                      <span className="value">
                        {(analysisData.comparative_analysis.recommendation_consistency * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="no-data">No comparison data available</p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="no-analysis">
          <p>Select an analysis type and entity to view insights and visualizations</p>
        </div>
      )}

      {/* Chatbot Widget */}
      <ChatbotWidget apiUrl={apiUrl} analysisData={analysisData || {}} />
    </div>
  );
}

/**
 * Render overview data based on analysis type
 */
function renderOverviewData(data, analysisType) {
  if (!data) return null;

  if (analysisType === 'players' && data.player_info) {
    return (
      <>
        <DataCard label="Player" value={data.player_info.full_name} />
        <DataCard label="Position" value={data.player_info.primary_position} />
        <DataCard label="Age" value={`${data.player_info.age} years`} />
        <DataCard label="Market Value" value={`€${(data.player_info.market_value_eur / 1000000).toFixed(1)}M`} />
        <DataCard label="Form Score" value={`${(data.player_info.form_score * 100).toFixed(0)}%`} />
        <DataCard
          label="Performance Trend"
          value={data.performance_trend?.[0]?.form_score ? `${(data.performance_trend[0].form_score * 100).toFixed(0)}%` : 'N/A'}
        />
      </>
    );
  }

  if (analysisType === 'clubs' && data.club_info) {
    return (
      <>
        <DataCard label="Club" value={data.club_info.name} />
        <DataCard label="Squad Size" value={data.squad_composition?.length || 0} />
        <DataCard label="Avg Squad Value" value={data.market_value_analysis?.avg_player_value ? `€${(data.market_value_analysis.avg_player_value / 1000000).toFixed(1)}M` : 'N/A'} />
        <DataCard label="Total Squad Value" value={data.market_value_analysis?.total_squad_value ? `€${(data.market_value_analysis.total_squad_value / 1000000).toFixed(0)}M` : 'N/A'} />
        <DataCard label="Position Coverage" value={data.position_coverage?.length || 0} />
      </>
    );
  }

  return null;
}

/**
 * Data Card Component
 */
function DataCard({ label, value }) {
  return (
    <div className="data-card">
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
}
