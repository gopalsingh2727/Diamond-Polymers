/**
 * WebSocket Redux Slice
 * Manages WebSocket connection state and real-time messages
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';

interface WebSocketState {
  // Connection status
  status: ConnectionStatus;
  isConnected: boolean;

  // Connection metadata
  connectionId: string | null;
  connectedAt: string | null;
  lastPingTime: string | null;

  // User rooms
  subscribedRooms: string[];

  // Error handling
  error: string | null;
  reconnectAttempts: number;

  // Real-time messages (can be used for debugging)
  lastMessages: any[];

  // Force logout flag
  forceLoggedOut: boolean;
  forceLogoutReason: string | null;
}

const initialState: WebSocketState = {
  status: 'disconnected',
  isConnected: false,
  connectionId: null,
  connectedAt: null,
  lastPingTime: null,
  subscribedRooms: [],
  error: null,
  reconnectAttempts: 0,
  lastMessages: [],
  forceLoggedOut: false,
  forceLogoutReason: null
};

const websocketSlice = createSlice({
  name: 'websocket',
  initialState,
  reducers: {
    // Connection actions
    connecting: (state) => {
      state.status = 'connecting';
      state.isConnected = false;
      state.error = null;
    },

    connected: (state, action: PayloadAction<{ connectionId: string; rooms: string[] }>) => {
      state.status = 'connected';
      state.isConnected = true;
      state.connectionId = action.payload.connectionId;
      state.connectedAt = new Date().toISOString();
      state.subscribedRooms = action.payload.rooms || [];
      state.error = null;
      state.reconnectAttempts = 0;
      state.forceLoggedOut = false;
      state.forceLogoutReason = null;
    },

    disconnected: (state) => {
      state.status = 'disconnected';
      state.isConnected = false;
      state.connectionId = null;
      state.lastPingTime = null;
    },

    reconnecting: (state, action: PayloadAction<number>) => {
      state.status = 'reconnecting';
      state.isConnected = false;
      state.reconnectAttempts = action.payload;
    },

    connectionError: (state, action: PayloadAction<string>) => {
      state.status = 'error';
      state.isConnected = false;
      state.error = action.payload;
    },

    // Message actions
    messageReceived: (state, action: PayloadAction<any>) => {
      // Store last 50 messages for debugging
      state.lastMessages.unshift(action.payload);
      if (state.lastMessages.length > 50) {
        state.lastMessages = state.lastMessages.slice(0, 50);
      }
    },

    // Room management
    roomSubscribed: (state, action: PayloadAction<string>) => {
      if (!state.subscribedRooms.includes(action.payload)) {
        state.subscribedRooms.push(action.payload);
      }
    },

    roomUnsubscribed: (state, action: PayloadAction<string>) => {
      state.subscribedRooms = state.subscribedRooms.filter(room => room !== action.payload);
    },

    roomsUpdated: (state, action: PayloadAction<string[]>) => {
      state.subscribedRooms = action.payload;
    },

    // Heartbeat
    pingReceived: (state) => {
      state.lastPingTime = new Date().toISOString();
    },

    // Force logout
    forceLogout: (state, action: PayloadAction<{ reason: string; message: string }>) => {
      state.forceLoggedOut = true;
      state.forceLogoutReason = action.payload.message;
      state.status = 'disconnected';
      state.isConnected = false;
    },

    // Clear force logout flag (after user acknowledges)
    clearForceLogout: (state) => {
      state.forceLoggedOut = false;
      state.forceLogoutReason = null;
    },

    // Reset state
    resetWebSocket: () => initialState
  }
});

export const {
  connecting,
  connected,
  disconnected,
  reconnecting,
  connectionError,
  messageReceived,
  roomSubscribed,
  roomUnsubscribed,
  roomsUpdated,
  pingReceived,
  forceLogout,
  clearForceLogout,
  resetWebSocket
} = websocketSlice.actions;

export default websocketSlice.reducer;
