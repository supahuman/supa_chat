'use client';

import { FileText, Link, Upload, MessageSquare } from 'lucide-react';

const KnowledgeTabs = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'text', label: 'Text Knowledge', icon: FileText, color: 'blue' },
    { id: 'links', label: 'Website Links', icon: Link, color: 'green' },
    { id: 'files', label: 'File Uploads', icon: Upload, color: 'purple' },
    { id: 'qa', label: 'Q&A Pairs', icon: MessageSquare, color: 'orange' }
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg overflow-x-auto">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-4 py-2 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap ${
              isActive
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <Icon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default KnowledgeTabs;
