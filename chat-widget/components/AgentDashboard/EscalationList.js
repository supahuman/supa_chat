'use client';

import { Button, Card } from '@/ui';

const EscalationList = ({ 
  escalations, 
  agents, 
  onAssignEscalation, 
  onUpdateEscalationStatus, 
  onSelectEscalation 
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'assigned': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-orange-600 bg-orange-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <Card>
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Escalations</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {escalations.map((escalation) => (
            <Card key={escalation.id} variant="outlined" padding="md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(escalation.priority)}`}>
                    {escalation.priority}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(escalation.status)}`}>
                    {escalation.status}
                  </span>
                </div>
                <div className="flex space-x-2">
                  {escalation.status === 'pending' && (
                    <Button
                      onClick={() => onAssignEscalation(escalation.id, agents[0]?.id)}
                      variant="primary"
                      size="xs"
                    >
                      Assign
                    </Button>
                  )}
                  {escalation.status === 'assigned' && (
                    <Button
                      onClick={() => onUpdateEscalationStatus(escalation.id, 'in_progress')}
                      variant="primary"
                      size="xs"
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      Start
                    </Button>
                  )}
                  {escalation.status === 'in_progress' && (
                    <Button
                      onClick={() => onUpdateEscalationStatus(escalation.id, 'resolved')}
                      variant="success"
                      size="xs"
                    >
                      Resolve
                    </Button>
                  )}
                  <Button
                    onClick={() => onSelectEscalation(escalation)}
                    variant="secondary"
                    size="xs"
                  >
                    Chat
                  </Button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{escalation.reason}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Session: {escalation.sessionId} • {new Date(escalation.createdAt).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default EscalationList;
