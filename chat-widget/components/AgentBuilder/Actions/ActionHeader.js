'use client';

const ActionHeader = ({ 
  actionsLength
}) => {
  return (
    <div>
      <h4 className="heading-md">
        Action Rules
      </h4>
      <p className="text-sm text-secondary">
        {actionsLength} action{actionsLength !== 1 ? 's' : ''} configured
      </p>
    </div>
  );
};

export default ActionHeader;
