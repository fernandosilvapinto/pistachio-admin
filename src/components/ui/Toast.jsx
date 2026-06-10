import { useEffect } from 'react';

const VARIANTS = {
  success: 'bg-green-50 text-green-700 border-green-200',
  error:   'bg-red-50 text-red-700 border-red-200',
  info:    'bg-blue-50 text-blue-700 border-blue-200',
};

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`
      fixed bottom-6 right-6 z-50
      flex items-center gap-3
      px-4 py-3 rounded-xl border shadow-sm
      text-sm font-medium
      animate-fade-in
      ${VARIANTS[type]}
    `}>
      <span>
        {type === 'success' && '✓'}
        {type === 'error'   && '✕'}
        {type === 'info'    && 'ℹ'}
      </span>
      <span>{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-50 hover:opacity-100 cursor-pointer"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;