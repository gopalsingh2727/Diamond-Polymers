/**
 * Chat System Diagnostics
 * Helper functions to debug chat and notification issues
 */

/**
 * Check notification permission status
 */
export const checkNotificationPermission = () => {
  console.log('=== Notification Diagnostics ===');
  console.log('Notifications supported:', 'Notification' in window);
  console.log('Permission status:', Notification.permission);

  if (Notification.permission === 'denied') {
    console.warn('⚠️ Notifications are BLOCKED. User needs to enable in browser settings.');
  } else if (Notification.permission === 'default') {
    console.warn('⚠️ Notification permission not requested yet.');
  } else if (Notification.permission === 'granted') {
    console.log('✅ Notifications are ENABLED.');
  }

  return {
    supported: 'Notification' in window,
    permission: Notification.permission,
    enabled: Notification.permission === 'granted'
  };
};

/**
 * Check WebSocket connection status
 */
export const checkWebSocketStatus = () => {
  console.log('=== WebSocket Diagnostics ===');

  // Check if WebSocket middleware is loaded
  const wsState = (window as any).__REDUX_DEVTOOLS_EXTENSION__?.getState?.()?.websocket;

  if (wsState) {
    console.log('WebSocket status:', wsState.status);
    console.log('Connection ID:', wsState.connectionId);
    console.log('Rooms:', wsState.rooms);
  } else {
    console.warn('⚠️ Cannot access WebSocket state');
  }

  return wsState;
};

/**
 * Test notification display
 */
export const testNotification = async () => {
  console.log('=== Testing Notification ===');

  if (!('Notification' in window)) {
    console.error('❌ Notifications not supported in this browser');
    return false;
  }

  if (Notification.permission === 'denied') {
    console.error('❌ Notifications blocked. Enable in browser settings.');
    return false;
  }

  if (Notification.permission === 'default') {
    console.log('Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('Permission result:', permission);

    if (permission !== 'granted') {
      console.error('❌ Permission denied');
      return false;
    }
  }

  try {
    const notification = new Notification('Test Notification', {
      body: 'This is a test notification from 27 Manufacturing',
      icon: '/icon.png',
      tag: 'test-notification'
    });

    console.log('✅ Test notification displayed');

    setTimeout(() => {
      notification.close();
    }, 3000);

    return true;
  } catch (error) {
    console.error('❌ Failed to show notification:', error);
    return false;
  }
};

/**
 * Check localStorage data
 */
export const checkAuthData = () => {
  console.log('=== Auth Data Diagnostics ===');

  const token = localStorage.getItem('authToken');
  const userData = localStorage.getItem('userData');
  const selectedBranch = localStorage.getItem('selectedBranch');

  console.log('Has auth token:', !!token);
  console.log('Has user data:', !!userData);
  console.log('Selected branch:', selectedBranch);

  if (userData) {
    try {
      const user = JSON.parse(userData);
      console.log('User ID:', user.id || user._id);
      console.log('User name:', user.name);
      console.log('User role:', user.role);
    } catch (error) {
      console.error('❌ Failed to parse user data:', error);
    }
  }

  return {
    hasToken: !!token,
    hasUserData: !!userData,
    selectedBranch
  };
};

/**
 * Run all diagnostics
 */
export const runFullDiagnostics = async () => {
  console.log('\n🔍 Running Full Chat System Diagnostics...\n');

  const notifications = checkNotificationPermission();
  const websocket = checkWebSocketStatus();
  const auth = checkAuthData();

  console.log('\n=== Summary ===');
  console.log('Notifications:', notifications.enabled ? '✅ Enabled' : '❌ Disabled');
  console.log('WebSocket:', websocket?.status === 'connected' ? '✅ Connected' : '❌ Disconnected');
  console.log('Authentication:', auth.hasToken ? '✅ Logged in' : '❌ Not logged in');

  // Test notification if enabled
  if (notifications.enabled) {
    console.log('\nTesting notification display...');
    await testNotification();
  }

  console.log('\n✅ Diagnostics complete\n');

  return {
    notifications,
    websocket,
    auth
  };
};

// Expose to window for easy console access
if (typeof window !== 'undefined') {
  (window as any).chatDiagnostics = {
    checkNotificationPermission,
    checkWebSocketStatus,
    testNotification,
    checkAuthData,
    runFullDiagnostics
  };

  console.log('💡 Chat diagnostics available: window.chatDiagnostics.runFullDiagnostics()');
}
