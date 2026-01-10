/**
 * Quick Permission Button
 * Add this anywhere in your app to quickly request permissions
 */

import React, { useState } from 'react';
import { requestMediaPermission, checkAllPermissions } from '../utils/permissionUtils';

export function QuickPermissionButton() {
  const [status, setStatus] = useState<string>('Click to check permissions');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckPermissions = async () => {
    setIsLoading(true);
    setStatus('Checking permissions...');

    try {
      const permissions = await checkAllPermissions();

      const results = [
        `🎤 Microphone: ${permissions.microphone.state}`,
        `📷 Camera: ${permissions.camera.state}`,
        `🔔 Notifications: ${permissions.notifications.state}`,
      ].join('\n');

      setStatus(results);

      // If not all granted, auto-request
      if (
        permissions.microphone.state !== 'granted' ||
        permissions.camera.state !== 'granted'
      ) {
        setTimeout(() => handleRequestPermissions(), 1000);
      }
    } catch (error: any) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPermissions = async () => {
    setIsLoading(true);
    setStatus('Requesting camera and microphone access...\n\nPlease click ALLOW when prompted!');

    try {
      const result = await requestMediaPermission({ audio: true, video: true });

      if (result.success) {
        setStatus('✅ SUCCESS!\n\nCamera and microphone access granted!\n\nYou can now make calls.');

        // Stop the test stream
        if (result.stream) {
          result.stream.getTracks().forEach(track => track.stop());
        }

        // Recheck to show updated status
        setTimeout(() => handleCheckPermissions(), 1000);
      } else {
        setStatus(`❌ FAILED\n\n${result.error}\n\nPlease check your system settings.`);
      }
    } catch (error: any) {
      setStatus(`❌ ERROR\n\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-2xl rounded-lg p-6 max-w-md border-2 border-blue-500 z-50">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0">
          <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Camera & Microphone Access
          </h3>
          <pre className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 p-3 rounded mb-4 font-mono">
            {status}
          </pre>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCheckPermissions}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? 'Checking...' : 'Check Status'}
        </button>

        <button
          onClick={handleRequestPermissions}
          disabled={isLoading}
          className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? 'Requesting...' : 'Grant Access'}
        </button>
      </div>

      <div className="mt-3 text-xs text-gray-500">
        <p><strong>Tip:</strong> If the dialog doesn't appear, check your browser/system settings.</p>
      </div>
    </div>
  );
}

export default QuickPermissionButton;
