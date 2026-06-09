const Input = ({ label, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-gray-500">{label}</label>
      )}
      <input
        {...props}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border border-gray-200
          bg-gray-50 text-gray-900 outline-none
          focus:border-blue-400 focus:bg-white
          transition-colors duration-150
          disabled:opacity-50
          ${error ? 'border-red-300 bg-red-50' : ''}
          ${className}
        `}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;