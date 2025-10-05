'use client';

import { Plus, Bot, Users, Settings } from 'lucide-react';

const QuickActions = ({ 
  currentClient, 
  clients, 
  onAddClient, 
  onShowSettings 
}) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Add New Client Card */}
      <div 
        onClick={onAddClient}
        className="p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 cursor-pointer transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 group"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors duration-200">
            <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Add New Client</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Create a new client configuration</p>
        </div>
      </div>

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
      <div className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Total Clients</h3>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{clients.length}</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">Configured and ready</p>
      </div>

      {/* Settings Card */}
      <div 
        onClick={onShowSettings}
        className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 group"
      >
        <div className="text-center">
          <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors duration-200">
            <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Manage Clients</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">View and edit configurations</p>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
