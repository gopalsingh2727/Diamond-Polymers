/**
 * Permission Utilities
 * Comprehensive permission management for media, notifications, and other browser APIs
 */

export type PermissionType = 'microphone' | 'camera' | 'notifications' | 'background-sync';

export interface PermissionStatus {
  type: PermissionType;
  state: 'granted' | 'denied' | 'prompt' | 'unsupported';
  error?: string;
}

export interface MediaPermissionOptions {
  audio?: boolean;
  video?: boolean;
}

/**
 * Check if a specific permission is granted
 */
export async function checkPermission(type: PermissionType): Promise<PermissionStatus> {
  try {
    // Handle Notifications API (doesn't use navigator.permissions)
    if (type === 'notifications') {
      if (!('Notification' in window)) {
        return { type, state: 'unsupported', error: 'Notifications API not supported' };
      }

      const permission = Notification.permission;
      return {
        type,
        state: permission === 'default' ? 'prompt' : permission as 'granted' | 'denied'
      };
    }

    // Handle background-sync
    if (type === 'background-sync') {
      // Background sync might not be in permissions API in all browsers
      try {
        if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
          return { type, state: 'granted' };
        }
      } catch (e) {
        // Fallback - assume granted in Electron
        return { type, state: 'granted' };
      }
      return { type, state: 'unsupported', error: 'Background sync not supported' };
    }

    // Handle microphone and camera via Permissions API
    if (navigator.permissions && navigator.permissions.query) {
      try {
        const result = await navigator.permissions.query({
          name: type as PermissionName
        });

        return {
          type,
          state: result.state as 'granted' | 'denied' | 'prompt'
        };
      } catch (error: any) {
        // Some browsers don't support querying certain permissions
        console.warn(`[Permissions] Query failed for ${type}:`, error.message);

        // Fallback: try to access the device directly to check
        if (type === 'microphone' || type === 'camera') {
          return await checkMediaPermissionDirectly(type === 'camera');
        }
      }
    }

    return { type, state: 'unsupported', error: 'Permissions API not supported' };
  } catch (error: any) {
    console.error(`[Permissions] Error checking ${type}:`, error);
    return { type, state: 'unsupported', error: error.message };
  }
}

/**
 * Check media permission by trying to access the device
 */
async function checkMediaPermissionDirectly(video: boolean): Promise<PermissionStatus> {
  try {
    const constraints: MediaStreamConstraints = video
      ? { video: true, audio: false }
      : { audio: true, video: false };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    // Stop all tracks immediately
    stream.getTracks().forEach(track => track.stop());

    return {
      type: video ? 'camera' : 'microphone',
      state: 'granted'
    };
  } catch (error: any) {
    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      return {
        type: video ? 'camera' : 'microphone',
        state: 'denied',
        error: 'Permission denied by user'
      };
    }
    if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      return {
        type: video ? 'camera' : 'microphone',
        state: 'unsupported',
        error: video ? 'No camera found' : 'No microphone found'
      };
    }
    return {
      type: video ? 'camera' : 'microphone',
      state: 'prompt',
      error: error.message
    };
  }
}

/**
 * Request microphone and/or camera permission
 */
export async function requestMediaPermission(
  options: MediaPermissionOptions = { audio: true, video: false }
): Promise<{ success: boolean; stream?: MediaStream; error?: string }> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return {
        success: false,
        error: 'Media devices API not supported in this browser'
      };
    }

    console.log('[Permissions] Requesting media access:', options);

    const constraints: MediaStreamConstraints = {
      audio: options.audio ? {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      } : false,
      video: options.video ? {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user',
      } : false,
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);

    console.log('[Permissions] Media access granted:',
      stream.getTracks().map(t => t.kind).join(', ')
    );

    return { success: true, stream };
  } catch (error: any) {
    console.error('[Permissions] Media access error:', error);

    let errorMessage = 'Failed to access media devices';

    if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
      errorMessage = 'Permission denied. Please allow camera/microphone access in your browser/system settings.';
    } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
      const devices = [];
      if (options.audio) devices.push('microphone');
      if (options.video) devices.push('camera');
      errorMessage = `No ${devices.join(' or ')} found. Please connect a device and try again.`;
    } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
      errorMessage = 'Media device is already in use by another application.';
    } else if (error.name === 'OverconstrainedError') {
      errorMessage = 'Could not satisfy the requested media constraints.';
    } else if (error.name === 'SecurityError') {
      errorMessage = 'Media access blocked due to security restrictions.';
    } else {
      errorMessage = `Media access error: ${error.message}`;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Request notification permission
 */
export async function requestNotificationPermission(): Promise<{
  success: boolean;
  permission: NotificationPermission;
  error?: string;
}> {
  try {
    if (!('Notification' in window)) {
      return {
        success: false,
        permission: 'denied',
        error: 'Notifications not supported in this browser'
      };
    }

    // Already granted
    if (Notification.permission === 'granted') {
      return { success: true, permission: 'granted' };
    }

    // Already denied
    if (Notification.permission === 'denied') {
      return {
        success: false,
        permission: 'denied',
        error: 'Notification permission was previously denied. Please enable it in your browser/system settings.'
      };
    }

    // Request permission
    console.log('[Permissions] Requesting notification permission');
    const permission = await Notification.requestPermission();

    console.log('[Permissions] Notification permission:', permission);

    return {
      success: permission === 'granted',
      permission,
      error: permission === 'denied' ? 'Notification permission denied' : undefined
    };
  } catch (error: any) {
    console.error('[Permissions] Notification permission error:', error);
    return {
      success: false,
      permission: 'denied',
      error: error.message
    };
  }
}

/**
 * Check all required permissions at once
 */
export async function checkAllPermissions(): Promise<{
  microphone: PermissionStatus;
  camera: PermissionStatus;
  notifications: PermissionStatus;
  backgroundSync: PermissionStatus;
}> {
  console.log('[Permissions] Checking all permissions...');

  const [microphone, camera, notifications, backgroundSync] = await Promise.all([
    checkPermission('microphone'),
    checkPermission('camera'),
    checkPermission('notifications'),
    checkPermission('background-sync'),
  ]);

  console.log('[Permissions] Status:', {
    microphone: microphone.state,
    camera: camera.state,
    notifications: notifications.state,
    backgroundSync: backgroundSync.state,
  });

  return { microphone, camera, notifications, backgroundSync };
}

/**
 * Request all required permissions
 */
export async function requestAllPermissions(): Promise<{
  success: boolean;
  results: {
    media: { success: boolean; error?: string };
    notifications: { success: boolean; error?: string };
  };
  errors: string[];
}> {
  console.log('[Permissions] Requesting all permissions...');

  const errors: string[] = [];

  // Request media permissions (microphone + camera)
  const mediaResult = await requestMediaPermission({ audio: true, video: true });
  if (!mediaResult.success) {
    errors.push(mediaResult.error || 'Media permission failed');
  } else if (mediaResult.stream) {
    // Stop the stream immediately - we just wanted permission
    mediaResult.stream.getTracks().forEach(track => track.stop());
  }

  // Request notification permission
  const notificationResult = await requestNotificationPermission();
  if (!notificationResult.success) {
    errors.push(notificationResult.error || 'Notification permission failed');
  }

  const success = errors.length === 0;

  console.log('[Permissions] Request complete:', { success, errors });

  return {
    success,
    results: {
      media: {
        success: mediaResult.success,
        error: mediaResult.error
      },
      notifications: {
        success: notificationResult.success,
        error: notificationResult.error
      },
    },
    errors,
  };
}

/**
 * Get available media devices
 */
export async function getMediaDevices(): Promise<{
  audioInputs: MediaDeviceInfo[];
  audioOutputs: MediaDeviceInfo[];
  videoInputs: MediaDeviceInfo[];
}> {
  try {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      throw new Error('Media devices enumeration not supported');
    }

    const devices = await navigator.mediaDevices.enumerateDevices();

    return {
      audioInputs: devices.filter(d => d.kind === 'audioinput'),
      audioOutputs: devices.filter(d => d.kind === 'audiooutput'),
      videoInputs: devices.filter(d => d.kind === 'videoinput'),
    };
  } catch (error: any) {
    console.error('[Permissions] Failed to enumerate devices:', error);
    return {
      audioInputs: [],
      audioOutputs: [],
      videoInputs: [],
    };
  }
}

/**
 * Listen to permission changes
 */
export function listenToPermissionChanges(
  type: PermissionType,
  callback: (state: PermissionState) => void
): () => void {
  if (type === 'notifications') {
    // Notifications don't support permission change events
    console.warn('[Permissions] Change listener not supported for notifications');
    return () => {};
  }

  if (!navigator.permissions || !navigator.permissions.query) {
    console.warn('[Permissions] Permissions API not supported');
    return () => {};
  }

  let permissionStatus: PermissionStatus | null = null;

  navigator.permissions.query({ name: type as PermissionName })
    .then((status) => {
      permissionStatus = status as any;
      callback(status.state);

      status.addEventListener('change', () => {
        callback(status.state);
      });
    })
    .catch((error) => {
      console.error('[Permissions] Failed to listen to permission changes:', error);
    });

  return () => {
    if (permissionStatus) {
      // Remove listener (not directly supported, but the status will be garbage collected)
      permissionStatus = null;
    }
  };
}

/**
 * Get user-friendly permission error message
 */
export function getPermissionErrorMessage(type: PermissionType, error?: string): string {
  const baseMessages: Record<PermissionType, string> = {
    microphone: 'Microphone access is required for voice features.',
    camera: 'Camera access is required for video calls.',
    notifications: 'Notification permission is required to receive alerts.',
    'background-sync': 'Background sync is required for offline functionality.',
  };

  const instructions: Record<PermissionType, string> = {
    microphone: 'Please allow microphone access in your browser/system settings.',
    camera: 'Please allow camera access in your browser/system settings.',
    notifications: 'Please allow notifications in your browser/system settings.',
    'background-sync': 'Please enable background sync in your browser settings.',
  };

  if (error) {
    return `${baseMessages[type]}\n\n${error}\n\n${instructions[type]}`;
  }

  return `${baseMessages[type]} ${instructions[type]}`;
}
