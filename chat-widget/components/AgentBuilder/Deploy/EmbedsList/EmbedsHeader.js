'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/ui';

const EmbedsHeader = ({ onCreateEmbed }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Embed Codes</h2>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Generate and manage embed codes for your AI agents
        </p>
      </div>
      <Button icon={Plus} variant="primary" onClick={onCreateEmbed}>
        Create Embed
      </Button>
    </div>
  );
};

export default EmbedsHeader;
