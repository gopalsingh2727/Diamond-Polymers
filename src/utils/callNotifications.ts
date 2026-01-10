/**
 * Call Notifications - Desktop notifications for incoming calls
 * Production-ready notification system with WebSocket integration
 */

export class CallNotificationManager {
  private activeNotification: Notification | null = null;
  private notificationSound: HTMLAudioElement | null = null;

  constructor() {
    this.initializeNotificationSound();
  }

  /**
   * Initialize notification sound (optional beep when notification shows)
   */
  private initializeNotificationSound() {
    if (typeof window !== 'undefined') {
      this.notificationSound = new Audio();
      // Short beep sound for notification
      this.notificationSound.volume = 0.3;
    }
  }

  /**
   * Request notification permission from user
   * Call this on app initialization
   */
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('[Notifications] Browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      console.log('[Notifications] Permission already granted');
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('[Notifications] Permission denied by user');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('[Notifications] Permission granted');
        return true;
      } else {
        console.warn('[Notifications] Permission denied');
        return false;
      }
    } catch (error) {
      console.error('[Notifications] Error requesting permission:', error);
      return false;
    }
  }

  /**
   * Check if notifications are supported and permitted
   */
  isSupported(): boolean {
    return (
      'Notification' in window &&
      Notification.permission === 'granted'
    );
  }

  /**
   * Show incoming call notification
   */
  showIncomingCallNotification(
    callerName: string,
    callType: 'audio' | 'video',
    options?: {
      onAccept?: () => void;
      onDecline?: () => void;
      onNotificationClick?: () => void;
    }
  ): Notification | null {
    if (!this.isSupported()) {
      console.warn('[Notifications] Cannot show notification - not supported or not permitted');
      return null;
    }

    // Close any existing notification
    this.closeActiveNotification();

    try {
      const callTypeText = callType === 'video' ? 'Video' : 'Voice';

      // Create notification
      this.activeNotification = new Notification(
        `Incoming ${callTypeText} Call`,
        {
          body: `${callerName} is calling you...`,
          icon: this.getCallIcon(callType),
          badge: '/notification-badge.png',
          tag: 'incoming-call',
          requireInteraction: true, // Keeps notification until user acts
          vibrate: [200, 100, 200, 100, 200], // Vibration pattern for mobile
          silent: false, // Browser may play default sound
          timestamp: Date.now(),
          data: {
            callerName,
            callType,
            timestamp: Date.now()
          }
        }
      );

      // Handle notification click (bring app to focus)
      this.activeNotification.onclick = (event) => {
        event.preventDefault();
        console.log('[Notifications] Notification clicked - focusing window');

        // Focus the window
        window.focus();

        // Call custom handler
        if (options?.onNotificationClick) {
          options.onNotificationClick();
        }

        // Close notification
        this.closeActiveNotification();
      };

      // Handle notification close
      this.activeNotification.onclose = () => {
        console.log('[Notifications] Notification closed');
        this.activeNotification = null;
      };

      // Handle notification error
      this.activeNotification.onerror = (error) => {
        console.error('[Notifications] Notification error:', error);
        this.activeNotification = null;
      };

      // Auto-close after 30 seconds
      setTimeout(() => {
        this.closeActiveNotification();
      }, 30000);

      console.log('[Notifications] Incoming call notification shown');
      return this.activeNotification;

    } catch (error) {
      console.error('[Notifications] Error showing notification:', error);
      return null;
    }
  }

  /**
   * Show call answered notification
   */
  showCallAnsweredNotification(personName: string, callType: 'audio' | 'video'): void {
    if (!this.isSupported()) return;

    const callTypeText = callType === 'video' ? 'Video' : 'Voice';

    const notification = new Notification(
      `${callTypeText} Call Connected`,
      {
        body: `Connected with ${personName}`,
        icon: this.getCallIcon(callType),
        tag: 'call-answered',
        requireInteraction: false,
        silent: true,
        timestamp: Date.now()
      }
    );

    // Auto-close after 3 seconds
    setTimeout(() => notification.close(), 3000);
  }

  /**
   * Show call ended notification
   */
  showCallEndedNotification(personName: string, duration?: number): void {
    if (!this.isSupported()) return;

    const durationText = duration
      ? ` (${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')})`
      : '';

    const notification = new Notification(
      'Call Ended',
      {
        body: `Call with ${personName} ended${durationText}`,
        icon: '/call-ended-icon.png',
        tag: 'call-ended',
        requireInteraction: false,
        silent: true,
        timestamp: Date.now()
      }
    );

    // Auto-close after 4 seconds
    setTimeout(() => notification.close(), 4000);
  }

  /**
   * Show missed call notification
   */
  showMissedCallNotification(callerName: string, callType: 'audio' | 'video'): void {
    if (!this.isSupported()) return;

    const callTypeText = callType === 'video' ? 'Video' : 'Voice';

    const notification = new Notification(
      `Missed ${callTypeText} Call`,
      {
        body: `You missed a call from ${callerName}`,
        icon: '/missed-call-icon.png',
        badge: '/notification-badge.png',
        tag: 'missed-call',
        requireInteraction: true, // Keep notification for missed calls
        vibrate: [100, 50, 100],
        timestamp: Date.now(),
        data: {
          callerName,
          callType,
          timestamp: Date.now()
        }
      }
    );

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  }

  /**
   * Close active notification
   */
  closeActiveNotification(): void {
    if (this.activeNotification) {
      try {
        this.activeNotification.close();
      } catch (error) {
        console.error('[Notifications] Error closing notification:', error);
      }
      this.activeNotification = null;
    }
  }

  /**
   * Get appropriate icon for call type
   */
  private getCallIcon(callType: 'audio' | 'video'): string {
    // These should be actual icon files in your public folder
    return callType === 'video'
      ? '/video-call-icon.png'
      : '/audio-call-icon.png';
  }

  /**
   * Check if notification permission is denied
   */
  isPermissionDenied(): boolean {
    return 'Notification' in window && Notification.permission === 'denied';
  }

  /**
   * Check if notification permission is default (not asked yet)
   */
  isPermissionDefault(): boolean {
    return 'Notification' in window && Notification.permission === 'default';
  }

  /**
   * Get current notification permission status
   */
  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    return Notification.permission;
  }
}

// Export singleton instance
export const callNotificationManager = new CallNotificationManager();

// Export default for easy import
export default callNotificationManager;
