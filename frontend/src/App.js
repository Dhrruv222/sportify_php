import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import Header from './components/Header';
import ApiConfig from './components/ApiConfig';
import Tabs from './components/Tabs';
import RecommendationsTab from './components/tabs/RecommendationsTab';
import PlayersTab from './components/tabs/PlayersTab';
import ClubsTab from './components/tabs/ClubsTab';
import NewsTab from './components/tabs/NewsTab';
import AnalyticsTab from './components/tabs/AnalyticsTab';
import DocsTab from './components/tabs/DocsTab';

function App() {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('apiUrl') || 'http://localhost:3000/api');
  const [activeTab, setActiveTab] = useState('recommendations');
  const [connectionStatus, setConnectionStatus] = useState('unknown');

  const testConnection = async () => {
    try {
      const response = await axios.get(`${apiUrl}/health`, { timeout: 5000 });
      if (response.status === 200) {
        setConnectionStatus('connected');
      }
    } catch (error) {
      setConnectionStatus('disconnected');
    }
  };

  const handleApiUrlChange = (newUrl) => {
    setApiUrl(newUrl);
    localStorage.setItem('apiUrl', newUrl);
    setConnectionStatus('unknown');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'recommendations':
        return <RecommendationsTab apiUrl={apiUrl} />;
      case 'players':
        return <PlayersTab apiUrl={apiUrl} />;
      case 'clubs':
        return <ClubsTab apiUrl={apiUrl} />;
      case 'news':
        return <NewsTab apiUrl={apiUrl} />;
      case 'analytics':
        return <AnalyticsTab apiUrl={apiUrl} />;
      case 'docs':
        return <DocsTab />;
      default:
        return null;
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="container">
        <ApiConfig 
          apiUrl={apiUrl} 
          onUrlChange={handleApiUrlChange}
          onTest={testConnection}
          status={connectionStatus}
        />
        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="tab-content">
          {renderTab()}
        </div>
      </div>
    </div>
  );
}

export default App;
