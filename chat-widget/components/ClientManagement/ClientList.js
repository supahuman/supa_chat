'use client';

import { Loader2, XCircle, Database } from 'lucide-react';
import ClientCard from './ClientCard';

const ClientList = ({ 
  clients, 
  isLoading, 
  error, 
  currentClient, 
  onClientSelect, 
  onTestConnection, 
  onRetry, 
  onAddClient 
}) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
        <p className="text-red-600 dark:text-red-400">Failed to load clients</p>
        <button 
          onClick={onRetry}
          className="mt-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="p-8 text-center">
        <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400 mb-2">No clients configured</p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
          Get started by creating your first client configuration
        </p>
        <button
          onClick={onAddClient}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
        >
          Create First Client
        </button>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {clients.map((client) => (
        <ClientCard
          key={client.clientId}
          client={client}
          isActive={currentClient?.clientId === client.clientId}
          onSelect={() => onClientSelect(client)}
          onTestDatabase={() => onTestConnection(client.clientId, 'database')}
          onTestLLM={() => onTestConnection(client.clientId, 'llm')}
        />
      ))}
    </div>
  );
};

export default ClientList;
