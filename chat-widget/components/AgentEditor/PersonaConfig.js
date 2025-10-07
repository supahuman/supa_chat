'use client';

import { Input, Select } from '@/ui';
import { industries } from '@/utils/agentConfigData';

const PersonaConfig = ({ 
  agentTitle, 
  setAgentTitle, 
  industry,
  setIndustry
}) => {
  return (
    <Card>
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Agent Configuration
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Title */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Agent Title
            </label>
            <Input
              type="text"
              value={agentTitle}
              onChange={(e) => setAgentTitle(e.target.value)}
              placeholder="e.g., Customer Support TechCorp"
            />
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Industry
            </label>
            <Select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            >
              {industries.map((industry) => (
                <option key={industry.value} value={industry.value}>
                  {industry.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PersonaConfig;
