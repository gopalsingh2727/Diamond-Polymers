/**
 * Ringtone Utility
 * Generates ringtone sounds for incoming and outgoing calls
 */

class RingtoneManager {
  private audioContext: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    // Initialize audio context on first use
    if (typeof window !== 'undefined' && 'AudioContext' in window) {
      this.audioContext = new AudioContext();
    }
  }

  /**
   * Play incoming call ringtone (continuous ringing)
   */
  playIncomingRingtone(): void {
    if (this.isPlaying) return;

    console.log('[Ringtone] Playing incoming ringtone');
    this.isPlaying = true;

    // Play ring pattern repeatedly
    this.playRingPattern();
    this.intervalId = setInterval(() => {
      this.playRingPattern();
    }, 3000); // Ring every 3 seconds
  }

  /**
   * Play outgoing call ringtone (ringing tone while waiting)
   */
  playOutgoingRingtone(): void {
    if (this.isPlaying) return;

    console.log('[Ringtone] Playing outgoing ringtone');
    this.isPlaying = true;

    // Play beep pattern repeatedly
    this.playBeepPattern();
    this.intervalId = setInterval(() => {
      this.playBeepPattern();
    }, 4000); // Beep every 4 seconds
  }

  /**
   * Stop all ringtones
   */
  stop(): void {
    if (!this.isPlaying) return;

    console.log('[Ringtone] Stopping ringtone');
    this.isPlaying = false;

    // Clear interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Stop current oscillator
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      this.oscillator = null;
    }

    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
  }

  /**
   * Play a ring pattern (traditional phone ring sound)
   * Two quick beeps with a pause
   */
  private playRingPattern(): void {
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;

    // First ring
    this.playTone(440, 0.3, currentTime);
    this.playTone(480, 0.3, currentTime);

    // Second ring after short pause
    this.playTone(440, 0.3, currentTime + 0.4);
    this.playTone(480, 0.3, currentTime + 0.4);
  }

  /**
   * Play a beep pattern (outgoing call tone)
   */
  private playBeepPattern(): void {
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;

    // Long beep followed by pause
    this.playTone(480, 1.0, currentTime);
  }

  /**
   * Play a single tone
   * @param frequency - Frequency in Hz
   * @param duration - Duration in seconds
   * @param startTime - Start time in audio context time
   */
  private playTone(frequency: number, duration: number, startTime: number): void {
    if (!this.audioContext) return;

    try {
      // Create oscillator for tone
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Set frequency and type
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';

      // Set volume envelope (fade in/out for smoother sound)
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // Fade in
      gainNode.gain.setValueAtTime(0.3, startTime + duration - 0.05);
      gainNode.gain.linearRampToValueAtTime(0, startTime + duration); // Fade out

      // Start and stop
      oscillator.start(startTime);
      oscillator.stop(startTime + duration);

      // Store reference
      this.oscillator = oscillator;
      this.gainNode = gainNode;
    } catch (error) {
      console.error('[Ringtone] Error playing tone:', error);
    }
  }

  /**
   * Play a notification sound (for call ended, etc.)
   */
  playNotificationSound(): void {
    if (!this.audioContext) return;

    const currentTime = this.audioContext.currentTime;

    // Quick notification beep
    this.playTone(600, 0.1, currentTime);
    this.playTone(800, 0.1, currentTime + 0.15);
  }

  /**
   * Check if currently playing
   */
  isRinging(): boolean {
    return this.isPlaying;
  }
}

// Create singleton instance
const ringtoneManager = new RingtoneManager();

export default ringtoneManager;
