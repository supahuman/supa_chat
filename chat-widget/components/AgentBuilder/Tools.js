'use client';

import Tools from './Tools/index';

const ToolsSection = ({ agentData, onUpdate }) => {
  return (
    <div className="h-full">
      <Tools agentData={agentData} onUpdate={onUpdate} />
    </div>
  );
};

export default ToolsSection;
