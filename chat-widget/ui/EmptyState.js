'use client';

const EmptyState = ({ 
  icon: Icon,
  title,
  description,
  action,
  className = ''
}) => {
  return (
    <div className={`p-8 text-center ${className}`}>
      {Icon && (
        <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      )}
      <p className="text-gray-600 dark:text-gray-400 mb-2">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
