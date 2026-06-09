const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent',
  danger:  'bg-red-50 hover:bg-red-100 text-red-600 border-red-200',
  ghost:   'bg-transparent hover:bg-gray-100 text-gray-500 border-transparent',
  default: 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200',
};

const sizes = {
  sm: 'px-3 py-1 text-xs',
  md: 'px-4 py-2 text-sm',
};

const Button = ({ children, variant = 'default', size = 'md', onClick, disabled, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        inline-flex items-center gap-2 font-medium rounded-lg border
        transition-colors duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;