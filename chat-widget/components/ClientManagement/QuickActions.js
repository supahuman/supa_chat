'use client';

import { Plus, Bot, Users, Settings } from 'lucide-react';
import { ActionCard, StatsCard } from '@/ui';

const QuickActions = ({ 
  currentClient, 
  clients, 
  onAddClient, 
  onShowSettings 
}) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Add New Client Card */}
      <ActionCard
        icon={Plus}
        title="Add New Client"
        description="Create a new client configuration"
        onClick={onAddClient}
        variant="dashed"
        color="blue"
      />

      {/* Current Client Status */}
      {currentClient && (
        <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{currentClient.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Client</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Database:</span>
              <span className="font-medium text-gray-900 dark:text-white">{currentClient.vectorDB?.type || 'Unknown'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">LLM:</span>
              <span className="font-medium text-gray-900 dark:text-white">{currentClient.llm?.provider || 'Unknown'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <StatsCard
        icon={Users}
        title="Total Clients"
        value={clients.length}
        description="Configured and ready"
        color="purple"
      />

      {/* Settings Card */}
      <ActionCard
        icon={Settings}
        title="Manage Clients"
        description="View and edit configurations"
        onClick={onShowSettings}
        color="gray"
      />
    </div>
  );
};

export default QuickActions;
