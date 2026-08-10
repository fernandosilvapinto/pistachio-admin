import { useState } from 'react';

const Input = ({ label, error, type = 'text', className = '', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === 'password';
  const inputType = isPassword && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-gray-500">{label}</label>
      )}
      <div className="relative">
        <input
          {...props}
          type={inputType}
          className={`
            w-full px-3 py-2 text-sm rounded-lg border border-gray-200
            bg-gray-50 text-gray-900 outline-none
            focus:border-blue-400 focus:bg-white
            transition-colors duration-150
            disabled:opacity-50
            ${isPassword ? 'pr-10' : ''}
            ${error ? 'border-red-300 bg-red-50' : ''}
            ${className}
          `}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-xs"
            tabIndex={-1}
          >
            {showPassword ? 'ocultar' : 'mostrar'}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Input;