'use client';

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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Escalations</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {escalations.map((escalation) => (
            <div key={escalation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
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
                    <button
                      onClick={() => onAssignEscalation(escalation.id, agents[0]?.id)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                    >
                      Assign
                    </button>
                  )}
                  {escalation.status === 'assigned' && (
                    <button
                      onClick={() => onUpdateEscalationStatus(escalation.id, 'in_progress')}
                      className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                    >
                      Start
                    </button>
                  )}
                  {escalation.status === 'in_progress' && (
                    <button
                      onClick={() => onUpdateEscalationStatus(escalation.id, 'resolved')}
                      className="text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Resolve
                    </button>
                  )}
                  <button
                    onClick={() => onSelectEscalation(escalation)}
                    className="text-xs bg-gray-600 text-white px-3 py-1 rounded hover:bg-gray-700"
                  >
                    Chat
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{escalation.reason}</p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Session: {escalation.sessionId} • {new Date(escalation.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EscalationList;
