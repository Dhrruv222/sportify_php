import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './ChatbotWidget.css';

/**
 * Interactive Chatbot Widget Component
 * Explains analysis results and asks follow-up questions
 */
export default function ChatbotWidget({ apiUrl, analysisData = {} }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Hi! 👋 I\'m your AI Sports Analytics Assistant. I can help explain recommendations, answer questions about the analysis, and suggest next steps. What would you like to know?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState([
    'Why is the top player recommended?',
    'How do these players compare?',
    'What are the key strengths of this group?',
    'Are there any risks I should consider?'
  ]);
  const [showChat, setShowChat] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize chat session
    const initSession = async () => {
      try {
        const response = await axios.post(`${apiUrl}/api/chat/init`, {
          context: analysisData
        }, { timeout: 5000 }).catch(() => null);
        
        if (response?.data?.session_id) {
          setSessionId(response.data.session_id);
        }
      } catch (error) {
        console.warn('Could not initialize chat session');
      }
    };

    initSession();
  }, [apiUrl, analysisData]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${apiUrl}/api/chat/message`,
        {
          session_id: sessionId,
          message: inputValue,
          analysis_data: analysisData
        },
        { timeout: 15000 }
      );

      if (response.data.success) {
        const assistantMessage = {
          id: messages.length + 2,
          type: 'assistant',
          content: response.data.response,
          followUpQuestions: response.data.follow_up_questions,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, assistantMessage]);

        if (response.data.follow_up_questions?.length > 0) {
          setSuggestedQuestions(
            response.data.follow_up_questions.map(q => q.question)
          );
        }
      }
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        type: 'error',
        content: `Error: ${error.response?.data?.error || error.message}. Try rephrasing your question.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
  };

  const handleQuickAction = async (action) => {
    let prompt = '';

    switch (action) {
      case 'explain':
        prompt = `Explain the top recommendation in detail. What makes them stand out?`;
        break;
      case 'compare':
        prompt = `Compare the top 3 recommendations. What are their key differences?`;
        break;
      case 'risks':
        prompt = `What are the main risks or concerns with these recommendations?`;
        break;
      case 'summary':
        prompt = `Give me an executive summary of this analysis.`;
        break;
      default:
        return;
    }

    setInputValue(prompt);
    await handleSendMessage();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        type: 'assistant',
        content: 'Chat cleared. How can I help you with the analysis?',
        timestamp: new Date()
      }
    ]);
  };

  return (
    <div className="chatbot-widget">
      {/* Floating Chat Button */}
      {!showChat && (
        <button
          className="chat-button"
          onClick={() => setShowChat(true)}
          title="Open Chat Assistant"
        >
          💬
          <span className="badge">Ask</span>
        </button>
      )}

      {/* Chat Window */}
      {showChat && (
        <div className="chat-window">
          <div className="chat-header">
            <h3>🤖 Analytics Assistant</h3>
            <button
              className="close-btn"
              onClick={() => setShowChat(false)}
              title="Close Chat"
            >
              ✕
            </button>
          </div>

          {/* Messages Area */}
          <div className="messages-area">
            {messages.map(message => (
              <div
                key={message.id}
                className={`message message-${message.type}`}
              >
                <div className="message-content">
                  {message.type === 'assistant' && <span className="avatar">🤖</span>}
                  {message.type === 'user' && <span className="avatar">👤</span>}
                  {message.type === 'error' && <span className="avatar">⚠️</span>}
                  
                  <div className="text">
                    {message.content}
                    {message.followUpQuestions && (
                      <div className="follow-ups">
                        <p className="follow-ups-title">Follow-up questions:</p>
                        {message.followUpQuestions.map((q, idx) => (
                          <button
                            key={idx}
                            className="follow-up-btn"
                            onClick={() => handleSuggestedQuestion(q.question)}
                          >
                            {q.question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <span className="timestamp">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            ))}
            {loading && (
              <div className="message message-loading">
                <span className="avatar">🤖</span>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button
              className="action-btn"
              onClick={() => handleQuickAction('explain')}
              title="Get detailed explanation"
            >
              📖 Explain
            </button>
            <button
              className="action-btn"
              onClick={() => handleQuickAction('compare')}
              title="Compare recommendations"
            >
              ⚖️ Compare
            </button>
            <button
              className="action-btn"
              onClick={() => handleQuickAction('risks')}
              title="Identify risks"
            >
              ⚠️ Risks
            </button>
            <button
              className="action-btn"
              onClick={() => handleQuickAction('summary')}
              title="Get summary"
            >
              📋 Summary
            </button>
          </div>

          {/* Suggested Questions */}
          {suggestedQuestions.length > 0 && (
            <div className="suggested-questions">
              <p className="suggestion-title">💡 Suggested questions:</p>
              <div className="suggestions-grid">
                {suggestedQuestions.slice(0, 3).map((q, idx) => (
                  <button
                    key={idx}
                    className="suggestion-btn"
                    onClick={() => handleSuggestedQuestion(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="chat-input-area">
            <input
              type="text"
              className="chat-input"
              placeholder="Ask me anything about the analysis..."
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter' && !loading) {
                  handleSendMessage();
                }
              }}
              disabled={loading}
            />
            <button
              className="send-btn"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || loading}
              title="Send message"
            >
              {loading ? '...' : '➤'}
            </button>
            <button
              className="clear-btn"
              onClick={handleClearChat}
              title="Clear chat"
            >
              🔄
            </button>
          </div>

          {/* Footer */}
          <div className="chat-footer">
            <small>AI Assistant v1.0 | Powered by GPT-4</small>
          </div>
        </div>
      )}
    </div>
  );
}
