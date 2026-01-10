/**
 * Call History Tracker
 * Tracks and persists call history locally and to API
 */

import { CallRecord } from '../components/chat/CallHistory';

class CallHistoryTracker {
  private readonly STORAGE_KEY = 'callHistory';
  private readonly MAX_RECORDS = 100; // Keep last 100 calls

  /**
   * Add a new call record to history
   */
  addCallRecord(record: Omit<CallRecord, 'id'>): void {
    try {
      // Generate unique ID
      const id = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newRecord: CallRecord = { ...record, id };

      // Get existing records
      const records = this.getLocalRecords();

      // Add new record at the beginning
      records.unshift(newRecord);

      // Keep only last MAX_RECORDS
      const trimmedRecords = records.slice(0, this.MAX_RECORDS);

      // Save to localStorage
      this.saveLocalRecords(trimmedRecords);

      // Send to API (async, don't wait)
      this.sendToAPI(newRecord).catch((error) => {
        console.warn('[CallHistoryTracker] Failed to sync to API:', error);
      });

      console.log('[CallHistoryTracker] Call record added:', newRecord);
    } catch (error) {
      console.error('[CallHistoryTracker] Error adding call record:', error);
    }
  }

  /**
   * Track outgoing call start
   */
  trackOutgoingCallStart(personId: string, personName: string, callType: 'audio' | 'video'): string {
    const id = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record: CallRecord = {
      id,
      personId,
      personName,
      callType,
      direction: 'outgoing',
      status: 'completed', // Will update when call ends
      duration: 0,
      timestamp: new Date()
    };

    // Save to temporary storage
    sessionStorage.setItem('activeCall', JSON.stringify(record));

    return id;
  }

  /**
   * Track incoming call start
   */
  trackIncomingCallStart(personId: string, personName: string, callType: 'audio' | 'video'): string {
    const id = `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const record: CallRecord = {
      id,
      personId,
      personName,
      callType,
      direction: 'incoming',
      status: 'completed', // Will update based on accept/reject
      duration: 0,
      timestamp: new Date()
    };

    // Save to temporary storage
    sessionStorage.setItem('activeCall', JSON.stringify(record));

    return id;
  }

  /**
   * Update call when it's answered
   */
  updateCallAnswered(): void {
    const activeCallStr = sessionStorage.getItem('activeCall');
    if (activeCallStr) {
      const record = JSON.parse(activeCallStr);
      record.status = 'completed';
      record.answerTime = new Date();
      sessionStorage.setItem('activeCall', JSON.stringify(record));
    }
  }

  /**
   * Complete call with duration
   */
  completeCall(duration: number): void {
    const activeCallStr = sessionStorage.getItem('activeCall');
    if (activeCallStr) {
      const record = JSON.parse(activeCallStr);
      record.duration = duration;
      record.status = 'completed';

      // Convert timestamp back to Date object
      record.timestamp = new Date(record.timestamp);

      // Add to history
      this.addCallRecord(record);

      // Clear active call
      sessionStorage.removeItem('activeCall');
    }
  }

  /**
   * Mark call as missed
   */
  markCallMissed(): void {
    const activeCallStr = sessionStorage.getItem('activeCall');
    if (activeCallStr) {
      const record = JSON.parse(activeCallStr);
      record.status = 'missed';
      record.duration = 0;

      // Convert timestamp back to Date object
      record.timestamp = new Date(record.timestamp);

      // Add to history
      this.addCallRecord(record);

      // Clear active call
      sessionStorage.removeItem('activeCall');
    }
  }

  /**
   * Mark call as rejected
   */
  markCallRejected(): void {
    const activeCallStr = sessionStorage.getItem('activeCall');
    if (activeCallStr) {
      const record = JSON.parse(activeCallStr);
      record.status = 'rejected';
      record.duration = 0;

      // Convert timestamp back to Date object
      record.timestamp = new Date(record.timestamp);

      // Add to history
      this.addCallRecord(record);

      // Clear active call
      sessionStorage.removeItem('activeCall');
    }
  }

  /**
   * Mark call as failed
   */
  markCallFailed(): void {
    const activeCallStr = sessionStorage.getItem('activeCall');
    if (activeCallStr) {
      const record = JSON.parse(activeCallStr);
      record.status = 'failed';
      record.duration = 0;

      // Convert timestamp back to Date object
      record.timestamp = new Date(record.timestamp);

      // Add to history
      this.addCallRecord(record);

      // Clear active call
      sessionStorage.removeItem('activeCall');
    }
  }

  /**
   * Get all local records
   */
  private getLocalRecords(): CallRecord[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];

      const parsed = JSON.parse(data);
      // Convert timestamp strings back to Date objects
      return parsed.map((r: any) => ({
        ...r,
        timestamp: new Date(r.timestamp)
      }));
    } catch (error) {
      console.error('[CallHistoryTracker] Error reading local records:', error);
      return [];
    }
  }

  /**
   * Save records to localStorage
   */
  private saveLocalRecords(records: CallRecord[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('[CallHistoryTracker] Error saving local records:', error);
    }
  }

  /**
   * Send record to API
   */
  private async sendToAPI(record: CallRecord): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      const baseUrl = import.meta.env.VITE_API_27INFINITY_IN || 'http://localhost:4000/dev';

      const response = await fetch(`${baseUrl}/v2/call/history`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-api-key': import.meta.env.VITE_API_KEY || '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      console.log('[CallHistoryTracker] Synced to API successfully');
    } catch (error) {
      // Fail silently - localStorage will be the source of truth
      throw error;
    }
  }

  /**
   * Get call history (for display)
   */
  getCallHistory(): CallRecord[] {
    return this.getLocalRecords();
  }

  /**
   * Clear all call history
   */
  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    sessionStorage.removeItem('activeCall');
  }
}

// Export singleton instance
export const callHistoryTracker = new CallHistoryTracker();
export default callHistoryTracker;
