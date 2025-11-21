import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  onClose: (id: string) => void;
}

const toastConfig: Record<ToastType, {
  icon: React.ReactNode;
  bg: string;
  border: string;
  iconBg: string;
}> = {
  success: {
    icon: <CheckCircleIcon className="h-6 w-6 text-green-600" />,
    bg: 'bg-green-50',
    border: 'border-green-500',
    iconBg: 'bg-green-100'
  },
  error: {
    icon: <XCircleIcon className="h-6 w-6 text-red-600" />,
    bg: 'bg-red-50',
    border: 'border-red-500',
    iconBg: 'bg-red-100'
  },
  info: {
    icon: <InformationCircleIcon className="h-6 w-6 text-[#FF6B35]" />,
    bg: 'bg-orange-50',
    border: 'border-[#FF6B35]',
    iconBg: 'bg-orange-100'
  },
  warning: {
    icon: <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />,
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
  const config = toastConfig[type];

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
          <XMarkIcon className="h-5 w-5" />
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
