'use client';

const Tabs = ({ 
  tabs = [],
  activeTab,
  onTabChange,
  variant = 'default',
  className = ''
}) => {
  const baseClasses = 'flex justify-center space-x-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg overflow-x-auto';
  
  const variants = {
    default: '',
    mobile: 'flex-col space-x-0 space-y-1 bg-transparent p-0'
  };
  
  const classes = `${baseClasses} ${variants[variant]} ${className}`;
  
  return (
    <div className={classes}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center justify-center space-x-1 md:space-x-2 px-4 md:px-5 py-3 rounded-md text-xs md:text-sm font-medium transition-all whitespace-nowrap min-h-[40px] ${
              isActive
                ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-300 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            {Icon && <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />}
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
