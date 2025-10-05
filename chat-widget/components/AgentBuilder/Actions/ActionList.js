'use client';

import { Zap } from 'lucide-react';
import ActionCard from './ActionCard';

const ActionList = ({ 
  actions, 
  onEdit, 
  onDelete, 
  onToggle 
}) => {
  const getTabIcon = () => {
    return '⚡';
  };

  if (actions.length === 0) {
    return (
      <div className="text-center py-12 bg-surface rounded-lg">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">{getTabIcon()}</span>
        </div>
        <h4 className="heading-lg mb-2">
          No Action Rules Added Yet
        </h4>
        <p className="text-secondary max-w-md mx-auto">
          Click "Add Action Rule" to start creating automated responses and behaviors for your AI agent.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <ActionCard
          key={action.id}
          action={action}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
};

export default ActionList;
