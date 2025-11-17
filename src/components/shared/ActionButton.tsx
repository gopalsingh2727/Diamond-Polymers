import React from 'react';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

export type ActionType = 'save' | 'update' | 'delete' | 'submit';
export type ActionState = 'idle' | 'loading' | 'success' | 'error';

interface ActionButtonProps {
  type: ActionType;
  state: ActionState;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const buttonConfig: Record<ActionType, {
  idle: { text: string; bg: string; hover: string };
  loading: { text: string };
  success: { text: string };
  error: { text: string };
}> = {
  save: {
    idle: { text: 'Save', bg: 'bg-blue-600', hover: 'hover:bg-blue-700' },
    loading: { text: 'Saving...' },
    success: { text: 'Saved!' },
    error: { text: 'Failed' }
  },
  update: {
    idle: { text: 'Update', bg: 'bg-green-600', hover: 'hover:bg-green-700' },
    loading: { text: 'Updating...' },
    success: { text: 'Updated!' },
    error: { text: 'Failed' }
  },
  delete: {
    idle: { text: 'Delete', bg: 'bg-red-600', hover: 'hover:bg-red-700' },
    loading: { text: 'Deleting...' },
    success: { text: 'Deleted!' },
    error: { text: 'Failed' }
  },
  submit: {
    idle: { text: 'Submit', bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700' },
    loading: { text: 'Submitting...' },
    success: { text: 'Submitted!' },
    error: { text: 'Failed' }
  }
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  state,
  onClick,
  disabled = false,
  className = '',
  children
}) => {
  const config = buttonConfig[type];
  const isDisabled = disabled || state === 'loading' || state === 'success';

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className={`
        relative px-6 py-2.5 rounded-lg font-medium text-white
        transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${state === 'idle' ? `${config.idle.bg} ${config.idle.hover}` : ''}
        ${state === 'loading' ? 'bg-gray-400' : ''}
        ${state === 'success' ? 'bg-green-500' : ''}
        ${state === 'error' ? 'bg-red-500' : ''}
        ${state === 'loading' ? 'animate-pulse' : ''}
        ${state === 'success' || state === 'error' ? 'scale-105' : 'scale-100'}
        ${className}
      `}
    >
      <span className="flex items-center justify-center gap-2">
        {/* Loading Spinner */}
        {state === 'loading' && (
          <svg
            className="animate-spin h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Success Icon */}
        {state === 'success' && (
          <CheckCircleIcon className="h-5 w-5 animate-bounce" />
        )}

        {/* Error Icon */}
        {state === 'error' && (
          <XCircleIcon className="h-5 w-5 animate-shake" />
        )}

        {/* Button Text */}
        <span className={state === 'success' || state === 'error' ? 'animate-fade-in' : ''}>
          {children || config[state].text}
        </span>
      </span>
    </button>
  );
};
