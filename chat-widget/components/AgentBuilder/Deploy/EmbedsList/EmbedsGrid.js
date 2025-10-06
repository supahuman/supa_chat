'use client';

import EmbedCard from './EmbedCard';

const EmbedsGrid = ({ agents, onConfigureEmbed, onCopyEmbedCode, copiedEmbedId }) => {
  if (agents.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <EmbedCard
          key={agent.agentId}
          agent={agent}
          onConfigureEmbed={onConfigureEmbed}
          onCopyEmbedCode={onCopyEmbedCode}
          copiedEmbedId={copiedEmbedId}
        />
      ))}
    </div>
  );
};

export default EmbedsGrid;
