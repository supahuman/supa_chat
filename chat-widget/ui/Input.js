'use client';

const Input = ({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error = false,
  className = '',
  ...props 
}) => {
  const classes = `input-base ${error ? 'input-error' : ''} ${disabled ? 'input-disabled' : ''} ${className}`;
  
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={classes}
      {...props}
    />
  );
};

export default Input;
