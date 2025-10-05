'use client';

import { useState } from 'react';
import { ExternalLink, Copy, Check, Play } from 'lucide-react';
import { Button } from '@/ui';
import { Card } from '@/ui';

const EmbedCard = ({ agent, onConfigureEmbed, onCopyEmbedCode, copiedEmbedId }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'training':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {agent.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {agent.description}
          </p>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(agent.status)}`}>
              {agent.status}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Conversations</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {agent.usage?.totalConversations || 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Messages</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {agent.usage?.totalMessages || 0}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Last Used</span>
          <span className="text-gray-900 dark:text-white font-medium">
            {agent.usage?.lastUsed ? formatDate(agent.usage.lastUsed) : 'Never'}
          </span>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        <Button
          size="sm"
          variant="primary"
          icon={ExternalLink}
          onClick={() => onConfigureEmbed(agent)}
          className="w-full"
        >
          Configure Embed
        </Button>
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            icon={copiedEmbedId === agent.agentId ? Check : Copy}
            onClick={() => onCopyEmbedCode(agent.agentId)}
            className="flex-1"
          >
            {copiedEmbedId === agent.agentId ? 'Copied!' : 'Copy Code'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            icon={Play}
            className="flex-1"
          >
            Test
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default EmbedCard;
