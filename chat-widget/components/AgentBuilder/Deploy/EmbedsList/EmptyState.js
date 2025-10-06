'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/ui';
import { Card } from '@/ui';

const EmptyState = ({ onGoToAgents }) => {
  return (
    <Card className="p-12 text-center">
      <ExternalLink className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        No Agents Available
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Create an agent first to generate embed codes
      </p>
      <Button variant="outline" onClick={onGoToAgents}>
        Go to Agents
      </Button>
    </Card>
  );
};

export default EmptyState;
