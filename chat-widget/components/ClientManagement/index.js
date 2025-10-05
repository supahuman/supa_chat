'use client';

import { useState } from 'react';
import { useGetClientsQuery, useCreateClientMutation, useTestDatabaseConnectionMutation, useTestLLMConnectionMutation } from '../../store/botApi';
import ClientSettings from '../ChatWidget/parts/ClientSettings';
import ClientOnboarding from '../ChatWidget/parts/ClientOnboarding';
import WidgetCodeGenerator from './WidgetCodeGenerator';
import PageHeader from './PageHeader';
import QuickActions from './QuickActions';
import ClientList from './ClientList';

const ClientManagementPage = () => {
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
        <PageHeader />

        {/* Quick Actions */}
        <QuickActions
          currentClient={currentClient}
          clients={clients}
          onAddClient={() => setShowOnboarding(true)}
          onShowSettings={() => setShowSettings(true)}
        />

        {/* Widget Code Generator */}
        {currentClient && (
          <div className="bg-card rounded-xl border-card p-6 mb-8">
            <WidgetCodeGenerator client={currentClient} />
          </div>
        )}

        {/* Client List */}
        <div className="bg-card rounded-xl border-card overflow-hidden">
          <div className="card-header">
            <h3 className="heading-lg">All Clients</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage your client configurations and test connections
            </p>
          </div>

          <ClientList
            clients={clients}
            isLoading={isLoading}
            error={error}
            currentClient={currentClient}
            onClientSelect={handleClientSelect}
            onTestConnection={handleTestConnection}
            onRetry={refetch}
            onAddClient={() => setShowOnboarding(true)}
          />
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
};

export default ClientManagementPage;
