import React from 'react';
import { Target, Users, Building2, Newspaper, BarChart3, BookOpen } from 'lucide-react';
import './Tabs.css';

export default function Tabs({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'recommendations', label: 'Recommendations', icon: Target },
    { id: 'players', label: 'Players', icon: Users },
    { id: 'clubs', label: 'Clubs', icon: Building2 },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'docs', label: 'Docs', icon: BookOpen }
  ];

  return (
    <div className="tabs">
      <div className="tabs-inner">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
            >
              <Icon size={20} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
