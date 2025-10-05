'use client';

const Card = ({ 
  children, 
  variant = 'default',
  padding = 'md',
  hover = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700';
  
  const variants = {
    default: 'rounded-lg shadow-sm',
    elevated: 'rounded-lg shadow-md',
    outlined: 'rounded-lg border-2',
    dashed: 'rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600'
  };
  
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const hoverClasses = hover ? 'hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-all duration-200' : '';
  
  const classes = `${baseClasses} ${variants[variant]} ${paddings[padding]} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
};

export default Card;
