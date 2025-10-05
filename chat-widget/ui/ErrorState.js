'use client';

import { XCircle } from 'lucide-react';
import Button from './Button';

const ErrorState = ({ 
  title = 'Something went wrong',
  description,
  onRetry,
  className = ''
}) => {
  return (
    <div className={`p-8 text-center ${className}`}>
      <XCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
      <p className="text-red-600 dark:text-red-400 mb-2">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
          {description}
        </p>
      )}
      {onRetry && (
        <Button 
          variant="secondary" 
          size="sm" 
          onClick={onRetry}
        >
          Retry
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
