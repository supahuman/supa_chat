'use client';

import React from 'react';
import { Bot } from 'lucide-react';
import { Card } from '@/ui';
import AIPersona from './AIPersona';
import KnowledgeBase from './KnowledgeBase';
import Actions from './Actions';
import Tools from './Tools';
import TeachYourAgent from './TeachYourAgent';
import AgentsList from './Deploy/AgentsList';
import EmbedsList from './Deploy/EmbedsList';
import DeploymentSettings from './Deploy/DeploymentSettings';
import ApiKeys from './Deploy/ApiKeys';

const ContentArea = ({ 
  activeTab, 
  activeSidebarItem, 
  currentAgentId,
  selectedAgent,
  onAgentCreated,
  onEditAgent,
  onSelectAgent,
  children
}) => {
  const getSidebarItems = (tab) => {
    switch (tab) {
      case 'build':
      case 'train':
        return [
          { id: 'agents', label: 'Your Agents' },
          { id: 'ai-persona', label: 'AI Persona' },
          { id: 'knowledge-base', label: 'Knowledge Base' },
          { id: 'actions', label: 'Actions' },
          { id: 'forms', label: 'Forms' },
          { id: 'tools', label: 'Tools' },
          { id: 'teach-agent', label: 'Teach Your Agent' }
        ];
      case 'deploy':
        return [
          { id: 'agents', label: 'Agents' },
          { id: 'embeds', label: 'Embeds' },
          { id: 'api-keys', label: 'API Keys' },
          { id: 'settings', label: 'Settings' },
          { id: 'analytics', label: 'Analytics' }
        ];
      default:
        return [];
    }
  };

  const sidebarItems = getSidebarItems(activeTab);

  const getContentDescription = (tab, sidebarItem) => {
    const descriptions = {
      build: {
        'agents': 'View and manage all your AI agents.',
        'ai-persona': 'Define your AI agent\'s personality, tone, and behavior patterns.',
        'knowledge-base': 'Upload and manage knowledge sources for your AI agent.',
        'actions': 'Configure actions and integrations your agent can perform.',
        'forms': 'Create forms for data collection and user interactions.',
        'tools': 'Select tools and integrations for your agent to use.',
        'teach-agent': 'Provide training examples and feedback to improve your agent.'
      },
      train: {
        'agents': 'View and manage all your AI agents.',
        'ai-persona': 'Refine your agent\'s personality based on training data.',
        'knowledge-base': 'Train your agent with specific knowledge domains.',
        'actions': 'Test and validate your agent\'s action capabilities.',
        'forms': 'Train your agent on form handling and data validation.',
        'tools': 'Configure and test tool integrations for your agent.',
        'teach-agent': 'Provide training examples and monitor learning progress.'
      },
      deploy: {
        'agents': 'View and manage all your deployed AI agents.',
        'embeds': 'Generate embed codes for your AI agents.',
        'api-keys': 'View and manage API keys for your agents.',
        'settings': 'Configure deployment settings and preferences.',
        'analytics': 'Monitor agent performance and usage analytics.'
      }
    };
    
    return descriptions[tab]?.[sidebarItem] || 'Configure your AI agent settings.';
  };

  const getDynamicContent = (tab, sidebarItem) => {
    // Build/Train tab components
    if (tab === 'build' || tab === 'train') {
      // If we have a currentAgentId, show edit form
      if (currentAgentId) {
        return <AIPersona currentAgentId={currentAgentId} onAgentCreated={onAgentCreated} isEditMode={true} />;
      }

      // Agents list component
      if (sidebarItem === 'agents') {
        return <AgentsList onEditAgent={onEditAgent} onSelectAgent={onSelectAgent} showEditButton={true} />;
      }

      // AI Persona component
      if (sidebarItem === 'ai-persona') {
        return <AIPersona currentAgentId={currentAgentId} onAgentCreated={onAgentCreated} isEditMode={!!currentAgentId} />;
      }

      // Knowledge Base component
      if (sidebarItem === 'knowledge-base') {
        return <KnowledgeBase currentAgentId={currentAgentId} />;
      }

      // Actions component
      if (sidebarItem === 'actions') {
        return <Actions currentAgentId={currentAgentId} />;
      }

      // Tools component
      if (sidebarItem === 'tools') {
        return <Tools currentAgentId={currentAgentId} />;
      }

      // Teach Your Agent component
      if (sidebarItem === 'teach-agent') {
        return <TeachYourAgent currentAgentId={currentAgentId} />;
      }
    }

    // Deploy tab components
    if (tab === 'deploy') {
      // Agents list component
      if (sidebarItem === 'agents') {
        return <AgentsList onEditAgent={onEditAgent} onSelectAgent={onSelectAgent} showEditButton={false} />;
      }

      // Embeds list component
      if (sidebarItem === 'embeds') {
        return <EmbedsList />;
      }

      // API Keys component
      if (sidebarItem === 'api-keys') {
        console.log('🔑 Rendering API Keys component');
        return <ApiKeys />;
      }

      // Settings component
      if (sidebarItem === 'settings') {
        return <DeploymentSettings selectedAgent={selectedAgent} />;
      }

      // Analytics component (placeholder)
      if (sidebarItem === 'analytics') {
        return getDefaultContent(tab, sidebarItem);
      }
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
    <main className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
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
          {activeSidebarItem === 'teach-agent' ? (
            // Teach Your Agent gets special treatment without Card wrapper
            <div className="h-[600px] bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {children || getDynamicContent(activeTab, activeSidebarItem)}
            </div>
          ) : (
            <Card>
              {children || getDynamicContent(activeTab, activeSidebarItem)}
            </Card>
          )}
        </div>
      </div>
    </main>
  );
};

export default ContentArea;
