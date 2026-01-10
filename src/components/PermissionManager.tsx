/**
 * PermissionManager Component
 * Checks and requests all required permissions for the app
 * Shows user-friendly UI for permission status and instructions
 */

import React, { useEffect, useState } from 'react';
import {
  checkAllPermissions,
  requestMediaPermission,
  requestNotificationPermission,
  getPermissionErrorMessage,
  type PermissionStatus,
} from '../utils/permissionUtils';

interface PermissionManagerProps {
  /** Whether to auto-request permissions on mount */
  autoRequest?: boolean;
  /** Callback when all permissions are granted */
  onAllGranted?: () => void;
  /** Callback when permission request fails */
  onError?: (errors: string[]) => void;
  /** Show as modal dialog */
  showAsModal?: boolean;
  /** Children to render when permissions are granted */
  children?: React.ReactNode;
}

interface PermissionState {
  microphone: PermissionStatus;
  camera: PermissionStatus;
  notifications: PermissionStatus;
  backgroundSync: PermissionStatus;
}

const PermissionManager: React.FC<PermissionManagerProps> = ({
  autoRequest = false,
  onAllGranted,
  onError,
  showAsModal = false,
  children,
}) => {
  const [permissions, setPermissions] = useState<PermissionState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Check permissions on mount
  useEffect(() => {
    checkPermissions();
  }, []);

  // Auto-request if enabled
  useEffect(() => {
    if (autoRequest && permissions && !areAllPermissionsGranted()) {
      requestAllPermissions();
    }
  }, [autoRequest, permissions]);

  const checkPermissions = async () => {
    try {
      const status = await checkAllPermissions();
      setPermissions(status);

      // Check if all are granted
      if (areAllPermissionsGrantedFromStatus(status)) {
        onAllGranted?.();
      }
    } catch (err: any) {
      console.error('[PermissionManager] Error checking permissions:', err);
      setError(err.message);
    }
  };

  const requestAllPermissions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Request media first
      const mediaResult = await requestMediaPermission({ audio: true, video: true });

      // Stop the stream if we got one
      if (mediaResult.stream) {
        mediaResult.stream.getTracks().forEach(track => track.stop());
      }

      // Request notifications
      const notificationResult = await requestNotificationPermission();

      // Recheck all permissions
      await checkPermissions();

      const errors: string[] = [];
      if (!mediaResult.success && mediaResult.error) {
        errors.push(mediaResult.error);
      }
      if (!notificationResult.success && notificationResult.error) {
        errors.push(notificationResult.error);
      }

      if (errors.length > 0) {
        setError(errors.join('\n\n'));
        onError?.(errors);
      } else {
        onAllGranted?.();
      }
    } catch (err: any) {
      console.error('[PermissionManager] Error requesting permissions:', err);
      setError(err.message);
      onError?.([err.message]);
    } finally {
      setIsLoading(false);
    }
  };

  const areAllPermissionsGrantedFromStatus = (status: PermissionState): boolean => {
    return (
      status.microphone.state === 'granted' &&
      status.camera.state === 'granted' &&
      status.notifications.state === 'granted' &&
      (status.backgroundSync.state === 'granted' || status.backgroundSync.state === 'unsupported')
    );
  };

  const areAllPermissionsGranted = (): boolean => {
    if (!permissions) return false;
    return areAllPermissionsGrantedFromStatus(permissions);
  };

  const getPermissionIcon = (state: string) => {
    switch (state) {
      case 'granted':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'denied':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'prompt':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        );
      case 'unsupported':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z"
              clipRule="evenodd"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const getPermissionLabel = (type: string): string => {
    const labels: Record<string, string> = {
      microphone: 'Microphone',
      camera: 'Camera',
      notifications: 'Notifications',
      backgroundSync: 'Background Sync',
    };
    return labels[type] || type;
  };

  // If all permissions granted and not showing modal, just render children
  if (areAllPermissionsGranted() && !showAsModal) {
    return <>{children}</>;
  }

  // Don't show anything if hidden
  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Backdrop */}
      {showAsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          {/* Modal */}
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              App Permissions Required
            </h2>

            <p className="text-gray-600 mb-6">
              This app requires the following permissions to function properly:
            </p>

            {/* Permission List */}
            {permissions && (
              <div className="space-y-3 mb-6">
                {Object.entries(permissions).map(([key, status]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getPermissionIcon(status.state)}
                      <div>
                        <div className="font-medium text-gray-900">
                          {getPermissionLabel(key)}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {status.state}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div className="text-sm text-red-800 whitespace-pre-wrap">{error}</div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={requestAllPermissions}
                disabled={isLoading || areAllPermissionsGranted()}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isLoading || areAllPermissionsGranted()
                    ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? 'Requesting...' : areAllPermissionsGranted() ? 'All Granted' : 'Grant Permissions'}
              </button>

              {!autoRequest && (
                <button
                  onClick={() => setIsVisible(false)}
                  className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Skip
                </button>
              )}
            </div>

            {areAllPermissionsGranted() && (
              <button
                onClick={() => setIsVisible(false)}
                className="w-full mt-3 px-4 py-2 rounded-lg font-medium bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                Continue
              </button>
            )}
          </div>
        </div>
      )}

      {/* Inline version (non-modal) */}
      {!showAsModal && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Permissions Required
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Some features require additional permissions.</p>
                {error && <p className="mt-2 font-medium">{error}</p>}
              </div>
              <div className="mt-4">
                <button
                  onClick={requestAllPermissions}
                  disabled={isLoading}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-800 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  {isLoading ? 'Requesting...' : 'Grant Permissions'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Always render children */}
      {children}
    </>
  );
};

export default PermissionManager;
