'use client';

import { Database } from 'lucide-react';
import { LoadingSpinner, ErrorState, EmptyState, Button } from '@/ui';
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
        <LoadingSpinner size="md" className="mx-auto mb-2" />
        <p className="text-gray-600 dark:text-gray-400">Loading clients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load clients"
        onRetry={onRetry}
      />
    );
  }

  if (clients.length === 0) {
    return (
      <EmptyState
        icon={Database}
        title="No clients configured"
        description="Get started by creating your first client configuration"
        action={
          <Button onClick={onAddClient}>
            Create First Client
          </Button>
        }
      />
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
