'use client';

import { Bot, Brain, Zap, Menu } from 'lucide-react';
import { Button } from '@/ui';

const TopTabBar = ({ activeTab, setActiveTab, onToggleSidebar }) => {
  const tabs = [
    { id: 'build', label: 'Build', icon: Bot },
    { id: 'train', label: 'Train', icon: Brain },
    { id: 'deploy', label: 'Deploy', icon: Zap }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="px-4 py-4">
        <div className="flex items-center space-x-4">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-2">
            <Bot className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-gray-900 dark:text-white">Agent Builder</span>
          </div>
          
          {/* Mobile menu button */}
          <Button
            onClick={onToggleSidebar}
            variant="ghost"
            size="sm"
            icon={Menu}
            className="md:hidden"
          />
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex-1 max-w-md">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 ${
                    activeTab === tab.id
                      ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopTabBar;
