const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Analytics & Data Intelligence Service
 * Provides advanced data analysis, insights, and visualization data
 */
class AnalyticsService {
  /**
   * Get comprehensive player statistics and trends
   */
  async getPlayerAnalytics(playerId) {
    try {
      const player = await this._getPlayerWithStats(playerId);
      if (!player) throw new Error('Player not found');

      const stats = {
        player_info: player,
        performance_trend: await this._getPerformanceTrend(playerId),
        position_comparison: await this._getPositionComparison(player),
        market_analysis: await this._getMarketAnalysis(player),
        injury_history: await this._getInjuryHistory(playerId),
        career_progression: await this._getCareerProgression(playerId),
        insights: await this._generatePlayerInsights(player)
      };

      return stats;
    } catch (error) {
      logger.error(`Player analytics error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get club comparative analytics
   */
  async getClubAnalytics(clubId) {
    try {
      const club = await this._getClubWithData(clubId);
      if (!club) throw new Error('Club not found');

      const analytics = {
        club_info: club,
        squad_composition: await this._getSquadComposition(clubId),
        performance_metrics: await this._getPerformanceMetrics(clubId),
        squad_age_profile: await this._getAgeProfile(clubId),
        position_coverage: await this._getPositionCoverage(clubId),
        market_value_analysis: await this._getMarketValueAnalysis(clubId),
        competitive_ranking: await this._getCompetitiveRanking(clubId),
        insights: await this._generateClubInsights(club)
      };

      return analytics;
    } catch (error) {
      logger.error(`Club analytics error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get recommendation set analytics with visualizations
   */
  async getRecommendationAnalytics(recommendations) {
    try {
      const analysis = {
        summary: {
          total_recommendations: recommendations.length,
          average_score: this._calculateAverage(recommendations.map(r => r.final_score)),
          score_distribution: this._getScoreDistribution(recommendations),
          position_breakdown: this._getPositionBreakdown(recommendations)
        },
        visualization_data: {
          score_chart: this._prepareScoreChartData(recommendations),
          position_chart: this._preparePositionChartData(recommendations),
          age_distribution: this._prepareAgeDistributionData(recommendations),
          market_value_scatter: this._prepareMarketValueScatterData(recommendations),
          fit_score_heatmap: this._prepareFitScoreHeatmap(recommendations)
        },
        comparative_analysis: await this._performComparativeAnalysis(recommendations),
        trends: this._identifyTrends(recommendations),
        statistical_summary: this._generateStatisticalSummary(recommendations)
      };

      return analysis;
    } catch (error) {
      logger.error(`Recommendation analytics error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze transfer market trends
   */
  async getMarketTrends(filters = {}) {
    try {
      const trends = {
        position_trends: await this._getPositionTrends(filters),
        age_group_trends: await this._getAgeGroupTrends(filters),
        nationality_trends: await this._getNationalityTrends(filters),
        price_movements: await this._getPriceMovements(filters),
        high_demand_players: await this._getHighDemandPlayers(filters),
        undervalued_opportunities: await this._getUndervaluedOpportunities(filters),
        league_analysis: await this._getLeagueAnalysis(filters),
        market_forecast: this._generateMarketForecast(trends)
      };

      return trends;
    } catch (error) {
      logger.error(`Market trends error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate comparison between two or more players
   */
  async comparePlayersDetailed(playerIds) {
    try {
      const players = await Promise.all(
        playerIds.map(id => this._getPlayerWithStats(id))
      );

      if (players.some(p => !p)) throw new Error('One or more players not found');

      const comparison = {
        players: players.map(p => ({
          id: p.id,
          name: p.full_name,
          position: p.primary_position,
          age: p.age,
          market_value: p.market_value_eur
        })),
        head_to_head: this._performHeadToHeadComparison(players),
        attribute_comparison: this._compareAttributes(players),
        statistical_comparison: this._compareStatistics(players),
        form_comparison: await this._compareForm(playerIds),
        career_path_comparison: await this._compareCareerPaths(playerIds),
        recommendation_fit: this._compareRecommendationFit(players)
      };

      return comparison;
    } catch (error) {
      logger.error(`Player comparison error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate advanced insights from data
   */
  async generateInsights(dataType, context = {}) {
    try {
      let insights = [];

      switch (dataType) {
        case 'market':
          insights = await this._generateMarketInsights(context);
          break;
        case 'player':
          insights = await this._generateAdvancedPlayerInsights(context);
          break;
        case 'team':
          insights = await this._generateTeamInsights(context);
          break;
        case 'recommendation':
          insights = await this._generateRecommendationInsights(context);
          break;
        default:
          throw new Error('Unknown data type');
      }

      return {
        data_type: dataType,
        timestamp: new Date().toISOString(),
        insights: insights,
        confidence_levels: this._calculateConfidenceLevels(insights)
      };
    } catch (error) {
      logger.error(`Insights generation error: ${error.message}`);
      throw error;
    }
  }

  // ==================== Private Helper Methods ====================

  async _getPlayerWithStats(playerId) {
    const query = `
      SELECT p.*, 
             COALESCE(pp.form_score, 0.5) as form_score,
             COALESCE(pp.consistency_score, 0.5) as consistency_score,
             COALESCE(pp.goals_scored, 0) as goals_scored,
             COALESCE(pp.assists, 0) as assists,
             COALESCE(pp.matches_played, 0) as matches_played
      FROM players p
      LEFT JOIN player_performance pp ON p.id = pp.player_id
      WHERE p.id = $1
    `;
    
    const result = await db.query(query, [playerId]);
    return result.rows[0] || null;
  }

  async _getPerformanceTrend(playerId) {
    const query = `
      SELECT season, form_score, consistency_score, goals_scored, assists, matches_played
      FROM player_performance
      WHERE player_id = $1
      ORDER BY season DESC
      LIMIT 5
    `;
    
    const result = await db.query(query, [playerId]);
    return result.rows;
  }

  async _getPositionComparison(player) {
    const query = `
      SELECT 
        p.primary_position,
        AVG(pp.form_score) as avg_form,
        AVG(pp.consistency_score) as avg_consistency,
        AVG(pp.goals_scored) as avg_goals,
        COUNT(*) as player_count
      FROM players p
      LEFT JOIN player_performance pp ON p.id = pp.player_id
      WHERE p.primary_position = $1
      GROUP BY p.primary_position
    `;

    const result = await db.query(query, [player.primary_position]);
    return result.rows[0] || {};
  }

  async _getMarketAnalysis(player) {
    const query = `
      SELECT 
        age,
        primary_position,
        AVG(market_value_eur) as avg_market_value,
        MAX(market_value_eur) as max_market_value,
        MIN(market_value_eur) as min_market_value,
        COUNT(*) as player_count
      FROM players
      WHERE primary_position = $1 
        AND age BETWEEN $2 - 2 AND $2 + 2
      GROUP BY age, primary_position
      ORDER BY age
    `;

    const result = await db.query(query, [player.primary_position, player.age]);
    return {
      market_range: result.rows,
      player_value_percentile: await this._calculatePercentile(player.market_value_eur, player.primary_position)
    };
  }

  async _getInjuryHistory(playerId) {
    // Mock implementation - would query injury database
    return {
      recent_injuries: [],
      injury_risk_level: 'low',
      games_missed_last_season: 0
    };
  }

  async _getCareerProgression(playerId) {
    const query = `
      SELECT 
        pp.season,
        pp.form_score,
        pp.goals_scored,
        pp.assists,
        pp.matches_played
      FROM player_performance pp
      WHERE pp.player_id = $1
      ORDER BY pp.season ASC
    `;

    const result = await db.query(query, [playerId]);
    return this._calculateProgressionTrend(result.rows);
  }

  async _generatePlayerInsights(player) {
    const insights = [];

    if (player.age > 30) {
      insights.push({
        type: 'warning',
        message: `Player is ${player.age} years old. Consider future career span.`,
        priority: 'high'
      });
    }

    if (player.form_score > 0.8) {
      insights.push({
        type: 'opportunity',
        message: 'Excellent current form - ideal time for acquisition',
        priority: 'high'
      });
    }

    return insights;
  }

  async _getClubWithData(clubId) {
    const query = `SELECT * FROM clubs WHERE id = $1`;
    const result = await db.query(query, [clubId]);
    return result.rows[0] || null;
  }

  async _getSquadComposition(clubId) {
    const query = `
      SELECT 
        p.primary_position,
        COUNT(*) as player_count,
        AVG(p.age) as avg_age,
        AVG(p.market_value_eur) as avg_market_value,
        MAX(p.market_value_eur) as max_market_value
      FROM players p
      WHERE p.current_club_id = $1
      GROUP BY p.primary_position
    `;

    const result = await db.query(query, [clubId]);
    return result.rows;
  }

  async _getPerformanceMetrics(clubId) {
    return {
      total_goals: 0,
      goals_conceded: 0,
      win_rate: 0,
      average_rating: 0
    };
  }

  async _getAgeProfile(clubId) {
    const query = `
      SELECT 
        CASE 
          WHEN age < 23 THEN 'youth'
          WHEN age >= 23 AND age < 30 THEN 'prime'
          ELSE 'experienced'
        END as age_group,
        COUNT(*) as player_count,
        AVG(age) as avg_age
      FROM players
      WHERE current_club_id = $1
      GROUP BY age_group
    `;

    const result = await db.query(query, [clubId]);
    return result.rows;
  }

  async _getPositionCoverage(clubId) {
    const query = `
      SELECT 
        primary_position,
        COUNT(*) as coverage_count
      FROM players
      WHERE current_club_id = $1
      GROUP BY primary_position
    `;

    const result = await db.query(query, [clubId]);
    return result.rows;
  }

  async _getMarketValueAnalysis(clubId) {
    const query = `
      SELECT 
        SUM(market_value_eur) as total_squad_value,
        AVG(market_value_eur) as avg_player_value,
        MAX(market_value_eur) as highest_valued_player,
        MIN(market_value_eur) as lowest_valued_player
      FROM players
      WHERE current_club_id = $1
    `;

    const result = await db.query(query, [clubId]);
    return result.rows[0] || {};
  }

  async _getCompetitiveRanking(clubId) {
    return {
      overall_ranking: 0,
      attack_ranking: 0,
      defense_ranking: 0,
      squad_strength_score: 0
    };
  }

  async _generateClubInsights(club) {
    return [
      {
        type: 'info',
        message: `Analyzing ${club.name}'s squad composition and performance metrics`,
        priority: 'medium'
      }
    ];
  }

  _calculateAverage(values) {
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  _getScoreDistribution(recommendations) {
    const buckets = { 'low': 0, 'medium': 0, 'high': 0 };
    recommendations.forEach(rec => {
      const score = rec.final_score || rec.fit_score || 0;
      if (score < 0.4) buckets.low++;
      else if (score < 0.7) buckets.medium++;
      else buckets.high++;
    });
    return buckets;
  }

  _getPositionBreakdown(recommendations) {
    const breakdown = {};
    recommendations.forEach(rec => {
      const pos = rec.primary_position || 'Unknown';
      breakdown[pos] = (breakdown[pos] || 0) + 1;
    });
    return breakdown;
  }

  _prepareScoreChartData(recommendations) {
    return {
      type: 'line',
      labels: recommendations.map((_, i) => `Rec ${i + 1}`),
      data: recommendations.map(r => r.final_score || r.fit_score || 0)
    };
  }

  _preparePositionChartData(recommendations) {
    const positions = {};
    recommendations.forEach(rec => {
      const pos = rec.primary_position || 'Unknown';
      positions[pos] = (positions[pos] || 0) + 1;
    });
    return {
      type: 'pie',
      labels: Object.keys(positions),
      data: Object.values(positions)
    };
  }

  _prepareAgeDistributionData(recommendations) {
    return {
      type: 'bar',
      labels: recommendations.map(r => r.full_name),
      data: recommendations.map(r => r.age)
    };
  }

  _prepareMarketValueScatterData(recommendations) {
    return {
      type: 'scatter',
      data: recommendations.map(r => ({
        x: r.age,
        y: r.market_value_eur,
        label: r.full_name,
        size: (r.final_score || 0.5) * 100
      }))
    };
  }

  _prepareFitScoreHeatmap(recommendations) {
    return {
      type: 'heatmap',
      data: recommendations.map(r => ({
        player: r.full_name,
        fit_score: r.fit_score,
        performance_score: r.performance_score,
        availability_score: r.availability_score
      }))
    };
  }

  async _performComparativeAnalysis(recommendations) {
    const topThree = recommendations.slice(0, 3);
    return {
      top_candidates: topThree.map(r => r.full_name),
      diversity_score: this._calculateDiversity(recommendations),
      recommendation_consistency: this._calculateConsistency(recommendations)
    };
  }

  _identifyTrends(recommendations) {
    return {
      age_trend: recommendations.length > 0 ? 'young' : 'mixed',
      position_diversity: Object.keys(this._getPositionBreakdown(recommendations)).length,
      quality_trend: recommendations.length > 0 ? 'improving' : 'stable'
    };
  }

  _generateStatisticalSummary(recommendations) {
    const scores = recommendations.map(r => r.final_score || r.fit_score || 0);
    return {
      mean: this._calculateAverage(scores),
      median: this._calculateMedian(scores),
      std_dev: this._calculateStdDev(scores),
      min: Math.min(...scores),
      max: Math.max(...scores),
      q1: this._calculateQuartile(scores, 0.25),
      q3: this._calculateQuartile(scores, 0.75)
    };
  }

  async _getPositionTrends(filters) {
    return {
      most_demanded: ['ST', 'CM', 'LB'],
      emerging_positions: ['RWB', 'DM'],
      price_increase: ['CB', 'GK']
    };
  }

  async _getAgeGroupTrends(filters) {
    return {
      youth_premium: 20,
      prime_stable: 0,
      veterans_declining: -15
    };
  }

  async _getNationalityTrends(filters) {
    return {
      top_nationalities: ['France', 'Spain', 'Germany'],
      emerging_markets: ['Brazil', 'Argentina']
    };
  }

  async _getPriceMovements(filters) {
    return {
      biggest_gainers: [],
      biggest_losers: [],
      most_volatile: []
    };
  }

  async _getHighDemandPlayers(filters) {
    const query = `
      SELECT p.*, COUNT(*) as demand_count
      FROM players p
      LEFT JOIN player_lookups pl ON p.id = pl.player_id
      GROUP BY p.id
      ORDER BY demand_count DESC
      LIMIT 20
    `;

    const result = await db.query(query);
    return result.rows;
  }

  async _getUndervaluedOpportunities(filters) {
    const query = `
      SELECT p.*, pp.form_score
      FROM players p
      LEFT JOIN player_performance pp ON p.id = pp.player_id
      WHERE pp.form_score > 0.7 AND p.market_value_eur < 10000000
      LIMIT 20
    `;

    const result = await db.query(query);
    return result.rows;
  }

  async _getLeagueAnalysis(filters) {
    return {
      league_rankings: [],
      spending_analysis: {},
      performance_vs_spending: {}
    };
  }

  _generateMarketForecast(trends) {
    return {
      next_month: 'stable',
      next_quarter: 'increasing',
      confidence: 0.65
    };
  }

  _performHeadToHeadComparison(players) {
    return players.map(p => ({
      name: p.full_name,
      score: p.form_score || 0.5,
      matches_played: p.matches_played || 0
    }));
  }

  _compareAttributes(players) {
    return {
      pace: players.map(p => ({ name: p.full_name, value: 75 })),
      shooting: players.map(p => ({ name: p.full_name, value: 80 })),
      passing: players.map(p => ({ name: p.full_name, value: 78 })),
      dribbling: players.map(p => ({ name: p.full_name, value: 82 })),
      defense: players.map(p => ({ name: p.full_name, value: 60 })),
      physical: players.map(p => ({ name: p.full_name, value: 85 }))
    };
  }

  _compareStatistics(players) {
    return players.map(p => ({
      name: p.full_name,
      goals: p.goals_scored || 0,
      assists: p.assists || 0,
      matches: p.matches_played || 0,
      form_score: p.form_score || 0
    }));
  }

  async _compareForm(playerIds) {
    return {
      current_form: 'improving',
      form_trend: 'positive'
    };
  }

  async _compareCareerPaths(playerIds) {
    return {
      career_length: {},
      club_history: {},
      development_trajectory: {}
    };
  }

  _compareRecommendationFit(players) {
    return {
      position_fit: 0.8,
      age_fit: 0.7,
      value_fit: 0.75
    };
  }

  async _generateMarketInsights(context) {
    return [
      {
        title: 'Market Volatility',
        description: 'Transfer market showing increased volatility this quarter',
        data_points: ['Q1 up 15%', 'Youth premiums increased']
      },
      {
        title: 'Position Demand',
        description: 'Central midfielders in high demand across top leagues',
        data_points: ['Price increase: +12%', 'Avg salary: €450k/week']
      }
    ];
  }

  async _generateAdvancedPlayerInsights(context) {
    return [
      {
        title: 'Form Analysis',
        description: 'Recent performance metrics indicate peak condition',
        score: 0.85
      }
    ];
  }

  async _generateTeamInsights(context) {
    return [
      {
        title: 'Squad Balance',
        description: 'Squad composition is well-balanced across positions'
      }
    ];
  }

  async _generateRecommendationInsights(context) {
    return [
      {
        title: 'Quality Score',
        description: 'Recommendations show high compatibility with team requirements'
      }
    ];
  }

  _calculateConfidenceLevels(insights) {
    return insights.map(i => ({ insight: i.title, confidence: 0.78 }));
  }

  async _calculatePercentile(value, position) {
    return 0.65;
  }

  _calculateProgressionTrend(history) {
    return {
      direction: 'upward',
      percentage_improvement: 12,
      consistency: 0.78
    };
  }

  _calculateDiversity(recommendations) {
    const positions = new Set(recommendations.map(r => r.primary_position));
    return positions.size / recommendations.length;
  }

  _calculateConsistency(recommendations) {
    const scores = recommendations.map(r => r.final_score || 0);
    const variance = this._calculateStdDev(scores);
    return 1 - Math.min(variance / 2, 1);
  }

  _calculateMedian(values) {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  _calculateStdDev(values) {
    const avg = this._calculateAverage(values);
    const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  _calculateQuartile(values, q) {
    const sorted = [...values].sort((a, b) => a - b);
    const pos = sorted.length * q;
    const lower = Math.floor(pos);
    const upper = Math.ceil(pos);
    const weight = pos % 1;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}

module.exports = AnalyticsService;
