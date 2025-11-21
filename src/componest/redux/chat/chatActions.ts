/**
 * Chat Redux Actions
 * Async thunks for chat API calls
 */

import { Dispatch } from 'redux';
import axios from 'axios';
import {
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  loadHistoryStart,
  loadHistorySuccess,
  loadHistoryFailure,
  loadSettingsStart,
  loadSettingsSuccess,
  loadSettingsFailure,
  loadRemindersStart,
  loadRemindersSuccess,
  loadRemindersFailure,
  setDueReminders,
  addReminder,
  updateReminder,
  removeReminder,
  setPosition,
  ChatMessage,
  Reminder,
  ChatSettings
} from './chatSlice';

// API Configuration
const API_URL = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';
const API_KEY = import.meta.env.VITE_API_KEY || '27infinity.in_5f84c89315f74a2db149c06a93cf4820';

// Helper to get auth headers
const getHeaders = () => {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'Authorization': `Bearer ${token}`
  };
};

// ============================================================================
// MESSAGE ACTIONS
// ============================================================================

/**
 * Send a chat message
 */
export const sendChatMessage = (message: string) => async (dispatch: Dispatch) => {
  dispatch(sendMessageStart());

  try {
    const response = await axios.post(
      `${API_URL}/chat/message`,
      { message },
      { headers: getHeaders() }
    );

    if (response.data.success) {
      const { response: assistantResponse, assistantName, conversationId, timestamp } = response.data.data;

      const userMessage: ChatMessage = {
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: assistantResponse,
        timestamp,
        responseData: response.data.data.responseData
      };

      dispatch(sendMessageSuccess({
        userMessage,
        assistantMessage,
        conversationId
      }));

      return { success: true, response: assistantResponse, assistantName };
    } else {
      dispatch(sendMessageFailure(response.data.message));
      return { success: false, error: response.data.message };
    }
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Failed to send message';
    dispatch(sendMessageFailure(errorMessage));
    return { success: false, error: errorMessage };
  }
};

/**
 * Load chat history
 */
export const loadChatHistory = (limit: number = 50) => async (dispatch: Dispatch) => {
  dispatch(loadHistoryStart());

  try {
    const response = await axios.get(
      `${API_URL}/chat/history?limit=${limit}`,
      {
        headers: getHeaders(),
        timeout: 15000 // 15 second timeout
      }
    );

    if (response.data.success) {
      dispatch(loadHistorySuccess(response.data.data.messages));
    } else {
      // Empty history on failure
      dispatch(loadHistorySuccess([]));
    }
  } catch (error: any) {
    // Silent failure - use empty history
    console.warn('Chat history load failed:', error.message);
    dispatch(loadHistorySuccess([]));
  }
};

// ============================================================================
// SETTINGS ACTIONS
// ============================================================================

/**
 * Load chat settings
 */
export const loadChatSettings = () => async (dispatch: Dispatch) => {
  dispatch(loadSettingsStart());

  try {
    const response = await axios.get(
      `${API_URL}/chat/settings`,
      {
        headers: getHeaders(),
        timeout: 15000 // 15 second timeout
      }
    );

    if (response.data.success) {
      dispatch(loadSettingsSuccess(response.data.data));
    } else {
      // Use default settings on failure
      dispatch(loadSettingsSuccess({
        isEnabled: true,
        assistantName: 'Assistant',
        voiceGender: 'female',
        language: 'en-IN',
        autoSpeak: true,
        speechRate: 1.0
      }));
    }
  } catch (error: any) {
    // Silent failure - use default settings instead of showing error
    console.warn('Chat settings load failed, using defaults:', error.message);
    dispatch(loadSettingsSuccess({
      isEnabled: true,
      assistantName: 'Assistant',
      voiceGender: 'female',
      language: 'en-IN',
      autoSpeak: true,
      speechRate: 1.0
    }));
  }
};

/**
 * Update chat settings
 */
export const updateChatSettings = (settings: Partial<ChatSettings>) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.put(
      `${API_URL}/chat/settings`,
      settings,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      dispatch(loadSettingsSuccess(response.data.data));
      return { success: true };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to update settings' };
  }
};

/**
 * Update chat widget position
 */
export const updateChatPosition = (x: number, y: number) => async (dispatch: Dispatch) => {
  dispatch(setPosition({ x, y }));

  try {
    await axios.put(
      `${API_URL}/chat/settings/position`,
      { x, y },
      { headers: getHeaders() }
    );
  } catch (error) {
    // Silent fail - position saved locally
    console.error('Failed to save position:', error);
  }
};

/**
 * Update hardware info
 */
export const updateHardwareInfo = (ramGB: number) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.put(
      `${API_URL}/chat/settings/hardware`,
      { ramGB },
      { headers: getHeaders() }
    );

    if (response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    console.error('Failed to update hardware info:', error);
  }
};

/**
 * Accept chat rules
 */
export const acceptChatRules = () => async (dispatch: Dispatch) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat/settings/accept-rules`,
      {},
      { headers: getHeaders() }
    );

    if (response.data.success) {
      // Reload settings to get updated rulesAccepted
      dispatch(loadChatSettings() as any);
      return { success: true };
    }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message };
  }
};

// ============================================================================
// REMINDER ACTIONS
// ============================================================================

/**
 * Load reminders
 */
export const loadReminders = (status: string = 'pending') => async (dispatch: Dispatch) => {
  dispatch(loadRemindersStart());

  try {
    const response = await axios.get(
      `${API_URL}/chat/reminders?status=${status}`,
      {
        headers: getHeaders(),
        timeout: 15000 // 15 second timeout
      }
    );

    if (response.data.success) {
      dispatch(loadRemindersSuccess(response.data.data.reminders));
    } else {
      // Empty reminders on failure
      dispatch(loadRemindersSuccess([]));
    }
  } catch (error: any) {
    // Silent failure - use empty reminders
    console.warn('Reminders load failed:', error.message);
    dispatch(loadRemindersSuccess([]));
  }
};

/**
 * Check for due reminders
 */
export const checkDueReminders = () => async (dispatch: Dispatch) => {
  try {
    const response = await axios.get(
      `${API_URL}/chat/reminders/pending`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      dispatch(setDueReminders(response.data.data.reminders));
      return response.data.data.reminders;
    }
  } catch (error) {
    console.error('Failed to check due reminders:', error);
    return [];
  }
};

/**
 * Create a reminder
 */
export const createReminder = (reminderData: {
  title: string;
  description?: string;
  dueDate: string;
  priority?: string;
}) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat/reminder`,
      reminderData,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      dispatch(addReminder(response.data.data));
      return { success: true, reminder: response.data.data };
    } else {
      return { success: false, error: response.data.message };
    }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message || 'Failed to create reminder' };
  }
};

/**
 * Complete a reminder
 */
export const completeReminder = (reminderId: string) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat/reminder/${reminderId}/complete`,
      {},
      { headers: getHeaders() }
    );

    if (response.data.success) {
      dispatch(updateReminder(response.data.data));
      return { success: true };
    }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message };
  }
};

/**
 * Snooze a reminder
 */
export const snoozeReminder = (reminderId: string, minutes: number = 30) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat/reminder/${reminderId}/snooze`,
      { minutes },
      { headers: getHeaders() }
    );

    if (response.data.success) {
      dispatch(updateReminder(response.data.data));
      return { success: true };
    }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message };
  }
};

/**
 * Dismiss a reminder
 */
export const dismissReminder = (reminderId: string) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat/reminder/${reminderId}/dismiss`,
      {},
      { headers: getHeaders() }
    );

    if (response.data.success) {
      dispatch(updateReminder(response.data.data));
      return { success: true };
    }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message };
  }
};

/**
 * Delete a reminder
 */
export const deleteReminder = (reminderId: string) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.delete(
      `${API_URL}/chat/reminder/${reminderId}`,
      { headers: getHeaders() }
    );

    if (response.data.success) {
      dispatch(removeReminder(reminderId));
      return { success: true };
    }
  } catch (error: any) {
    return { success: false, error: error.response?.data?.message };
  }
};

/**
 * Mark reminder as notified (after showing notification)
 */
export const markReminderNotified = (reminderId: string) => async () => {
  try {
    await axios.post(
      `${API_URL}/chat/reminder/${reminderId}/notified`,
      {},
      { headers: getHeaders() }
    );
  } catch (error) {
    console.error('Failed to mark reminder as notified:', error);
  }
};

// ============================================================================
// HEALTH CHECK
// ============================================================================

/**
 * Check chat service health
 */
export const checkChatHealth = async () => {
  try {
    const response = await axios.get(
      `${API_URL}/chat/health`,
      { headers: { 'x-api-key': API_KEY } }
    );

    return response.data.data;
  } catch (error) {
    return { available: false };
  }
};
