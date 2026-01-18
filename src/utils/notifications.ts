/**
 * Chat Notification Utilities
 * Handle browser notifications and sounds for incoming messages
 * Supports both browser notifications and native Electron notifications
 */

// Notification sound (data URL for a simple notification sound)
const NOTIFICATION_SOUND = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');

// Check if running in Electron
const isElectron = (): boolean => {
  return navigator.userAgent.toLowerCase().indexOf('electron') > -1;
};

// Check if IPC renderer is available
const hasIpcRenderer = (): boolean => {
  return !!(window as any).ipcRenderer?.invoke;
};

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
  silent?: boolean;
}

/**
 * Show native Electron notification via IPC
 * This is more reliable than browser notifications in Electron
 */
const showElectronNotification = async (options: NotificationOptions): Promise<boolean> => {
  try {
    if (!hasIpcRenderer()) {
      console.warn('[Notification] IPC renderer not available');
      return false;
    }

    const result = await (window as any).ipcRenderer.invoke('show-notification', {
      title: options.title,
      body: options.body,
      icon: options.icon,
      tag: options.tag,
      silent: options.silent
    });

    if (result?.success) {
      console.log('[Notification] ✅ Native Electron notification shown');
      return true;
    } else {
      console.warn('[Notification] Native notification failed:', result?.error);
      return false;
    }
  } catch (error) {
    console.error('[Notification] Failed to show native notification:', error);
    return false;
  }
};

/**
 * Request notification permission from the user
 * In Electron, notifications always work without explicit permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }

  if (isElectron()) {
    // In Electron, notifications work without permission (we handle via IPC)
    console.log('[Notification] Running in Electron - notifications enabled by default');
    return 'granted';
  }

  // For web browsers, request permission normally
  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission;
  }

  return Notification.permission;
};

/**
 * Check if notifications are enabled
 * In Electron, notifications are always enabled
 */
export const areNotificationsEnabled = (): boolean => {
  if (!('Notification' in window)) {
    return false;
  }

  if (isElectron()) {
    // In Electron, notifications are always enabled (via native IPC)
    return true;
  }

  // For web browsers, check permission
  return Notification.permission === 'granted';
};

/**
 * Play notification sound
 */
export const playNotificationSound = (): void => {
  try {
    NOTIFICATION_SOUND.volume = 0.5;
    NOTIFICATION_SOUND.play().catch(err => {
      console.warn('Failed to play notification sound:', err);
    });
  } catch (error) {
    console.warn('Failed to play notification sound:', error);
  }
};

/**
 * Show a browser notification
 * Works in both Electron and web browsers
 * In Electron, uses native notifications via IPC for better reliability
 */
export const showNotification = (options: NotificationOptions): Notification | null => {
  console.log('[Notification] Creating notification:', options.title);

  // In Electron, try native notification first (more reliable)
  if (isElectron() && hasIpcRenderer()) {
    console.log('[Notification] Using native Electron notification');
    showElectronNotification(options);
    // Still return null since we're using async IPC
    // But also try browser notification as fallback
  }

  // Browser notification fallback
  if (!('Notification' in window)) {
    console.warn('Notifications are not supported');
    return null;
  }

  if (!isElectron() && !areNotificationsEnabled()) {
    console.warn('Notifications are not enabled (browser permission required)');
    return null;
  }

  try {
    // Use your app logo for notifications
    const appIcon = '/icon.png';

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || appIcon,
      tag: options.tag || 'chat-message',
      badge: options.icon || appIcon,
      data: options.data,
      silent: options.silent || false,
      requireInteraction: false
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    console.log('[Notification] ✅ Browser notification created successfully');
    return notification;
  } catch (error) {
    console.error('[Notification] ❌ Failed to show browser notification:', error);
    return null;
  }
};

/**
 * Show notification for incoming chat message
 */
export const showMessageNotification = (
  senderName: string,
  messageText: string,
  senderId: string,
  onClick?: () => void
): Notification | null => {
  const notification = showNotification({
    title: `New message from ${senderName}`,
    body: messageText.length > 100 ? `${messageText.substring(0, 100)}...` : messageText,
    tag: `chat-${senderId}`,
    data: { senderId, senderName, type: 'chat-message' }
  });

  if (notification && onClick) {
    notification.onclick = () => {
      window.focus();
      onClick();
      notification.close();
    };
  }

  // Play sound
  playNotificationSound();

  return notification;
};

/**
 * Check if user has focus on the current window/tab
 */
export const isWindowFocused = (): boolean => {
  return document.hasFocus();
};

/**
 * Get notification preferences from localStorage
 */
export const getNotificationPreferences = () => {
  try {
    const prefs = localStorage.getItem('notificationPreferences');
    if (prefs) {
      return JSON.parse(prefs);
    }
  } catch (error) {
    console.warn('Failed to get notification preferences:', error);
  }

  return {
    enabled: true,
    sound: true,
    showPreview: true
  };
};

/**
 * Save notification preferences to localStorage
 */
export const saveNotificationPreferences = (preferences: {
  enabled: boolean;
  sound: boolean;
  showPreview: boolean;
}) => {
  try {
    localStorage.setItem('notificationPreferences', JSON.stringify(preferences));
  } catch (error) {
    console.error('Failed to save notification preferences:', error);
  }
};

/**
 * Show notification for CRUD operations (Create, Update, Delete)
 */
export const showCRUDNotification = (
  operation: 'create' | 'update' | 'delete',
  entityName: string,
  details?: string
): Notification | null => {
  const operationLabels = {
    create: 'Created',
    update: 'Updated',
    delete: 'Deleted'
  };

  const operationEmojis = {
    create: '✅',
    update: '✏️',
    delete: '🗑️'
  };

  const title = `${operationEmojis[operation]} ${operationLabels[operation]} ${entityName}`;
  const body = details || `${entityName} has been ${operationLabels[operation].toLowerCase()} successfully`;

  const notification = showNotification({
    title,
    body,
    tag: `crud-${operation}-${Date.now()}`,
    silent: false
  });

  // Play sound for CRUD operations
  const prefs = getNotificationPreferences();
  if (prefs.sound) {
    playNotificationSound();
  }

  return notification;
};

/**
 * Show notification for errors
 */
export const showErrorNotification = (
  title: string,
  message: string
): Notification | null => {
  const notification = showNotification({
    title: `❌ ${title}`,
    body: message,
    tag: `error-${Date.now()}`,
    silent: false
  });

  return notification;
};
