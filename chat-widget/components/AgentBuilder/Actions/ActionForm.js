'use client';

import { Save, X } from 'lucide-react';
import { Button, Card } from '@/ui';
import { Select, Input } from '@/ui';

const ActionForm = ({ 
  formData, 
  setFormData, 
  onSave, 
  onCancel, 
  isEditing 
}) => {
  const whenOptions = [
    { value: 'user-mentions', label: 'User mentions' },
    { value: 'user-asks-about', label: 'User asks about' },
    { value: 'user-requests', label: 'User requests' },
    { value: 'user-says', label: 'User says' },
    { value: 'user-expresses', label: 'User expresses' },
    { value: 'conversation-starts', label: 'Conversation starts' },
    { value: 'user-greets', label: 'User greets' }
  ];

  const aboutOptions = [
    { value: 'customizable-service', label: 'Customizable service' },
    { value: 'pricing', label: 'Pricing' },
    { value: 'support', label: 'Support' },
    { value: 'features', label: 'Features' },
    { value: 'account', label: 'Account' },
    { value: 'billing', label: 'Billing' },
    { value: 'refund', label: 'Refund' },
    { value: 'demo', label: 'Demo' },
    { value: 'documentation', label: 'Documentation' },
    { value: 'integration', label: 'Integration' }
  ];

  const doOptions = [
    { value: 'send-email', label: 'Send email' },
    { value: 'fill-form', label: 'Fill a form' },
    { value: 'always-talk-about', label: 'Always talk about' },
    { value: 'ask-info', label: 'Ask for info' },
    { value: 'redirect-page', label: 'Redirect to page' },
    { value: 'show-documentation', label: 'Show documentation' },
    { value: 'schedule-call', label: 'Schedule a call' },
    { value: 'create-ticket', label: 'Create support ticket' },
    { value: 'provide-link', label: 'Provide specific link' },
    { value: 'escalate-human', label: 'Escalate to human agent' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="heading-lg">
            {isEditing ? 'Edit Action Rule' : 'Create New Action Rule'}
          </h4>
          {isEditing && (
            <Button
              onClick={onCancel}
              variant="ghost"
              size="sm"
              icon={X}
            />
          )}
        </div>

        {/* When - About - Do Structure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* When */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary">
              When
            </label>
            <Select
              value={formData.when}
              onChange={(e) => handleInputChange('when', e.target.value)}
              options={whenOptions}
              placeholder="Select trigger"
            />
          </div>

          {/* About */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary">
              About
            </label>
            <Select
              value={formData.about}
              onChange={(e) => handleInputChange('about', e.target.value)}
              options={aboutOptions}
              placeholder="Select topic"
            />
          </div>

          {/* Do */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-primary">
              Do
            </label>
            <Select
              value={formData.do}
              onChange={(e) => handleInputChange('do', e.target.value)}
              options={doOptions}
              placeholder="Select action"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-primary">
            Description (Optional)
          </label>
          <Input
            type="text"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Add a description for this action rule..."
          />
        </div>

        {/* Preview */}
        {formData.when && formData.about && formData.do && (
          <div className="bg-surface rounded-lg p-4">
            <h5 className="text-sm font-medium text-primary mb-2">Preview:</h5>
            <p className="text-sm text-secondary">
              <span className="font-medium">When</span> user {whenOptions.find(opt => opt.value === formData.when)?.label.toLowerCase()} <span className="font-medium">{aboutOptions.find(opt => opt.value === formData.about)?.label.toLowerCase()}</span>, <span className="font-medium">{doOptions.find(opt => opt.value === formData.do)?.label.toLowerCase()}</span>.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <Button
            onClick={onSave}
            icon={Save}
            className="w-full sm:w-auto"
            disabled={!formData.when || !formData.about || !formData.do}
          >
            {isEditing ? 'Update Action' : 'Add Action Rule'}
          </Button>
          {isEditing && (
            <Button
              onClick={onCancel}
              variant="secondary"
              icon={X}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default ActionForm;
