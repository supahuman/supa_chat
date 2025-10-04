'use client';

import { useState } from 'react';
import { 
  Bot, 
  Brain, 
  Database, 
  Zap, 
  FileText, 
  GraduationCap,
  Menu,
  X
} from 'lucide-react';
import AIPersona from './AIPersona';
import KnowledgeBase from './KnowledgeBase';

const DashboardLayout = ({ children }) => {
  const [activeTab, setActiveTab] = useState('build');
  const [activeSidebarItem, setActiveSidebarItem] = useState('ai-persona');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    { id: 'build', label: 'Build', icon: Bot },
    { id: 'train', label: 'Train', icon: Brain },
    { id: 'deploy', label: 'Deploy', icon: Zap }
  ];

  const sidebarItems = [
    { id: 'ai-persona', label: 'AI Persona', icon: Bot },
    { id: 'knowledge-base', label: 'Knowledge Base', icon: Database },
    { id: 'actions', label: 'Actions', icon: Zap },
    { id: 'forms', label: 'Forms', icon: FileText },
    { id: 'teach-agent', label: 'Teach Your Agent', icon: GraduationCap }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile-style Top Tab Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-3">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg flex-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-md text-sm font-medium transition-all flex-1 ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
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

      {/* Mobile backdrop overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-10 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex h-[calc(100vh-200px)]">
        {/* Sidebar */}
        <aside className={`${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed md:relative md:translate-x-0 z-50 w-64 md:w-64 h-screen md:h-screen bg-white dark:bg-gray-800 shadow-lg border-r border-gray-200 dark:border-gray-700 transition-transform duration-300 ease-in-out top-0`}>
          <div className="p-4 md:p-6 h-full overflow-y-auto">
            {/* Mobile menu button for sidebar */}
            <div className="md:hidden flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <nav className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSidebarItem(item.id);
                      // Close sidebar on mobile after selection
                      if (window.innerWidth < 768) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeSidebarItem === item.id
                        ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-700'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto md:ml-0">
          <div className="max-w-6xl mx-auto">
            {/* Content Header */}
            <div className="mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {activeTab} - {sidebarItems.find(item => item.id === activeSidebarItem)?.label}
              </h2>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mt-1">
                {getContentDescription(activeTab, activeSidebarItem)}
              </p>
            </div>

            {/* Dynamic Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 md:p-6">
              {children || getDynamicContent(activeTab, activeSidebarItem)}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

// Helper function to get content descriptions
const getContentDescription = (tab, sidebarItem) => {
  const descriptions = {
    build: {
      'ai-persona': 'Define your AI agent\'s personality, tone, and behavior patterns.',
      'knowledge-base': 'Upload and manage knowledge sources for your AI agent.',
      'actions': 'Configure actions and integrations your agent can perform.',
      'forms': 'Create forms for data collection and user interactions.',
      'teach-agent': 'Provide training examples and feedback to improve your agent.'
    },
    train: {
      'ai-persona': 'Refine your agent\'s personality based on training data.',
      'knowledge-base': 'Train your agent with specific knowledge domains.',
      'actions': 'Test and validate your agent\'s action capabilities.',
      'forms': 'Train your agent on form handling and data validation.',
      'teach-agent': 'Provide training examples and monitor learning progress.'
    },
    deploy: {
      'ai-persona': 'Deploy your agent with the configured personality settings.',
      'knowledge-base': 'Deploy your agent with the trained knowledge base.',
      'actions': 'Deploy your agent with configured actions and integrations.',
      'forms': 'Deploy your agent with form handling capabilities.',
      'teach-agent': 'Deploy your trained agent and monitor its performance.'
    }
  };
  
  return descriptions[tab]?.[sidebarItem] || 'Configure your AI agent settings.';
};

// Helper function to get dynamic content based on tab and sidebar item
const getDynamicContent = (tab, sidebarItem) => {
  // AI Persona component
  if (sidebarItem === 'ai-persona') {
    return <AIPersona />;
  }

  // Knowledge Base component
  if (sidebarItem === 'knowledge-base') {
    return <KnowledgeBase />;
  }

  // Default placeholder content for other sections
  return getDefaultContent(tab, sidebarItem);
};

// Helper function to get default content
const getDefaultContent = (tab, sidebarItem) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
        <Bot className="w-8 h-8 text-gray-400 dark:text-gray-500" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {tab.charAt(0).toUpperCase() + tab.slice(1)} - {sidebarItem.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto">
        This section is under development. You'll be able to configure your AI agent's {sidebarItem.replace('-', ' ')} here.
      </p>
    </div>
  );
};

export default DashboardLayout;
