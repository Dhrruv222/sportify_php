import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VisualizationDashboard.css';

/**
 * Advanced Visualization Dashboard Component
 * Displays interactive charts and analytics for player recommendations
 */
export default function VisualizationDashboard({ apiUrl, data = {} }) {
  const [visualizationData, setVisualizationData] = useState(null);
  const [activeChart, setActiveChart] = useState('scores');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (data && data.length > 0) {
      processVisualizationData(data);
    }
  }, [data]);

  const processVisualizationData = (recommendations) => {
    setVisualizationData({
      scoreChart: prepareScoreChart(recommendations),
      positionChart: preparePositionChart(recommendations),
      ageChart: prepareAgeChart(recommendations),
      marketValueChart: prepareMarketValueChart(recommendations),
      fitScoreHeatmap: prepareFitScoreHeatmap(recommendations),
      stats: calculateStatistics(recommendations)
    });
  };

  const prepareScoreChart = (data) => {
    return {
      labels: data.map((r, i) => r.full_name || `Player ${i + 1}`),
      scores: data.map(r => r.final_score || r.fit_score || 0),
      colors: data.map(r => getScoreColor(r.final_score || r.fit_score || 0))
    };
  };

  const preparePositionChart = (data) => {
    const positions = {};
    data.forEach(r => {
      const pos = r.primary_position || 'Unknown';
      positions[pos] = (positions[pos] || 0) + 1;
    });
    return {
      labels: Object.keys(positions),
      data: Object.values(positions),
      colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
    };
  };

  const prepareAgeChart = (data) => {
    const ages = data.map(r => r.age || 0).sort((a, b) => a - b);
    return {
      labels: data.map((r, i) => r.full_name || `P${i + 1}`),
      data: ages,
      min: Math.min(...ages),
      max: Math.max(...ages),
      avg: Math.round(ages.reduce((a, b) => a + b, 0) / ages.length)
    };
  };

  const prepareMarketValueChart = (data) => {
    return {
      labels: data.map((r, i) => r.full_name || `P${i + 1}`),
      values: data.map(r => (r.market_value_eur / 1000000).toFixed(1)),
      scores: data.map(r => r.final_score || 0),
      colors: data.map(r => getScoreColor(r.final_score || 0))
    };
  };

  const prepareFitScoreHeatmap = (data) => {
    return {
      players: data.map(r => r.full_name || 'Unknown'),
      metrics: [
        { name: 'Fit Score', values: data.map(r => r.fit_score || 0) },
        { name: 'Performance', values: data.map(r => r.performance_score || 0) },
        { name: 'Availability', values: data.map(r => r.availability_score || 0) }
      ]
    };
  };

  const calculateStatistics = (data) => {
    const scores = data.map(r => r.final_score || r.fit_score || 0);
    return {
      total: data.length,
      avgScore: (scores.reduce((a, b) => a + b, 0) / data.length).toFixed(2),
      maxScore: Math.max(...scores).toFixed(2),
      minScore: Math.min(...scores).toFixed(2),
      stdDev: calculateStdDev(scores).toFixed(2),
      topPlayer: data[0]?.full_name || 'N/A'
    };
  };

  const calculateStdDev = (values) => {
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const squareDiffs = values.map(v => Math.pow(v - avg, 2));
    const variance = squareDiffs.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(variance);
  };

  const getScoreColor = (score) => {
    if (score >= 0.8) return '#4CAF50';
    if (score >= 0.6) return '#2196F3';
    if (score >= 0.4) return '#FFC107';
    return '#F44336';
  };

  if (!visualizationData) {
    return (
      <div className="visualization-dashboard">
        <p className="empty-state">Load recommendations to see visualizations</p>
      </div>
    );
  }

  return (
    <div className="visualization-dashboard">
      <div className="dashboard-header">
        <h3>📊 Advanced Analytics Dashboard</h3>
        <div className="chart-selector">
          <button
            className={`chart-btn ${activeChart === 'scores' ? 'active' : ''}`}
            onClick={() => setActiveChart('scores')}
          >
            Scores
          </button>
          <button
            className={`chart-btn ${activeChart === 'position' ? 'active' : ''}`}
            onClick={() => setActiveChart('position')}
          >
            Positions
          </button>
          <button
            className={`chart-btn ${activeChart === 'age' ? 'active' : ''}`}
            onClick={() => setActiveChart('age')}
          >
            Age
          </button>
          <button
            className={`chart-btn ${activeChart === 'market' ? 'active' : ''}`}
            onClick={() => setActiveChart('market')}
          >
            Market Value
          </button>
          <button
            className={`chart-btn ${activeChart === 'heatmap' ? 'active' : ''}`}
            onClick={() => setActiveChart('heatmap')}
          >
            Heatmap
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <span className="stat-label">Total Recommendations</span>
          <span className="stat-value">{visualizationData.stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Average Score</span>
          <span className="stat-value">{visualizationData.stats.avgScore}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Top Score</span>
          <span className="stat-value">{visualizationData.stats.maxScore}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Top Player</span>
          <span className="stat-value">{visualizationData.stats.topPlayer}</span>
        </div>
      </div>

      {/* Chart Rendering */}
      <div className="chart-container">
        {activeChart === 'scores' && (
          <ScoresBarChart data={visualizationData.scoreChart} />
        )}
        {activeChart === 'position' && (
          <PositionPieChart data={visualizationData.positionChart} />
        )}
        {activeChart === 'age' && (
          <AgeBarChart data={visualizationData.ageChart} />
        )}
        {activeChart === 'market' && (
          <MarketScatterChart data={visualizationData.marketValueChart} />
        )}
        {activeChart === 'heatmap' && (
          <FitScoreHeatmap data={visualizationData.fitScoreHeatmap} />
        )}
      </div>
    </div>
  );
}

/**
 * Score Bar Chart Component
 */
function ScoresBarChart({ data }) {
  return (
    <div className="chart bar-chart">
      <h4>Recommendation Scores</h4>
      <div className="bars-container">
        {data.labels.map((label, idx) => (
          <div key={idx} className="bar-item">
            <div className="bar-label">{label}</div>
            <div className="bar">
              <div
                className="bar-fill"
                style={{
                  width: `${data.scores[idx] * 100}%`,
                  backgroundColor: data.colors[idx]
                }}
              />
            </div>
            <div className="bar-value">{(data.scores[idx] * 100).toFixed(0)}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Position Pie Chart Component
 */
function PositionPieChart({ data }) {
  const total = data.data.reduce((a, b) => a + b, 0);
  const angles = data.data.map(d => (d / total) * 360);
  let currentAngle = 0;
  const slices = data.labels.map((label, idx) => {
    const startAngle = currentAngle;
    const endAngle = currentAngle + angles[idx];
    currentAngle = endAngle;

    const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
    const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
    const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
    const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);

    const largeArc = angles[idx] > 180 ? 1 : 0;

    return (
      <g key={idx}>
        <path
          d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
          fill={data.colors[idx]}
          stroke="#fff"
          strokeWidth="2"
        />
        <text
          x={100 + 50 * Math.cos(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
          y={100 + 50 * Math.sin(((startAngle + endAngle) / 2 - 90) * Math.PI / 180)}
          textAnchor="middle"
          dominantBaseline="middle"
          className="pie-label"
        >
          {label}
        </text>
      </g>
    );
  });

  return (
    <div className="chart pie-chart">
      <h4>Position Distribution</h4>
      <svg width="200" height="200" viewBox="0 0 200 200">
        {slices}
      </svg>
      <div className="legend">
        {data.labels.map((label, idx) => (
          <div key={idx} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: data.colors[idx] }}
            />
            <span>{label}: {data.data[idx]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Age Distribution Bar Chart
 */
function AgeBarChart({ data }) {
  return (
    <div className="chart bar-chart">
      <h4>Age Distribution</h4>
      <div className="age-stats">
        <p><strong>Min Age:</strong> {data.min}</p>
        <p><strong>Max Age:</strong> {data.max}</p>
        <p><strong>Average Age:</strong> {data.avg}</p>
      </div>
      <div className="bars-container">
        {data.labels.map((label, idx) => (
          <div key={idx} className="bar-item">
            <div className="bar-label">{label}</div>
            <div className="bar">
              <div
                className="bar-fill"
                style={{
                  width: `${(data.data[idx] / data.max) * 100}%`,
                  backgroundColor: '#2196F3'
                }}
              />
            </div>
            <div className="bar-value">{data.data[idx]} yrs</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Market Value Scatter Chart
 */
function MarketScatterChart({ data }) {
  const maxValue = Math.max(...data.values.map(v => parseFloat(v)));
  const maxScore = Math.max(...data.scores);

  return (
    <div className="chart scatter-chart">
      <h4>Market Value vs Score</h4>
      <svg width="400" height="300" viewBox="0 0 400 300">
        {/* Axes */}
        <line x1="40" y1="260" x2="380" y2="260" stroke="#ccc" strokeWidth="2" />
        <line x1="40" y1="20" x2="40" y2="260" stroke="#ccc" strokeWidth="2" />
        
        {/* Axis Labels */}
        <text x="190" y="290" textAnchor="middle">Market Value (€M)</text>
        <text x="10" y="140" textAnchor="middle" transform="rotate(-90 10 140)">
          Score
        </text>

        {/* Points */}
        {data.labels.map((label, idx) => {
          const x = 40 + (parseFloat(data.values[idx]) / maxValue) * 340;
          const y = 260 - (data.scores[idx] / maxScore) * 240;
          return (
            <g key={idx}>
              <circle
                cx={x}
                cy={y}
                r="5"
                fill={data.colors[idx]}
                opacity="0.7"
              />
              <title>{`${label}: €${data.values[idx]}M, Score: ${data.scores[idx].toFixed(2)}`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/**
 * Fit Score Heatmap Component
 */
function FitScoreHeatmap({ data }) {
  return (
    <div className="chart heatmap">
      <h4>Multi-Factor Score Heatmap</h4>
      <table className="heatmap-table">
        <thead>
          <tr>
            <th>Player</th>
            {data.metrics.map((metric, idx) => (
              <th key={idx}>{metric.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.players.map((player, idx) => (
            <tr key={idx}>
              <td className="player-name">{player}</td>
              {data.metrics.map((metric, midx) => (
                <td
                  key={midx}
                  className="heatmap-cell"
                  style={{
                    backgroundColor: getHeatmapColor(metric.values[idx])
                  }}
                >
                  {(metric.values[idx] * 100).toFixed(0)}%
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getHeatmapColor(value) {
  if (value >= 0.8) return '#4CAF50';
  if (value >= 0.6) return '#8BC34A';
  if (value >= 0.4) return '#FFC107';
  if (value >= 0.2) return '#FF9800';
  return '#F44336';
}
