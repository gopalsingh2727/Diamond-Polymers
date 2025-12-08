/**
 * WebSocket Status Indicator Component
 * Shows real-time connection status with visual feedback
 *
 * Features:
 * - Live connection status indicator
 * - Auto-reconnection feedback
 * - Error state display
 * - Connection metadata (rooms, connectionId)
 * - Tooltip with detailed info
 */

import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const WebSocketStatus: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);

  const {
    status,
    isConnected,
    connectionId,
    subscribedRooms,
    error,
    reconnectAttempts,
    connectedAt,
    lastPingTime
  } = useSelector((state: RootState) => state.websocket);

  // Don't show if intentionally disconnected and no errors
  if (status === 'disconnected' && !error && reconnectAttempts === 0) {
    return null;
  }

  // Get status color and icon
  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          dotColor: 'bg-green-500',
          icon: '✓',
          label: 'Live',
          animate: 'animate-pulse'
        };
      case 'connecting':
        return {
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          dotColor: 'bg-yellow-500',
          icon: '⟳',
          label: 'Connecting...',
          animate: 'animate-spin'
        };
      case 'reconnecting':
        return {
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          dotColor: 'bg-orange-500',
          icon: '⟳',
          label: `Reconnecting (${reconnectAttempts})...`,
          animate: 'animate-spin'
        };
      case 'error':
        return {
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          dotColor: 'bg-red-500',
          icon: '!',
          label: 'Error',
          animate: ''
        };
      default:
        return {
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          dotColor: 'bg-gray-500',
          icon: '○',
          label: 'Offline',
          animate: ''
        };
    }
  };

  const config = getStatusConfig();

  // Format time
  const formatTime = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString();
  };

  // Calculate connection duration
  const getConnectionDuration = () => {
    if (!connectedAt) return 'N/A';
    const duration = Date.now() - new Date(connectedAt).getTime();
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="relative">
      {/* Status Indicator */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
          transition-all duration-200 hover:shadow-md cursor-pointer
          ${config.bgColor} ${config.textColor}
        `}
        title="Click for details"
      >
        {/* Status Dot */}
        <div className="relative">
          <div className={`w-2 h-2 rounded-full ${config.dotColor} ${config.animate}`} />
          {isConnected && (
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75" />
          )}
        </div>

        {/* Status Text */}
        <span>{config.label}</span>

        {/* Icon */}
        <span className={config.animate}>{config.icon}</span>
      </button>

      {/* Detailed Tooltip */}
      {showDetails && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDetails(false)}
          />

          {/* Details Panel */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className={`px-4 py-3 ${config.bgColor} border-b border-gray-200`}>
              <div className="flex items-center justify-between">
                <h3 className={`font-semibold ${config.textColor}`}>
                  WebSocket Connection
                </h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className={`${config.textColor} hover:opacity-70`}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Connection Details */}
            <div className="p-4 space-y-3 text-sm">
              {/* Status */}
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${config.textColor}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>

              {/* Connection ID */}
              {connectionId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Connection ID:</span>
                  <span className="font-mono text-xs text-gray-800">
                    {connectionId.substring(0, 12)}...
                  </span>
                </div>
              )}

              {/* Connected At */}
              {connectedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Connected:</span>
                  <span className="text-gray-800">{formatTime(connectedAt)}</span>
                </div>
              )}

              {/* Duration */}
              {isConnected && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="text-gray-800">{getConnectionDuration()}</span>
                </div>
              )}

              {/* Last Ping */}
              {lastPingTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Ping:</span>
                  <span className="text-gray-800">{formatTime(lastPingTime)}</span>
                </div>
              )}

              {/* Subscribed Rooms */}
              {subscribedRooms && subscribedRooms.length > 0 && (
                <div>
                  <span className="text-gray-600">Rooms ({subscribedRooms.length}):</span>
                  <div className="mt-1 space-y-1">
                    {subscribedRooms.slice(0, 5).map((room, index) => (
                      <div key={index} className="text-xs font-mono bg-gray-50 px-2 py-1 rounded">
                        {room}
                      </div>
                    ))}
                    {subscribedRooms.length > 5 && (
                      <div className="text-xs text-gray-500 italic">
                        +{subscribedRooms.length - 5} more...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="pt-2 border-t border-gray-200">
                  <span className="text-red-600 text-xs">Error:</span>
                  <div className="mt-1 text-xs text-red-700 bg-red-50 px-2 py-1 rounded">
                    {error}
                  </div>
                </div>
              )}

              {/* Reconnect Attempts */}
              {reconnectAttempts > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reconnect Attempts:</span>
                  <span className="text-orange-600 font-medium">
                    {reconnectAttempts}
                  </span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
              Real-time updates enabled
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WebSocketStatus;
