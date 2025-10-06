'use client';

import { useState } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import { Button } from '@/ui';
import { useCreateCompanyAgentMutation } from '@/store/botApi';

const AgentSaveButton = ({ 
  agentData, 
  onSaveSuccess 
}) => {
  const [createAgent, { isLoading, error }] = useCreateCompanyAgentMutation();
  const [saved, setSaved] = useState(false);

  // Debug: Log agent data to see what we're working with
  console.log('AgentSaveButton - agentData:', agentData);
  console.log('AgentSaveButton - name:', agentData.name, 'description:', agentData.description);
  console.log('AgentSaveButton - name trim:', agentData.name?.trim(), 'description trim:', agentData.description?.trim());
  console.log('AgentSaveButton - disabled condition:', !agentData.name?.trim() || !agentData.description?.trim());

  const handleSave = async () => {
    try {
      console.log('Attempting to save agent with data:', agentData);
      const result = await createAgent(agentData).unwrap();
      console.log('Agent save result:', result);
      
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000); // Reset after 3 seconds
        
        if (onSaveSuccess) {
          onSaveSuccess(result.data);
        }
      }
    } catch (err) {
      console.error('Error saving agent:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
    }
  };

  if (saved) {
    return (
      <Button
        variant="success"
        size="lg"
        icon={Check}
        disabled
      >
        Agent Saved!
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSave}
      variant="primary"
      size="lg"
      icon={isLoading ? Loader2 : Save}
      loading={isLoading}
      disabled={!agentData.name?.trim()}
    >
      {isLoading ? 'Saving Agent...' : 'Save Agent'}
    </Button>
  );
};

export default AgentSaveButton;
