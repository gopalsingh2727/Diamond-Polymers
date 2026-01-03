import React, { useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

// Inline SVG Icons
const CheckCircleIcon = () => (
  <svg className="h-6 w-6 text-green-600" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="h-6 w-6 text-red-600" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
  </svg>
);

const InformationCircleIcon = () => (
  <svg className="h-6 w-6 text-[#FF6B35]" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

const ExclamationTriangleIcon = () => (
  <svg className="h-6 w-6 text-yellow-600" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

const XMarkIcon = () => (
  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const toastConfig: Record<ToastType, {
  icon: React.ReactNode;
  bg: string;
  border: string;
  iconBg: string;
}> = {
  success: {
    icon: <CheckCircleIcon />,
    bg: 'bg-green-50',
    border: 'border-green-500',
    iconBg: 'bg-green-100'
  },
  error: {
    icon: <XCircleIcon />,
    bg: 'bg-red-50',
    border: 'border-red-500',
    iconBg: 'bg-red-100'
  },
  info: {
    icon: <InformationCircleIcon />,
    bg: 'bg-orange-50',
    border: 'border-[#FF6B35]',
    iconBg: 'bg-orange-100'
  },
  warning: {
    icon: <ExclamationTriangleIcon />,
    bg: 'bg-yellow-50',
    border: 'border-yellow-500',
    iconBg: 'bg-yellow-100'
  }
};

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 3000,
  onClose
}) => {
  // Fallback to 'info' if type is invalid
  const config = toastConfig[type] || toastConfig.info;

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div
      className={`
        ${config.bg} ${config.border}
        border-l-4 rounded-lg shadow-lg p-4 mb-4
        animate-slide-in-right
        max-w-md w-full
        transition-all duration-300 ease-in-out
      `}
    >
      <div className="flex items-start">
        {/* Icon */}
        <div className={`flex-shrink-0 ${config.iconBg} rounded-full p-1`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-900">{title}</p>
          {message && (
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(id)}
          className="ml-4 flex-shrink-0 inline-flex text-gray-400 hover:text-gray-600 focus:outline-none transition-colors"
        >
          <XMarkIcon />
        </button>
      </div>

      {/* Progress Bar */}
      {duration > 0 && (
        <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${
              type === 'success' ? 'bg-green-500' :
              type === 'error' ? 'bg-red-500' :
              type === 'info' ? 'bg-[#FF6B35]' :
              'bg-yellow-500'
            } animate-progress`}
            style={{ animationDuration: `${duration}ms` }}
          />
        </div>
      )}
    </div>
  );
};

// Toast Container Component
interface ToastContainerProps {
  toasts: ToastProps[];
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right'
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>
  );
};
