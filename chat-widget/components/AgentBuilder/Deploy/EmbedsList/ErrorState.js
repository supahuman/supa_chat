'use client';

import { ExternalLink } from 'lucide-react';
import { Button } from '@/ui';

const ErrorState = ({ error, onRetry }) => {
  return (
    <div className="text-center py-12">
      <div className="text-red-600 dark:text-red-400 mb-4">
        <ExternalLink className="w-12 h-12 mx-auto mb-2" />
        <p>{error}</p>
      </div>
      <Button onClick={onRetry} variant="outline">
        Try Again
      </Button>
    </div>
  );
};

export default ErrorState;
