'use client';

import { useState, useEffect } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import { Button } from '@/ui';
import { useCreateCompanyAgentMutation, useUpdateCompanyAgentMutation } from '@/store/botApi';

const AgentSaveButton = ({ 
  agentData, 
  onSaveSuccess 
}) => {
  const [createAgent, { isLoading: isCreating, error: createError }] = useCreateCompanyAgentMutation();
  const [updateAgent, { isLoading: isUpdating, error: updateError }] = useUpdateCompanyAgentMutation();
  const [saved, setSaved] = useState(false);
  
  const isLoading = isCreating || isUpdating;
  const isEditing = !!agentData.agentId;


  // Debug: Log agent data to see what we're working with
  console.log('AgentSaveButton - agentData:', agentData);
  console.log('AgentSaveButton - name:', agentData.name, 'description:', agentData.description);
  console.log('AgentSaveButton - name trim:', agentData.name?.trim(), 'description trim:', agentData.description?.trim());
  console.log('AgentSaveButton - disabled condition:', !agentData.name?.trim());

  const handleSave = async () => {
    try {
      console.log('💾 Attempting to save agent with data:', agentData);
      console.log('📚 Knowledge base data:', agentData.knowledgeBase);
      
      let result;
      if (isEditing) {
        console.log('🔄 Updating existing agent:', agentData.agentId);
        result = await updateAgent({ agentId: agentData.agentId, ...agentData }).unwrap();
      } else {
        console.log('🆕 Creating new agent');
        result = await createAgent(agentData).unwrap();
      }
      
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
        message: err?.message || 'Unknown error',
        status: err?.status || err?.statusCode || 'No status',
        data: err?.data || err?.response?.data || 'No data',
        fullError: err
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
      data-save-button
    >
      <span>{isLoading ? 'Saving Agent...' : (isEditing ? 'Update Agent' : 'Save Agent')}</span>
    </Button>
  );
};

export default AgentSaveButton;
