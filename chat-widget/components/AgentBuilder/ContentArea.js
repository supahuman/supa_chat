'use client';

import { Bot } from 'lucide-react';
import { Card } from '@/ui';
import AIPersona from './AIPersona';
import KnowledgeBase from './KnowledgeBase';
import Actions from './Actions';
import TeachYourAgent from './TeachYourAgent';

const ContentArea = ({ 
  activeTab, 
  activeSidebarItem, 
  agentData,
  setAgentData,
  children 
}) => {
  const sidebarItems = [
    { id: 'ai-persona', label: 'AI Persona' },
    { id: 'knowledge-base', label: 'Knowledge Base' },
    { id: 'actions', label: 'Actions' },
    { id: 'forms', label: 'Forms' },
    { id: 'teach-agent', label: 'Teach Your Agent' }
  ];

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

  const getDynamicContent = (tab, sidebarItem) => {
          // AI Persona component
          if (sidebarItem === 'ai-persona') {
            return <AIPersona agentData={agentData} setAgentData={setAgentData} />;
          }

          // Knowledge Base component
          if (sidebarItem === 'knowledge-base') {
            return <KnowledgeBase agentData={agentData} setAgentData={setAgentData} />;
          }

          // Actions component
          if (sidebarItem === 'actions') {
            return <Actions agentData={agentData} setAgentData={setAgentData} />;
          }

          // Teach Your Agent component
          if (sidebarItem === 'teach-agent') {
            return <TeachYourAgent agentData={agentData} setAgentData={setAgentData} />;
          }

    // Default placeholder content for other sections
    return getDefaultContent(tab, sidebarItem);
  };

  const getDefaultContent = (tab, sidebarItem) => {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Bot className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="heading-lg mb-2">
          {tab.charAt(0).toUpperCase() + tab.slice(1)} - {sidebarItem.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </h3>
        <p className="text-secondary max-w-md mx-auto">
          This section is under development. You'll be able to configure your AI agent's {sidebarItem.replace('-', ' ')} here.
        </p>
      </div>
    );
  };

  const currentItem = sidebarItems.find(item => item.id === activeSidebarItem);

  return (
    <main className="flex-1 p-4 md:p-6 overflow-y-auto md:ml-0">
      <div className="max-w-6xl mx-auto">
        {/* Content Header */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold text-primary capitalize">
            {activeTab} - {currentItem?.label}
          </h2>
          <p className="text-sm md:text-base text-secondary mt-1">
            {getContentDescription(activeTab, activeSidebarItem)}
          </p>
        </div>

        {/* Dynamic Content */}
        <Card>
          {children || getDynamicContent(activeTab, activeSidebarItem)}
        </Card>
      </div>
    </main>
  );
};

export default ContentArea;
