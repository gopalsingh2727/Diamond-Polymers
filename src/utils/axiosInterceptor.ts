/**
 * Axios Interceptor with Automatic Server Fallback
 *
 * This interceptor adds fallback support to ALL axios calls globally.
 * Primary: VITE_API_27INFINITY_IN
 * Fallback: VITE_API_27INFINITY_COM
 *
 * Usage: Import this file once in your app (e.g., main.tsx or App.tsx)
 * import './utils/axiosInterceptor';
 */

import axios, { AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Server URLs - Use same URL for both primary and fallback (no separate fallback server)
const PRIMARY_URL = import.meta.env.VITE_API_27INFINITY_IN || 'https://api.27infinity.in';
const FALLBACK_URL = import.meta.env.VITE_API_27INFINITY_COM || 'https://api.27infinity.in';

// WebSocket URLs
const PRIMARY_WS_URL = import.meta.env.VITE_WEBSOCKET_URL || 'wss://api.27infinity.in/dev';
const FALLBACK_WS_URL = import.meta.env.VITE_WEBSOCKET_URL_FALLBACK || 'wss://api.27infinity.in/dev';

// Track server status
let usingFallback = false;
let lastPrimaryAttempt = 0;
const RETRY_PRIMARY_INTERVAL = 5 * 60 * 1000; // 5 minutes
let retryQueue: Array<{
  config: InternalAxiosRequestConfig;
  resolve: (value: AxiosResponse) => void;
  reject: (error: any) => void;
}> = [];
let isRetrying = false;

// Errors that should trigger fallback
const FALLBACK_ERROR_CODES = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET', 'ERR_NETWORK', 'ERR_CONNECTION_REFUSED'];
const FALLBACK_STATUS_CODES = [0, 502, 503, 504, 520, 521, 522, 523, 524];

/**
 * Check if error should trigger fallback
 */
function shouldTriggerFallback(error: AxiosError): boolean {
  // Network error codes
  if (error.code && FALLBACK_ERROR_CODES.includes(error.code)) {
    return true;
  }

  // Server error status codes
  if (error.response?.status && FALLBACK_STATUS_CODES.includes(error.response.status)) {
    return true;
  }

  // No response (network error)
  if (!error.response && error.message) {
    if (error.message.includes('Network Error') ||
    error.message.includes('timeout') ||
    error.message.includes('CORS')) {
      return true;
    }
  }

  return false;
}

/**
 * Replace primary URL with fallback URL in the request
 */
function switchToFallbackUrl(url: string | undefined): string {
  if (!url) return '';

  // Replace primary with fallback
  if (url.includes(PRIMARY_URL)) {
    return url.replace(PRIMARY_URL, FALLBACK_URL);
  }

  // If URL is relative, prepend fallback
  if (url.startsWith('/')) {
    return `${FALLBACK_URL}${url}`;
  }

  return url;
}

/**
 * Get current API base URL
 */
export function getCurrentApiUrl(): string {
  // Periodically try primary again
  if (usingFallback && Date.now() - lastPrimaryAttempt > RETRY_PRIMARY_INTERVAL) {

    usingFallback = false;
  }
  return usingFallback ? FALLBACK_URL : PRIMARY_URL;
}

/**
 * Get current WebSocket URL
 */
export function getCurrentWsUrl(): string {
  return usingFallback ? FALLBACK_WS_URL : PRIMARY_WS_URL;
}

/**
 * Get server status
 */
export function getServerStatus() {
  return {
    usingFallback,
    primaryApi: PRIMARY_URL,
    fallbackApi: FALLBACK_URL,
    primaryWs: PRIMARY_WS_URL,
    fallbackWs: FALLBACK_WS_URL,
    currentApi: getCurrentApiUrl(),
    currentWs: getCurrentWsUrl()
  };
}

/**
 * Force reset to primary server
 */
export function resetToPrimaryServer() {
  usingFallback = false;
  lastPrimaryAttempt = 0;
  sessionStorage.removeItem('api_server_fallback');

}

/**
 * Force switch to fallback server
 */
export function switchToFallbackServer() {
  usingFallback = true;
  lastPrimaryAttempt = Date.now();
  sessionStorage.setItem('api_server_fallback', 'true');

}

// ============================================================
// AXIOS RESPONSE INTERCEPTOR - Handle fallback on error
// ============================================================

axios.interceptors.response.use(
  // Success - return response as-is
  (response: AxiosResponse) => {
    return response;
  },

  // Error - check if we should fallback
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {_retry?: boolean;_fallbackAttempted?: boolean;};

    // ✅ CHECK FOR SESSION EXPIRATION FIRST (401 + sessionExpired flag)
    if (error.response?.status === 401 && error.response?.data) {
      const responseData = error.response.data as any;
      if (responseData.sessionExpired === true) {


        // Dispatch SESSION_EXPIRED action to Redux store
        if (typeof window !== 'undefined' && (window as any).store) {
          (window as any).store.dispatch({
            type: 'SESSION_EXPIRED',
            payload: responseData.message || 'Your session has expired. Please log in again.'
          });
        }

        // Don't retry, just reject with the session expired error
        return Promise.reject(error);
      }
    }

    // Don't retry if already retried or if fallback already attempted
    if (!originalRequest || originalRequest._fallbackAttempted) {
      return Promise.reject(error);
    }

    // Check if this error should trigger fallback
    if (shouldTriggerFallback(error) && !usingFallback) {



      // Switch to fallback
      switchToFallbackServer();

      // Mark this request to prevent infinite retry
      originalRequest._fallbackAttempted = true;

      // Update the URL to use fallback
      originalRequest.url = switchToFallbackUrl(originalRequest.url);

      // Also update baseURL if set
      if (originalRequest.baseURL === PRIMARY_URL) {
        originalRequest.baseURL = FALLBACK_URL;
      }



      // Retry the request with fallback URL
      try {
        const response = await axios.request(originalRequest);

        return response;
      } catch (fallbackError) {

        return Promise.reject(fallbackError);
      }
    }

    // If already using fallback or error doesn't trigger fallback, just reject
    return Promise.reject(error);
  }
);

// ============================================================
// Initialize from session storage
// ============================================================

// Check if we were using fallback before page refresh
const storedFallback = sessionStorage.getItem('api_server_fallback');
if (storedFallback === 'true') {
  usingFallback = true;
  lastPrimaryAttempt = Date.now();

}

// Log current server status on init






// Export utility functions
export default {
  getCurrentApiUrl,
  getCurrentWsUrl,
  getServerStatus,
  resetToPrimaryServer,
  switchToFallbackServer
};