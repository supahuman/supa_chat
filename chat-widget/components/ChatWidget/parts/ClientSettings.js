'use client';
import React, { useState } from 'react';
import { Settings, Database, Bot, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useGetClientsQuery, useTestDatabaseConnectionMutation, useTestLLMConnectionMutation } from '../../../store/botApi';

export default function ClientSettings({ isOpen, onClose, currentClient, onClientChange }) {
  const { data: clientsData, isLoading, error, refetch } = useGetClientsQuery(undefined, {
    skip: !isOpen
  });
  const [testDatabaseConnection] = useTestDatabaseConnectionMutation();
  const [testLLMConnection] = useTestLLMConnectionMutation();

  const clients = clientsData?.clients || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <h3 className="font-semibold">Client Settings</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Loading clients...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-800 dark:text-red-200 text-sm">
                  {error?.data?.error || error?.message || 'Failed to load clients'}
                </span>
              </div>
            </div>
          )}

          {!isLoading && !error && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Available Clients</h4>
              {clients.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No clients configured</p>
                  <p className="text-sm">Contact your administrator to set up clients</p>
                </div>
              ) : (
                clients.map((client) => (
                  <ClientCard
                    key={client.clientId}
                    client={client}
                    isActive={currentClient?.clientId === client.clientId}
                    onSelect={() => onClientChange(client)}
                    onTestDatabase={() => testDatabaseConnection(client.clientId)}
                    onTestLLM={() => testLLMConnection(client.clientId)}
                  />
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Current: {currentClient?.name || 'None selected'}
            </div>
            <button
              onClick={() => refetch()}
              className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ClientCard({ client, isActive, onSelect, onTestDatabase, onTestLLM }) {
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const handleTestConnection = async (testType) => {
    setTesting(true);
    try {
      const result = await (testType === 'database' ? onTestDatabase() : onTestLLM());
      setConnectionStatus(result?.data?.success ? 'success' : 'error');
    } catch (error) {
      setConnectionStatus('error');
    } finally {
      setTesting(false);
      // Clear status after 3 seconds
      setTimeout(() => setConnectionStatus(null), 3000);
    }
  };

  return (
    <div className={`border rounded-lg p-3 transition-all duration-200 ${
      isActive 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <h5 className="font-medium text-gray-900 dark:text-gray-100">{client.name}</h5>
            {isActive && (
              <CheckCircle className="w-4 h-4 text-green-600" />
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {client.description || 'No description'}
          </p>
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center space-x-1">
              <Database className="w-3 h-3" />
              <span>{client.vectorDB?.type || 'Unknown'}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Bot className="w-3 h-3" />
              <span>{client.llm?.provider || 'Unknown'}</span>
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTestConnection('database')}
            disabled={testing}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
            title="Test Database"
          >
            {testing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : connectionStatus === 'success' ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : connectionStatus === 'error' ? (
              <XCircle className="w-3 h-3 text-red-600" />
            ) : (
              'DB'
            )}
          </button>
          
          <button
            onClick={() => handleTestConnection('llm')}
            disabled={testing}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
            title="Test LLM"
          >
            {testing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : connectionStatus === 'success' ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : connectionStatus === 'error' ? (
              <XCircle className="w-3 h-3 text-red-600" />
            ) : (
              'LLM'
            )}
          </button>
          
          <button
            onClick={onSelect}
            className={`px-3 py-1 text-xs rounded transition-colors duration-200 ${
              isActive
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {isActive ? 'Active' : 'Select'}
          </button>
        </div>
      </div>
    </div>
  );
}
