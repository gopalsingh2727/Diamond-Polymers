/**
 * Chat Redux Slice
 * Manages chat state, messages, reminders, and settings
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Types
export interface ChatMessage {
  id?: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  responseData?: any;
}

export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'normal' | 'high';
  status: 'pending' | 'completed' | 'dismissed' | 'snoozed';
  relatedOrderId?: any;
  relatedMachineId?: any;
  createdAt: string;
}

export interface ChatSettings {
  userId: string;
  isEnabled: boolean;
  assistantName: string;
  voiceGender: 'male' | 'female';
  language: string;
  autoSpeak: boolean;
  speechRate: number;
  useOfflineVoice?: boolean; // Use offline voice recognition (for firewalls/VPNs)
  theme: {
    primaryColor: string;
    position: { x: number | null; y: number | null };
  };
  hardwareInfo?: {
    ramGB: number;
    canRunLocalLLM: boolean;
    lastChecked: string;
  };
  rulesAccepted: boolean;
  stats: {
    totalMessages: number;
    totalReminders: number;
    lastUsed: string | null;
  };
}

interface ChatState {
  // UI State
  isOpen: boolean;
  isMinimized: boolean;
  isLoading: boolean;
  isSending: boolean;

  // Messages
  messages: ChatMessage[];
  conversationId: string | null;

  // Reminders
  reminders: Reminder[];
  dueReminders: Reminder[];
  remindersLoading: boolean;

  // Settings
  settings: ChatSettings | null;
  settingsLoading: boolean;

  // Voice
  isListening: boolean;
  isSpeaking: boolean;

  // Errors
  error: string | null;

  // Position for draggable widget
  position: { x: number; y: number } | null;
}

const initialState: ChatState = {
  isOpen: false,
  isMinimized: false,
  isLoading: false,
  isSending: false,

  messages: [],
  conversationId: null,

  reminders: [],
  dueReminders: [],
  remindersLoading: false,

  settings: null,
  settingsLoading: false,

  isListening: false,
  isSpeaking: false,

  error: null,
  position: null
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // UI Actions
    toggleChat: (state) => {
      state.isOpen = !state.isOpen;
      if (state.isOpen) {
        state.isMinimized = false;
      }
    },

    openChat: (state) => {
      state.isOpen = true;
      state.isMinimized = false;
    },

    closeChat: (state) => {
      state.isOpen = false;
    },

    minimizeChat: (state) => {
      state.isMinimized = true;
    },

    maximizeChat: (state) => {
      state.isMinimized = false;
    },

    setPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.position = action.payload;
    },

    // Message Actions
    sendMessageStart: (state) => {
      state.isSending = true;
      state.error = null;
    },

    sendMessageSuccess: (state, action: PayloadAction<{
      userMessage: ChatMessage;
      assistantMessage: ChatMessage;
      conversationId: string;
    }>) => {
      state.isSending = false;
      state.messages.push(action.payload.userMessage);
      state.messages.push(action.payload.assistantMessage);
      state.conversationId = action.payload.conversationId;
    },

    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.isSending = false;
      state.error = action.payload;
    },

    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload);
    },

    clearMessages: (state) => {
      state.messages = [];
      state.conversationId = null;
    },

    // History Actions
    loadHistoryStart: (state) => {
      state.isLoading = true;
    },

    loadHistorySuccess: (state, action: PayloadAction<ChatMessage[]>) => {
      state.isLoading = false;
      state.messages = action.payload;
    },

    loadHistoryFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },

    // Settings Actions
    loadSettingsStart: (state) => {
      state.settingsLoading = true;
    },

    loadSettingsSuccess: (state, action: PayloadAction<ChatSettings>) => {
      state.settingsLoading = false;
      state.settings = action.payload;
      state.error = null; // Clear any previous errors
      if (action.payload && action.payload.theme?.position) {
        state.position = {
          x: action.payload.theme.position.x || window.innerWidth - 420,
          y: action.payload.theme.position.y || window.innerHeight - 600
        };
      }
    },

    loadSettingsFailure: (state, action: PayloadAction<string>) => {
      state.settingsLoading = false;
      state.error = action.payload;
    },

    updateSettingsLocal: (state, action: PayloadAction<Partial<ChatSettings>>) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
      }
    },

    // Reminder Actions
    loadRemindersStart: (state) => {
      state.remindersLoading = true;
    },

    loadRemindersSuccess: (state, action: PayloadAction<Reminder[]>) => {
      state.remindersLoading = false;
      state.reminders = action.payload;
    },

    loadRemindersFailure: (state, action: PayloadAction<string>) => {
      state.remindersLoading = false;
      state.error = action.payload;
    },

    setDueReminders: (state, action: PayloadAction<Reminder[]>) => {
      state.dueReminders = action.payload;
    },

    addReminder: (state, action: PayloadAction<Reminder>) => {
      state.reminders.unshift(action.payload);
    },

    updateReminder: (state, action: PayloadAction<Reminder>) => {
      const index = state.reminders.findIndex(r => r._id === action.payload._id);
      if (index !== -1) {
        state.reminders[index] = action.payload;
      }
      // Remove from due reminders if completed
      if (action.payload.status === 'completed' || action.payload.status === 'dismissed') {
        state.dueReminders = state.dueReminders.filter(r => r._id !== action.payload._id);
      }
    },

    removeReminder: (state, action: PayloadAction<string>) => {
      state.reminders = state.reminders.filter(r => r._id !== action.payload);
      state.dueReminders = state.dueReminders.filter(r => r._id !== action.payload);
    },

    // Voice Actions
    setListening: (state, action: PayloadAction<boolean>) => {
      state.isListening = action.payload;
    },

    setSpeaking: (state, action: PayloadAction<boolean>) => {
      state.isSpeaking = action.payload;
    },

    // Error Actions
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Reset
    resetChat: () => initialState
  }
});

export const {
  toggleChat,
  openChat,
  closeChat,
  minimizeChat,
  maximizeChat,
  setPosition,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  addMessage,
  clearMessages,
  loadHistoryStart,
  loadHistorySuccess,
  loadHistoryFailure,
  loadSettingsStart,
  loadSettingsSuccess,
  loadSettingsFailure,
  updateSettingsLocal,
  loadRemindersStart,
  loadRemindersSuccess,
  loadRemindersFailure,
  setDueReminders,
  addReminder,
  updateReminder,
  removeReminder,
  setListening,
  setSpeaking,
  setError,
  clearError,
  resetChat
} = chatSlice.actions;

export default chatSlice.reducer;
