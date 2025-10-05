'use client';

import { ThumbsUp, ThumbsDown, Trash2, MessageSquare, Star } from 'lucide-react';
import { Button } from '@/ui';

const TrainingExamples = ({ 
  examples, 
  onDelete, 
  onRate, 
  onLoad 
}) => {
  const getRatingIcon = (rating) => {
    switch (rating) {
      case 'good':
        return <ThumbsUp className="w-4 h-4 text-green-600" />;
      case 'bad':
        return <ThumbsDown className="w-4 h-4 text-red-600" />;
      default:
        return <Star className="w-4 h-4 text-gray-400" />;
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'good':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'bad':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (examples.length === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-lg">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🎓</span>
        </div>
        <h4 className="heading-lg mb-2">
          No Training Examples Yet
        </h4>
        <p className="text-secondary max-w-md mx-auto">
          Create conversation examples above to train your agent. The more examples you provide, the better your agent will perform.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="heading-lg">
          Training Examples
        </h4>
        <span className="text-sm text-secondary">
          {examples.length} example{examples.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {examples.map((example) => (
          <div key={example.id} className="bg-card rounded-lg border-card p-4">
            <div className="space-y-3">
              {/* Customer Message */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">C</span>
                </div>
                <div className="flex-1">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg px-3 py-2">
                    <p className="text-sm text-gray-900 dark:text-white">{example.customerMessage}</p>
                  </div>
                  <p className="text-xs text-muted mt-1">Customer</p>
                </div>
              </div>

              {/* Agent Response */}
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-medium">A</span>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg px-3 py-2">
                    <p className="text-sm text-gray-900 dark:text-white">{example.agentResponse}</p>
                  </div>
                  <p className="text-xs text-muted mt-1">Agent</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted">Rate this example:</span>
                  <Button
                    onClick={() => onRate(example.id, 'good')}
                    variant="ghost"
                    size="xs"
                    icon={ThumbsUp}
                    className={example.rating === 'good' ? 'text-green-600 bg-green-100 dark:bg-green-900/20' : ''}
                  />
                  <Button
                    onClick={() => onRate(example.id, 'bad')}
                    variant="ghost"
                    size="xs"
                    icon={ThumbsDown}
                    className={example.rating === 'bad' ? 'text-red-600 bg-red-100 dark:bg-red-900/20' : ''}
                  />
                  {example.rating && (
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRatingColor(example.rating)}`}>
                      {getRatingIcon(example.rating)}
                      <span className="ml-1 capitalize">{example.rating}</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => onLoad(example)}
                    variant="ghost"
                    size="xs"
                    icon={MessageSquare}
                  >
                    Load
                  </Button>
                  <Button
                    onClick={() => onDelete(example.id)}
                    variant="ghost"
                    size="xs"
                    icon={Trash2}
                    className="text-red-500 hover:text-red-700"
                  />
                </div>
              </div>

              <p className="text-xs text-muted">
                Created {new Date(example.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainingExamples;
