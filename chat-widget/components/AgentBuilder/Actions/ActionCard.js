'use client';

import { Edit2, Trash2, ToggleLeft, ToggleRight, Zap } from 'lucide-react';
import { Button } from '@/ui';

const ActionCard = ({ 
  action, 
  onEdit, 
  onDelete, 
  onToggle 
}) => {
  const getWhenLabel = (value) => {
    const labels = {
      'user-mentions': 'User mentions',
      'user-asks-about': 'User asks about',
      'user-requests': 'User requests',
      'user-says': 'User says',
      'user-expresses': 'User expresses',
      'conversation-starts': 'Conversation starts',
      'user-greets': 'User greets'
    };
    return labels[value] || value;
  };

  const getAboutLabel = (value) => {
    const labels = {
      'customizable-service': 'Customizable service',
      'pricing': 'Pricing',
      'support': 'Support',
      'features': 'Features',
      'account': 'Account',
      'billing': 'Billing',
      'refund': 'Refund',
      'demo': 'Demo',
      'documentation': 'Documentation',
      'integration': 'Integration'
    };
    return labels[value] || value;
  };

  const getDoLabel = (value) => {
    const labels = {
      'send-email': 'Send email',
      'fill-form': 'Fill a form',
      'always-talk-about': 'Always talk about',
      'ask-info': 'Ask for info',
      'redirect-page': 'Redirect to page',
      'show-documentation': 'Show documentation',
      'schedule-call': 'Schedule a call',
      'create-ticket': 'Create support ticket',
      'provide-link': 'Provide specific link',
      'escalate-human': 'Escalate to human agent'
    };
    return labels[value] || value;
  };

  const isActive = action.status === 'active';

  return (
    <div className={`bg-card rounded-lg border-card p-4 ${!isActive ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h5 className="font-medium text-primary">{action.description || 'Action Rule'}</h5>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isActive 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Action Rule Display */}
          <div className="bg-surface rounded-md p-3 mb-3">
            <p className="text-sm text-secondary">
              <span className="font-medium text-primary">When</span> user {getWhenLabel(action.when).toLowerCase()} <span className="font-medium text-primary">{getAboutLabel(action.about).toLowerCase()}</span>, <span className="font-medium text-primary">{getDoLabel(action.do).toLowerCase()}</span>.
            </p>
          </div>
          
          <p className="text-xs text-muted">
            Created {new Date(action.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <Button
            onClick={() => onToggle(action.id)}
            variant="ghost"
            size="sm"
            icon={isActive ? ToggleRight : ToggleLeft}
            className={isActive ? 'text-green-600' : 'text-gray-400'}
          />
          <Button
            onClick={() => onEdit(action)}
            variant="ghost"
            size="sm"
            icon={Edit2}
          />
          <Button
            onClick={() => onDelete(action.id)}
            variant="ghost"
            size="sm"
            icon={Trash2}
            className="text-red-500 hover:text-red-700"
          />
        </div>
      </div>
    </div>
  );
};

export default ActionCard;
