'use client';
import { useState } from 'react';
import { Plus, Settings, Database, Bot, CheckCircle, XCircle, Loader2, Users, Zap } from 'lucide-react';
import { useGetClientsQuery, useCreateClientMutation, useTestDatabaseConnectionMutation, useTestLLMConnectionMutation } from '../../store/botApi';
import ClientSettings from '../ChatWidget/parts/ClientSettings';
import ClientOnboarding from '../ChatWidget/parts/ClientOnboarding';
import WidgetCodeGenerator from './WidgetCodeGenerator';

export default function ClientManagementPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentClient, setCurrentClient] = useState(null);

  const { data: clientsData, isLoading, error, refetch } = useGetClientsQuery();
  const [createClient, { isLoading: isCreating }] = useCreateClientMutation();
  const [testDatabaseConnection] = useTestDatabaseConnectionMutation();
  const [testLLMConnection] = useTestLLMConnectionMutation();

  const clients = clientsData?.clients || [];

  const handleClientSelect = (client) => {
    setCurrentClient(client);
    setShowSettings(false);
  };

  const handleTestConnection = async (clientId, type) => {
    try {
      const result = await (type === 'database' ? testDatabaseConnection(clientId) : testLLMConnection(clientId));
      return result?.data?.success || false;
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-black dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
            Client Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl">
            Manage your chatbot clients, configure databases and LLM providers, and test connections. 
            Each client can have their own database and AI model configuration.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Add New Client Card */}
          <div 
            onClick={() => setShowOnboarding(true)}
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
            onClick={() => setShowSettings(true)}
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

        {/* Widget Code Generator */}
        {currentClient && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
            <WidgetCodeGenerator client={currentClient} />
          </div>
        )}

        {/* Client List */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Clients</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your client configurations and test connections
            </p>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
              </div>
            ) : error ? (
              <div className="p-8 text-center">
                <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-red-600 dark:text-red-400">Failed to load clients</p>
                <button 
                  onClick={() => refetch()}
                  className="mt-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  Retry
                </button>
              </div>
            ) : clients.length === 0 ? (
              <div className="p-8 text-center">
                <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">No clients configured</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                  Get started by creating your first client configuration
                </p>
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Create First Client
                </button>
              </div>
            ) : (
              clients.map((client) => (
                <ClientCard
                  key={client.clientId}
                  client={client}
                  isActive={currentClient?.clientId === client.clientId}
                  onSelect={() => handleClientSelect(client)}
                  onTestDatabase={() => handleTestConnection(client.clientId, 'database')}
                  onTestLLM={() => handleTestConnection(client.clientId, 'llm')}
                />
              ))
            )}
          </div>
        </div>

        {/* Modals */}
        <ClientOnboarding
          isOpen={showOnboarding}
          onClose={() => setShowOnboarding(false)}
          onClientCreated={(clientId) => {
            setShowOnboarding(false);
            refetch();
          }}
        />

        <ClientSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentClient={currentClient}
          onClientChange={handleClientSelect}
        />
      </div>
    </div>
  );
}

function ClientCard({ client, isActive, onSelect, onTestDatabase, onTestLLM }) {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const handleTest = async (type) => {
    setTesting(true);
    const success = await (type === 'database' ? onTestDatabase() : onTestLLM());
    setTestResult(success ? 'success' : 'error');
    setTesting(false);
    setTimeout(() => setTestResult(null), 3000);
  };

  return (
    <div className={`p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 ${
      isActive ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            isActive ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Bot className={`w-6 h-6 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{client.name}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{client.description || 'No description'}</p>
            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center space-x-1">
                <Database className="w-3 h-3" />
                <span>{client.vectorDB?.type || 'Unknown'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Zap className="w-3 h-3" />
                <span>{client.llm?.provider || 'Unknown'}</span>
              </span>
              <span className="text-gray-400">•</span>
              <span>ID: {client.clientId}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => handleTest('database')}
            disabled={testing}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
            title="Test Database Connection"
          >
            {testing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : testResult === 'success' ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : testResult === 'error' ? (
              <XCircle className="w-3 h-3 text-red-600" />
            ) : (
              'Test DB'
            )}
          </button>

          <button
            onClick={() => handleTest('llm')}
            disabled={testing}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
            title="Test LLM Connection"
          >
            {testing ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : testResult === 'success' ? (
              <CheckCircle className="w-3 h-3 text-green-600" />
            ) : testResult === 'error' ? (
              <XCircle className="w-3 h-3 text-red-600" />
            ) : (
              'Test LLM'
            )}
          </button>

          <button
            onClick={onSelect}
            className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
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
