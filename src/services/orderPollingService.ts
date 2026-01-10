/**
 * Order Polling Service
 * Handles long-polling and change detection for order updates
 */

import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/dev';

export interface OrderUpdate {
  type: 'order:updated' | 'order:created' | 'order:deleted' | 'order:status_changed';
  data: any;
  timestamp: string;
}

export interface PollResponse {
  success: boolean;
  data: {
    updates: OrderUpdate[];
    timestamp: string;
    timedOut?: boolean;
    hasMore?: boolean;
  };
}

export interface ChangeResponse {
  success: boolean;
  data: {
    hasChanges: boolean;
    changeCount: number;
    since: string;
    timestamp: string;
  };
}

export interface PollOptions {
  branchId: string;
  since?: string;
  timeout?: number;
  types?: string[];
}

/**
 * Long-poll for order updates
 * Waits up to timeout ms for new updates
 */
export async function pollOrders(options: PollOptions): Promise<PollResponse> {
  const { branchId, since, timeout = 30000, types } = options;

  const params: any = {
    branchId,
    timeout: Math.min(timeout, 60000), // Max 60 seconds
  };

  if (since) {
    params.since = since;
  }

  if (types && types.length > 0) {
    params.types = types.join(',');
  }

  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const apiKey = import.meta.env.VITE_API_KEY;

    const response = await axios.get<PollResponse>(`${API_BASE_URL}/v2/orders/poll`, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': apiKey,
      },
      timeout: timeout + 5000, // Add buffer to axios timeout
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Poll orders error:', error);

    // Return empty response on error
    return {
      success: false,
      data: {
        updates: [],
        timestamp: new Date().toISOString(),
        timedOut: true,
      },
    };
  }
}

/**
 * Check if orders have changed (lightweight)
 * Quick check without waiting
 */
export async function checkOrderChanges(
  branchId: string,
  since?: string
): Promise<ChangeResponse> {
  const params: any = { branchId };

  if (since) {
    params.since = since;
  }

  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const apiKey = import.meta.env.VITE_API_KEY;

    const response = await axios.get<ChangeResponse>(`${API_BASE_URL}/v2/orders/changes`, {
      params,
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': apiKey,
      },
      timeout: 10000, // 10 second timeout for quick check
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Check changes error:', error);

    return {
      success: false,
      data: {
        hasChanges: false,
        changeCount: 0,
        since: since || new Date().toISOString(),
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Fetch all orders (when change is detected)
 */
export async function fetchOrders(branchId: string, page = 1, limit = 20) {
  try {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    const apiKey = import.meta.env.VITE_API_KEY;

    const response = await axios.get(`${API_BASE_URL}/v2/orders`, {
      params: { branchId, page, limit },
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-api-key': apiKey,
      },
    });

    return response.data;
  } catch (error: any) {
    console.error('❌ Fetch orders error:', error);
    throw error;
  }
}
