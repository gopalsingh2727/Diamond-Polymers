/**
 * WebSocket Client for 27 Manufacturing System
 * Handles real-time communication with backend
 *
 * Features:
 * - Auto-reconnection with exponential backoff
 * - Message queue for offline messages
 * - Event-based message handling
 * - Heartbeat/ping-pong
 */

type WebSocketEventHandler = (data: any) => void;
type ConnectionStateHandler = (state: 'connecting' | 'connected' | 'disconnected' | 'reconnecting') => void;
type RequestCallback = (response: any) => void;

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timeout: NodeJS.Timeout;
}

interface WebSocketConfig {
  url: string;
  token: string;
  platform?: 'electron' | 'web' | 'mobile';
  deviceId?: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

class WebSocketClient {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private eventHandlers: Map<string, Set<WebSocketEventHandler>> = new Map();
  private connectionStateHandlers: Set<ConnectionStateHandler> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  private isConnected = false;
  private isReconnecting = false;
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private requestCounter = 0;

  constructor(config: WebSocketConfig) {
    this.config = {
      autoReconnect: true,
      reconnectInterval: 3000, // 3 seconds
      maxReconnectAttempts: 10,
      heartbeatInterval: 30000, // 30 seconds
      platform: 'web',
      ...config
    };
  }

  /**
   * Connect to WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.updateConnectionState('connecting');

        // Build connection URL with query parameters
        const url = new URL(this.config.url);
        url.searchParams.set('token', this.config.token);
        if (this.config.platform) {
          url.searchParams.set('platform', this.config.platform);
        }
        if (this.config.deviceId) {
          url.searchParams.set('deviceId', this.config.deviceId);
        }




        this.ws = new WebSocket(url.toString());

        this.ws.onopen = () => {

          this.isConnected = true;
          this.isReconnecting = false;
          this.reconnectAttempts = 0;
          this.updateConnectionState('connected');

          // Start heartbeat
          this.startHeartbeat();

          // Process queued messages
          this.processMessageQueue();

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            // 🔍 DEBUG: Log ALL incoming WebSocket messages
            console.log('[WebSocket] Received message:', message);

            this.handleMessage(message);
          } catch (error) {
            console.error('[WebSocket] Failed to parse message:', error);
          }
        };

        this.ws.onerror = () => {
          // Silently reject - don't spam console
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = () => {

          this.isConnected = false;
          this.stopHeartbeat();
          this.updateConnectionState('disconnected');

          // Auto-reconnect if enabled
          if (this.config.autoReconnect && !this.isReconnecting) {
            this.scheduleReconnect();
          }
        };

      } catch (error) {

        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {

      this.config.autoReconnect = false; // Disable auto-reconnect
      this.stopHeartbeat();
      this.clearReconnectTimer();
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * Send message to WebSocket server
   */
  send(message: any): void {
    if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {

        // Queue message for retry
        this.queueMessage(message);
      }
    } else {
      // Queue message for when connection is restored

      this.queueMessage(message);
    }
  }

  /**
   * Subscribe to a specific event type
   */
  on(eventType: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType)!.add(handler);
  }

  /**
   * Unsubscribe from an event type
   */
  off(eventType: string, handler: WebSocketEventHandler): void {
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(eventType);
      }
    }
  }

  /**
   * Subscribe to connection state changes
   */
  onConnectionStateChange(handler: ConnectionStateHandler): void {
    this.connectionStateHandlers.add(handler);
  }

  /**
   * Unsubscribe from connection state changes
   */
  offConnectionStateChange(handler: ConnectionStateHandler): void {
    this.connectionStateHandlers.delete(handler);
  }

  /**
   * Subscribe to a room
   */
  subscribeToRoom(roomName: string): void {
    this.send({
      action: 'subscribe',
      data: { room: roomName }
    });
  }

  /**
   * Unsubscribe from a room
   */
  unsubscribeFromRoom(roomName: string): void {
    this.send({
      action: 'unsubscribe',
      data: { room: roomName }
    });
  }

  /**
   * Subscribe to order updates
   */
  subscribeToOrder(orderId: string): void {
    this.send({
      action: 'subscribeToOrder',
      data: { orderId }
    });
  }

  /**
   * Subscribe to machine updates
   */
  subscribeToMachine(machineId: string): void {
    this.send({
      action: 'subscribeToMachine',
      data: { machineId }
    });
  }

  /**
   * Get current connection status
   */
  getStatus(): void {
    this.send({
      action: 'getStatus'
    });
  }

  /**
   * Get subscribed rooms
   */
  getRooms(): void {
    this.send({
      action: 'getRooms'
    });
  }

  /**
   * Check if connected
   */
  get connected(): boolean {
    return this.isConnected;
  }

  // ============================================
  // REQUEST-RESPONSE METHODS (Data Fetching)
  // ============================================

  /**
   * Send a request and wait for response
   * @param action - Action name
   * @param data - Request data
   * @param timeout - Timeout in milliseconds (default 10 seconds)
   */
  request<T = any>(action: string, data: any = {}, timeout = 10000): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = `${action}_${++this.requestCounter}_${Date.now()}`;

      // Set timeout
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(action);
        reject(new Error(`Request timeout: ${action}`));
      }, timeout);

      // Store pending request
      this.pendingRequests.set(action, {
        resolve: (response: T) => {
          clearTimeout(timeoutId);
          this.pendingRequests.delete(action);
          resolve(response);
        },
        reject: (error: any) => {
          clearTimeout(timeoutId);
          this.pendingRequests.delete(action);
          reject(error);
        },
        timeout: timeoutId
      });

      // Send request
      this.send({ action, data, requestId });
    });
  }

  /**
   * Fetch orders via WebSocket
   */
  async fetchOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    forceRefresh?: boolean;
  } = {}): Promise<any> {
    const response = await this.request('order:list', params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch orders');
    }
    return response.data;
  }

  /**
   * Fetch single order via WebSocket
   */
  async fetchOrder(orderId: string, forceRefresh = false): Promise<any> {
    const response = await this.request('order:get', { orderId, forceRefresh });
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch order');
    }
    return response.data;
  }

  /**
   * Fetch machines via WebSocket
   */
  async fetchMachines(params: {
    status?: string;
    machineType?: string;
    forceRefresh?: boolean;
  } = {}): Promise<any> {
    const response = await this.request('machine:list', params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch machines');
    }
    return response.data;
  }

  /**
   * Fetch single machine via WebSocket
   */
  async fetchMachine(machineId: string, forceRefresh = false): Promise<any> {
    const response = await this.request('machine:get', { machineId, forceRefresh });
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch machine');
    }
    return response.data;
  }

  /**
   * Fetch customers via WebSocket
   */
  async fetchCustomers(params: {
    page?: number;
    limit?: number;
    search?: string;
    forceRefresh?: boolean;
  } = {}): Promise<any> {
    const response = await this.request('customer:list', params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch customers');
    }
    return response.data;
  }

  /**
   * Fetch dashboard data via WebSocket
   */
  async fetchDashboard(params: {
    dateRange?: 'today' | 'week' | 'month';
    branchId?: string;
    forceRefresh?: boolean;
  } = {}): Promise<any> {
    const response = await this.request('dashboard:get', params);
    if (!response.success) {
      throw new Error(response.error || 'Failed to fetch dashboard data');
    }
    return response.data;
  }

  /**
   * Subscribe to daybook updates (real-time order changes)
   */
  subscribeToDaybook(branchId?: string): void {
    this.send({
      action: 'subscribeToDaybook',
      data: { branchId }
    });
  }

  /**
   * Subscribe to dashboard updates (real-time metrics)
   */
  subscribeToDashboard(branchId?: string): void {
    this.send({
      action: 'subscribeToDashboard',
      data: { branchId }
    });
  }

  /**
   * Handle incoming messages
   * @private
   */
  private handleMessage(message: any): void {
    const { type, action } = message;
    const eventType = type || action;

    console.log('[WebSocket] Handling message - eventType:', eventType, 'message:', message);

    // Handle special system messages
    if (eventType === 'session:force_logout') {
      this.handleForceLogout(message.data);
      return;
    }

    // Check if this is a response to a pending request
    if (action && this.pendingRequests.has(action)) {
      const pending = this.pendingRequests.get(action)!;
      if (message.success === false || message.error) {
        pending.reject(new Error(message.error || 'Request failed'));
      } else {
        pending.resolve(message);
      }
      return;
    }

    // Emit to event handlers
    const handlers = this.eventHandlers.get(eventType);
    console.log('[WebSocket] Found', handlers?.size || 0, 'handlers for eventType:', eventType);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          console.log('[WebSocket] Calling handler for:', eventType);
          handler(message);
        } catch (error) {
          console.error('[WebSocket] Handler error for', eventType, ':', error);
        }
      });
    }

    // Also emit to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => {
        try {
          handler(message);
        } catch (error) {
          console.error('[WebSocket] Wildcard handler error:', error);
        }
      });
    }
  }

  /**
   * Handle force logout message
   * @private
   */
  private handleForceLogout(data: any): void {


    // Emit force logout event
    const handlers = this.eventHandlers.get('session:force_logout');
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }

    // Disconnect
    this.disconnect();
  }

  /**
   * Start heartbeat (ping/pong)
   * @private
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing heartbeat

    if (this.config.heartbeatInterval && this.config.heartbeatInterval > 0) {
      this.heartbeatTimer = setInterval(() => {
        if (this.isConnected) {
          this.send({ action: 'ping' });
        }
      }, this.config.heartbeatInterval);
    }
  }

  /**
   * Stop heartbeat
   * @private
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Queue message for later sending
   * @private
   */
  private queueMessage(message: any): void {
    this.messageQueue.push(message);

    // Limit queue size to prevent memory issues
    if (this.messageQueue.length > 100) {

      this.messageQueue = this.messageQueue.slice(-100);
    }
  }

  /**
   * Process queued messages
   * @private
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length > 0) {


      while (this.messageQueue.length > 0) {
        const message = this.messageQueue.shift();
        this.send(message);
      }
    }
  }

  /**
   * Schedule reconnection attempt
   * @private
   */
  private scheduleReconnect(): void {
    // Don't reconnect if disabled
    if (!this.config.autoReconnect) {

      this.updateConnectionState('disconnected');
      return;
    }

    // ✅ FIXED: Check BEFORE incrementing
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {





      this.updateConnectionState('disconnected');
      this.isReconnecting = false;
      this.config.autoReconnect = false; // ✅ Stop trying to reconnect
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++; // ✅ FIXED: Increment BEFORE calculating delay
    this.updateConnectionState('reconnecting');

    // Exponential backoff: 5s, 10s, 20s, 40s...
    const delay = this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts - 1);
    const maxDelay = 30000; // Max 30 seconds
    const actualDelay = Math.min(delay, maxDelay);



    this.reconnectTimer = setTimeout(() => {
      this.connect().catch((error) => {

        // ✅ FIXED: Only schedule if we haven't hit max attempts
        if (this.reconnectAttempts < (this.config.maxReconnectAttempts || 10) && this.config.autoReconnect) {
          this.scheduleReconnect();
        } else {

          this.isReconnecting = false;
          this.config.autoReconnect = false;
          this.updateConnectionState('disconnected');
        }
      });
    }, actualDelay);
  }

  /**
   * Clear reconnect timer
   * @private
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Update connection state and notify handlers
   * @private
   */
  private updateConnectionState(state: 'connecting' | 'connected' | 'disconnected' | 'reconnecting'): void {
    this.connectionStateHandlers.forEach((handler) => {
      try {
        handler(state);
      } catch (error) {

      }
    });
  }
}

export default WebSocketClient;
export type { WebSocketConfig, WebSocketEventHandler, ConnectionStateHandler };