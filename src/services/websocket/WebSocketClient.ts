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

        console.log('🔌 Connecting to WebSocket:', url.origin + url.pathname);

        this.ws = new WebSocket(url.toString());

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
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
            this.handleMessage(message);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('🔌 WebSocket disconnected');
          this.isConnected = false;
          this.stopHeartbeat();
          this.updateConnectionState('disconnected');

          // Auto-reconnect if enabled
          if (this.config.autoReconnect && !this.isReconnecting) {
            this.scheduleReconnect();
          }
        };

      } catch (error) {
        console.error('❌ Error creating WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.ws) {
      console.log('🔌 Disconnecting WebSocket...');
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
        console.error('❌ Error sending WebSocket message:', error);
        // Queue message for retry
        this.queueMessage(message);
      }
    } else {
      // Queue message for when connection is restored
      console.log('📥 Queueing message (not connected)');
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

  /**
   * Handle incoming messages
   * @private
   */
  private handleMessage(message: any): void {
    const { type, action } = message;
    const eventType = type || action;

    // Handle special system messages
    if (eventType === 'session:force_logout') {
      this.handleForceLogout(message.data);
      return;
    }

    // Emit to event handlers
    const handlers = this.eventHandlers.get(eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`❌ Error in event handler for ${eventType}:`, error);
        }
      });
    }

    // Also emit to wildcard handlers
    const wildcardHandlers = this.eventHandlers.get('*');
    if (wildcardHandlers) {
      wildcardHandlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error('❌ Error in wildcard event handler:', error);
        }
      });
    }
  }

  /**
   * Handle force logout message
   * @private
   */
  private handleForceLogout(data: any): void {
    console.warn('⚠️ Force logout received:', data.message);

    // Emit force logout event
    const handlers = this.eventHandlers.get('session:force_logout');
    if (handlers) {
      handlers.forEach(handler => handler(data));
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
      console.warn('⚠️ Message queue is full, removing oldest messages');
      this.messageQueue = this.messageQueue.slice(-100);
    }
  }

  /**
   * Process queued messages
   * @private
   */
  private processMessageQueue(): void {
    if (this.messageQueue.length > 0) {
      console.log(`📤 Processing ${this.messageQueue.length} queued messages`);

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
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 10)) {
      console.error('❌ Max reconnection attempts reached');
      this.updateConnectionState('disconnected');
      return;
    }

    this.isReconnecting = true;
    this.updateConnectionState('reconnecting');

    // Exponential backoff: 3s, 6s, 12s, 24s, etc.
    const delay = this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts);
    const maxDelay = 60000; // Max 1 minute
    const actualDelay = Math.min(delay, maxDelay);

    console.log(`🔄 Reconnecting in ${actualDelay / 1000}s (attempt ${this.reconnectAttempts + 1}/${this.config.maxReconnectAttempts})...`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectAttempts++;
      this.connect().catch((error) => {
        console.error('❌ Reconnection failed:', error);
        this.scheduleReconnect();
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
    this.connectionStateHandlers.forEach(handler => {
      try {
        handler(state);
      } catch (error) {
        console.error('❌ Error in connection state handler:', error);
      }
    });
  }
}

export default WebSocketClient;
export type { WebSocketConfig, WebSocketEventHandler, ConnectionStateHandler };
