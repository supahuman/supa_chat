'use client';

const ActionCard = ({ 
  icon: Icon, 
  title, 
  description,
  onClick,
  variant = 'default',
  color = 'blue',
  className = ''
}) => {
  const baseClasses = 'p-6 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200 group';
  
  const variants = {
    default: '',
    dashed: 'border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
  };
  
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30',
    green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-200 dark:group-hover:bg-green-900/30',
    purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  
  return (
    <div onClick={onClick} className={classes}>
      <div className="text-center">
        <div className={`w-12 h-12 ${colorClasses[color]} rounded-lg flex items-center justify-center mx-auto mb-4 transition-colors duration-200`}>
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
};

export default ActionCard;
