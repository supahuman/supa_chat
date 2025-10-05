'use client';

const Modal = ({ 
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = ''
}) => {
  if (!isOpen) return null;
  
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full mx-4'
  };
  
  return (
    <div className="modal-backdrop">
      <div className={`modal-content ${sizeClasses[size]} h-96 ${className}`}>
        {/* Header */}
        <div className="modal-header">
          <h3 className="heading-lg">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl leading-none transition-smooth"
          >
            ×
          </button>
        </div>
        
        {/* Content */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
