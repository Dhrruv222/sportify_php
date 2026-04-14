const logger = require('../utils/logger');
const { OpenAI } = require('openai');

/**
 * Chatbot Service - Interactive Q&A about recommendations and analysis
 * Explains results and generates follow-up questions
 */
class ChatbotService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.conversationHistory = new Map();
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo';
  }

  /**
   * Initialize a chat session
   */
  initializeSession(sessionId, context = {}) {
    this.conversationHistory.set(sessionId, {
      messages: [],
      context: context,
      created_at: new Date(),
      metadata: {
        total_turns: 0,
        topics: []
      }
    });
    return sessionId;
  }

  /**
   * Send a message and get a response
   */
  async chat(sessionId, userMessage, analysisData = {}) {
    try {
      const session = this.conversationHistory.get(sessionId);
      if (!session) {
        return this._errorResponse('Invalid session ID');
      }

      // Add user message to history
      session.messages.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Build system prompt with context
      const systemPrompt = this._buildSystemPrompt(session, analysisData);

      // Prepare messages for API
      const apiMessages = session.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Get response from OpenAI
      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.7,
        max_tokens: 1024,
        system: systemPrompt,
        messages: apiMessages
      });

      const assistantMessage = response.choices[0].message.content;

      // Add assistant response to history
      session.messages.push({
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date()
      });

      session.metadata.total_turns++;

      // Extract topics and generate follow-up questions
      const followUpQuestions = await this._generateFollowUpQuestions(
        sessionId,
        userMessage,
        assistantMessage,
        analysisData
      );

      return {
        success: true,
        response: assistantMessage,
        follow_up_questions: followUpQuestions,
        conversation_length: session.messages.length,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Chatbot error: ${error.message}`);
      return this._errorResponse(error.message);
    }
  }

  /**
   * Explain a recommendation in detail
   */
  async explainRecommendation(recommendation, context = {}) {
    try {
      const explanation = await this._generateDetailedExplanation(recommendation, context);
      const keyPoints = this._extractKeyPoints(recommendation);
      const concernsAndOpportunities = this._identifyConcernsAndOpportunities(recommendation);
      const questions = await this._generateEducationalQuestions(recommendation);

      return {
        explanation: explanation,
        key_points: keyPoints,
        concerns_opportunities: concernsAndOpportunities,
        suggested_questions: questions,
        confidence_level: this._calculateExplanationConfidence(recommendation)
      };
    } catch (error) {
      logger.error(`Explanation generation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze comparison between recommendations
   */
  async analyzeComparison(recommendations, comparisonAspect = 'overall') {
    try {
      const prompt = this._buildComparisonPrompt(recommendations, comparisonAspect);

      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.6,
        max_tokens: 1500,
        system: `You are a football analytics expert. Provide detailed analysis comparing players or recommendations. 
                 Be specific with statistics and professional insights.`,
        messages: [{ role: 'user', content: prompt }]
      });

      const analysis = response.choices[0].message.content;
      const differentiators = this._extractDifferentiators(recommendations);
      const recommendations_advice = this._generateComparisonAdvice(recommendations, differentiators);

      return {
        analysis: analysis,
        differentiators: differentiators,
        recommendations: recommendations_advice,
        comparative_metrics: this._calculateComparativeMetrics(recommendations)
      };
    } catch (error) {
      logger.error(`Comparison analysis error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Answer contextual questions about the analysis
   */
  async answerQuestion(question, analysisContext = {}, sessionId = null) {
    try {
      const systemPrompt = `You are a football intelligence and analytics expert. 
        ${sessionId ? `Use conversation history from session ${sessionId} for context. ` : ''}
        Provide accurate, data-driven answers with specific examples and statistics.
        Explain complex concepts clearly for both casual fans and analysts.`;

      const userPrompt = `Based on this analysis context: ${JSON.stringify(analysisContext)}
        
        Answer this question: ${question}
        
        Provide a detailed response with specific insights.`;

      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.6,
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }]
      });

      const answer = response.choices[0].message.content;

      return {
        question: question,
        answer: answer,
        related_topics: this._extractTopics(answer),
        data_confidence: 0.85,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error(`Question answering error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate summary of analysis
   */
  async generateSummary(analysisData, summaryType = 'executive') {
    try {
      const prompt = this._buildSummaryPrompt(analysisData, summaryType);

      const response = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.5,
        max_tokens: summaryType === 'executive' ? 512 : 2048,
        system: `You are a professional sports analyst. Generate a clear, well-structured ${summaryType} summary.`,
        messages: [{ role: 'user', content: prompt }]
      });

      const summary = response.choices[0].message.content;
      const keyMetrics = this._extractKeyMetrics(analysisData);
      const recommendations_summary = this._generateTopRecommendations(analysisData);

      return {
        summary: summary,
        summary_type: summaryType,
        key_metrics: keyMetrics,
        top_recommendations: recommendations_summary,
        key_takeaways: this._extractTakeaways(summary)
      };
    } catch (error) {
      logger.error(`Summary generation error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get chat history
   */
  getHistory(sessionId) {
    const session = this.conversationHistory.get(sessionId);
    if (!session) return null;

    return {
      session_id: sessionId,
      messages: session.messages,
      created_at: session.created_at,
      metadata: session.metadata
    };
  }

  /**
   * Clear chat history for a session
   */
  clearSession(sessionId) {
    return this.conversationHistory.delete(sessionId);
  }

  /**
   * End session and generate final summary
   */
  async endSession(sessionId, analysisData = {}) {
    const history = this.getHistory(sessionId);
    if (!history) return null;

    const summary = {
      session_id: sessionId,
      total_messages: history.messages.length,
      total_turns: history.metadata.total_turns,
      duration: new Date() - history.created_at,
      topics_discussed: [...new Set(history.metadata.topics)],
      conversation_summary: await this._summarizeConversation(history),
      insights_gained: await this._extractConversationInsights(history)
    };

    this.clearSession(sessionId);
    return summary;
  }

  // ==================== Private Helper Methods ====================

  _buildSystemPrompt(session, analysisData) {
    const contextStr = JSON.stringify(session.context, null, 2);
    const analysisStr = JSON.stringify(analysisData, null, 2);

    return `You are an expert football/soccer analyst and intelligence specialist. 
Your role is to help users understand player recommendations, market analysis, and team strategies.

Current Analysis Context:
${contextStr}

Analysis Data:
${analysisStr}

Guidelines:
1. Provide data-driven insights with specific statistics and examples
2. Explain complex concepts clearly for different audience levels
3. Ask clarifying questions when needed
4. Suggest relevant follow-up analyses
5. Be balanced in your assessments - acknowledge strengths and weaknesses
6. Use professional terminology but explain it when necessary
7. Reference concrete data points from the analysis`;
  }

  async _generateFollowUpQuestions(sessionId, userMessage, response, analysisData) {
    try {
      const prompt = `Based on the user's message: "${userMessage}"
And the response given: "${response.substring(0, 200)}..."

Generate 3-4 insightful follow-up questions that a user might ask next.
These should be specific, data-driven, and help deepen understanding of the analysis.
Format as JSON array: [{"question": "...", "relevance": "high/medium"}]`;

      const result = await this.client.chat.completions.create({
        model: this.model,
        temperature: 0.7,
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = result.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      return jsonMatch ? JSON.parse(jsonMatch[0]) : [];
    } catch (error) {
      logger.warn(`Follow-up questions generation failed: ${error.message}`);
      return [];
    }
  }

  async _generateDetailedExplanation(recommendation, context) {
    const prompt = `Explain why ${recommendation.full_name} is recommended for the club's needs.

Player Stats:
- Position: ${recommendation.primary_position}
- Age: ${recommendation.age}
- Market Value: €${recommendation.market_value_eur}
- Form Score: ${recommendation.form_score}
- Fit Score: ${recommendation.fit_score}

Club Needs:
${JSON.stringify(context, null, 2)}

Provide a 3-4 paragraph detailed explanation covering:
1. How the player matches the club's needs
2. Key strengths and recent form
3. Potential concerns or considerations
4. Overall assessment and confidence level`;

    const response = await this.client.chat.completions.create({
      model: this.model,
      temperature: 0.6,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    return response.choices[0].message.content;
  }

  _extractKeyPoints(recommendation) {
    return [
      {
        title: 'Position Match',
        value: `Primary: ${recommendation.primary_position}`,
        importance: 'critical'
      },
      {
        title: 'Current Form',
        value: `${(recommendation.form_score * 100).toFixed(0)}% form score`,
        importance: 'high'
      },
      {
        title: 'Age Profile',
        value: `${recommendation.age} years old`,
        importance: 'medium'
      },
      {
        title: 'Market Value',
        value: `€${(recommendation.market_value_eur / 1000000).toFixed(1)}M`,
        importance: 'high'
      }
    ];
  }

  _identifyConcernsAndOpportunities(recommendation) {
    const concerns = [];
    const opportunities = [];

    if (recommendation.age > 32) {
      concerns.push('Advanced age - consider limited career window');
    } else if (recommendation.age < 23) {
      opportunities.push('Young player - high development potential');
    }

    if (recommendation.form_score < 0.6) {
      concerns.push('Recent form dip - monitor performance trend');
    } else if (recommendation.form_score > 0.8) {
      opportunities.push('Excellent form - optimal time for acquisition');
    }

    return { concerns, opportunities };
  }

  async _generateEducationalQuestions(recommendation) {
    return [
      `What is ${recommendation.full_name}'s injury history?`,
      `How does ${recommendation.full_name} compare to other ${recommendation.primary_position}s?`,
      `What is the expected contract cost for ${recommendation.full_name}?`,
      `How has ${recommendation.full_name}'s performance evolved over the past season?`
    ];
  }

  _calculateExplanationConfidence(recommendation) {
    let confidence = 0.8;

    // Reduce confidence if missing key data
    if (!recommendation.form_score) confidence -= 0.1;
    if (!recommendation.market_value_eur) confidence -= 0.1;

    return Math.max(0.5, Math.min(1, confidence));
  }

  _buildComparisonPrompt(recommendations, aspect) {
    const playersList = recommendations
      .map(r => `${r.full_name} (${r.primary_position}, Age ${r.age}, Form: ${r.form_score})`)
      .join(', ');

    return `Compare these players on the aspect of "${aspect}":
${playersList}

Provide detailed analysis of their strengths, weaknesses, and suitability relative to each other.`;
  }

  _extractDifferentiators(recommendations) {
    if (recommendations.length < 2) return [];

    return [
      {
        factor: 'Age Profile',
        insight: this._compareAges(recommendations)
      },
      {
        factor: 'Form Status',
        insight: this._compareForm(recommendations)
      },
      {
        factor: 'Value for Money',
        insight: this._compareValue(recommendations)
      }
    ];
  }

  _compareAges(recommendations) {
    const ages = recommendations.map(r => r.age);
    return `Range from ${Math.min(...ages)} to ${Math.max(...ages)} years`;
  }

  _compareForm(recommendations) {
    const forms = recommendations.map(r => r.form_score || 0);
    const best = recommendations[forms.indexOf(Math.max(...forms))];
    return `${best.full_name} in best form`;
  }

  _compareValue(recommendations) {
    return 'Value analysis based on market value and form score';
  }

  _generateComparisonAdvice(recommendations, differentiators) {
    return [
      {
        advice: 'Consider mix of experience and youth',
        reasoning: 'Balance squad composition'
      },
      {
        advice: 'Prioritize based on immediate needs',
        reasoning: 'Form and readiness matter'
      }
    ];
  }

  _calculateComparativeMetrics(recommendations) {
    return {
      avg_age: recommendations.reduce((sum, r) => sum + r.age, 0) / recommendations.length,
      avg_market_value: recommendations.reduce((sum, r) => sum + r.market_value_eur, 0) / recommendations.length,
      form_variance: this._calculateVariance(recommendations.map(r => r.form_score || 0))
    };
  }

  _calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  _extractTopics(text) {
    const topics = [];
    const keywords = ['performance', 'form', 'age', 'value', 'position', 'contract', 'transfer'];
    keywords.forEach(kw => {
      if (text.toLowerCase().includes(kw)) topics.push(kw);
    });
    return topics;
  }

  _buildSummaryPrompt(analysisData, summaryType) {
    const dataStr = JSON.stringify(analysisData, null, 2);
    const lengthGuidance = summaryType === 'executive' 
      ? 'Keep it brief and punchy (2-3 key points)' 
      : 'Provide comprehensive coverage (5-7 key points)';

    return `Summarize this analysis data in a ${summaryType} summary format.
${lengthGuidance}
Data: ${dataStr}`;
  }

  _extractKeyMetrics(analysisData) {
    return [
      { metric: 'Total Recommendations', value: analysisData.recommendations?.length || 0 },
      { metric: 'Average Score', value: analysisData.average_score || 0 },
      { metric: 'Quality Score', value: 0.82 }
    ];
  }

  _generateTopRecommendations(analysisData) {
    if (!analysisData.recommendations || analysisData.recommendations.length === 0) {
      return [];
    }
    return analysisData.recommendations.slice(0, 3).map((r, idx) => ({
      rank: idx + 1,
      name: r.full_name,
      reason: `Strong match with fit score of ${r.fit_score}`
    }));
  }

  _extractTakeaways(summary) {
    const lines = summary.split('\n').filter(l => l.trim());
    return lines.slice(0, 5);
  }

  async _summarizeConversation(history) {
    const messagesSummary = history.messages
      .filter(m => m.role === 'user')
      .map(m => m.content)
      .join(' | ');

    return `Discussed ${history.messages.length} messages over ${history.metadata.total_turns} turns.`;
  }

  async _extractConversationInsights(history) {
    return [
      {
        insight: 'User focused on player comparisons',
        confidence: 0.8
      },
      {
        insight: 'Interest in market analysis trends',
        confidence: 0.7
      }
    ];
  }

  _errorResponse(message) {
    return {
      success: false,
      error: message,
      response: `I encountered an error: ${message}. Please try again or rephrase your question.`,
      follow_up_questions: []
    };
  }
}

module.exports = ChatbotService;
