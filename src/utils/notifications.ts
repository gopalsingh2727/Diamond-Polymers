/**
 * Chat Notification Utilities
 * Handle browser notifications and sounds for incoming messages
 */

// Notification sound (data URL for a simple notification sound)
const NOTIFICATION_SOUND = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZURE');

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
  silent?: boolean;
}

/**
 * Request notification permission from the user
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support desktop notifications');
    return 'denied';
  }

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
 */
export const areNotificationsEnabled = (): boolean => {
  return 'Notification' in window && Notification.permission === 'granted';
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
 */
export const showNotification = (options: NotificationOptions): Notification | null => {
  if (!areNotificationsEnabled()) {
    console.warn('Notifications are not enabled');
    return null;
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icon.png',
      tag: options.tag || 'chat-message',
      badge: options.icon || '/icon.png',
      data: options.data,
      silent: options.silent || false,
      requireInteraction: false
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  } catch (error) {
    console.error('Failed to show notification:', error);
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
