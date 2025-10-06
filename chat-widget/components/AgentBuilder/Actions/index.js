'use client';

import { useState } from 'react';
import ActionHeader from './ActionHeader';
import ActionForm from './ActionForm';
import ActionList from './ActionList';

const Actions = ({ currentAgentId }) => {
  const [actions, setActions] = useState([]);
  const [editingAction, setEditingAction] = useState(null);

  const [formData, setFormData] = useState({
    when: '',
    about: '',
    do: '',
    description: ''
  });

  const handleSaveAction = () => {
    const newAction = {
      id: Date.now().toString(),
      when: formData.when,
      about: formData.about,
      do: formData.do,
      description: formData.description,
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    if (editingAction) {
      setActions(actions.map(action => 
        action.id === editingAction.id ? { ...newAction, id: editingAction.id } : action
      ));
    } else {
      setActions([...actions, newAction]);
    }

    setEditingAction(null);
    setFormData({
      when: '',
      about: '',
      do: '',
      description: ''
    });
  };

  const handleCancel = () => {
    setEditingAction(null);
    setFormData({
      when: '',
      about: '',
      do: '',
      description: ''
    });
  };

  const handleEditAction = (action) => {
    setEditingAction(action);
    setFormData({
      when: action.when,
      about: action.about,
      do: action.do,
      description: action.description
    });
  };

  const handleDeleteAction = (id) => {
    setActions(actions.filter(action => action.id !== id));
  };

  const handleToggleAction = (id) => {
    setActions(actions.map(action => 
      action.id === id ? { ...action, status: action.status === 'active' ? 'inactive' : 'active' } : action
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-divider pb-4">
        <h3 className="heading-lg">
          Actions
        </h3>
        <p className="text-sm text-secondary mt-1">
          Define automated responses and behaviors for your AI agent. Create rules that trigger specific actions based on user interactions.
        </p>
      </div>

      {/* Header */}
      <ActionHeader 
        actionsLength={actions.length}
      />

      {/* Action Form - Always Visible */}
      <ActionForm
        formData={formData}
        setFormData={setFormData}
        onSave={handleSaveAction}
        onCancel={handleCancel}
        isEditing={!!editingAction}
      />

      {/* Actions List */}
      <ActionList
        actions={actions}
        onEdit={handleEditAction}
        onDelete={handleDeleteAction}
        onToggle={handleToggleAction}
      />
    </div>
  );
};

export default Actions;
