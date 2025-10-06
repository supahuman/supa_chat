'use client';

import EmbedsHeader from './EmbedsList/EmbedsHeader';
import EmbedsGrid from './EmbedsList/EmbedsGrid';
import EmptyState from './EmbedsList/EmptyState';
import EmbedModal from './EmbedsList/EmbedModal';
import LoadingState from './EmbedsList/LoadingState';
import ErrorState from './EmbedsList/ErrorState';
import { useEmbeds } from './EmbedsList/useEmbeds';

const EmbedsList = () => {
  const {
    agents,
    loading,
    error,
    selectedAgent,
    copiedEmbedId,
    handleCopyEmbedCode,
    handleConfigureEmbed,
    handleCloseDeploymentSettings,
    handleCreateEmbed,
    handleGoToAgents,
    refetch
  } = useEmbeds();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      <EmbedsHeader onCreateEmbed={handleCreateEmbed} />
      
      {agents.length === 0 ? (
        <EmptyState onGoToAgents={handleGoToAgents} />
      ) : (
        <EmbedsGrid
          agents={agents}
          onConfigureEmbed={handleConfigureEmbed}
          onCopyEmbedCode={handleCopyEmbedCode}
          copiedEmbedId={copiedEmbedId}
        />
      )}

      <EmbedModal
        selectedAgent={selectedAgent}
        onClose={handleCloseDeploymentSettings}
      />
    </div>
  );
};

export default EmbedsList;
