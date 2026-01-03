/**
 * Offline Speech Recognition Service using Vosk
 * Works without internet - perfect for firewall/VPN/corporate environments
 */

// Lazy import to avoid breaking app if vosk-browser has issues
let voskModule: any = null;
const getVosk = async () => {
  if (!voskModule) {
    voskModule = await import('vosk-browser');
  }
  return voskModule.default || voskModule;
};

// Vosk model URLs - try local bundled file first (works offline)
// Then fall back to your server (whitelisted in corporate networks)
// Finally try official source

// Helper to get the base URL for local files
const getBaseUrl = (): string => {
  // In Electron with Vite, files are served from the origin
  if (typeof window !== 'undefined' && window.location) {
    // For Electron dev mode (localhost:5173) or production
    return window.location.origin;
  }
  return '';
};

// English model sources - CDN first for faster app startup (models not bundled)
const getEnglishModelUrls = (): string[] => {
  return [
  'https://27infinity.in/assets/vosk-model-small-en-us-0.15.zip', // Your server (whitelisted)
  'https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip' // Official backup
  ];
};

// Hindi model sources - CDN first for faster app startup (models not bundled)
const getHindiModelUrls = (): string[] => {
  return [
  'https://27infinity.in/assets/vosk-model-small-hi-0.22.zip', // Your server (whitelisted)
  'https://alphacephei.com/vosk/models/vosk-model-small-hi-0.22.zip' // Official backup
  ];
};

// Current language setting
let currentLanguage: 'en' | 'hi' = 'en';

let model: any = null;
let recognizer: any = null;
let mediaRecorder: MediaRecorder | null = null;
let audioContext: AudioContext | null = null;
let isInitialized = false;
let isRecording = false;

// Callbacks
let onResultCallback: ((text: string) => void) | null = null;
let onErrorCallback: ((error: string) => void) | null = null;
let onStartCallback: (() => void) | null = null;
let onEndCallback: (() => void) | null = null;

/**
 * Set language for speech recognition
 */
export const setLanguage = (language: 'en' | 'hi'): void => {
  if (currentLanguage !== language) {
    currentLanguage = language;
    // Reset initialization to load new model
    isInitialized = false;
    model = null;
    recognizer = null;

  }
};

/**
 * Get current language
 */
export const getLanguage = (): 'en' | 'hi' => currentLanguage;

/**
 * Initialize Vosk model (download once, cached in browser)
 * Tries multiple sources: local file, your server, then official source
 */
export const initializeOfflineSpeech = async (language?: 'en' | 'hi'): Promise<boolean> => {
  // Set language if provided
  if (language) {
    setLanguage(language);
  }

  if (isInitialized && model) {

    return true;
  }

  const langName = currentLanguage === 'hi' ? 'Hindi' : 'English';


  // Get URLs for current language (local bundled first, then remote sources)
  const urlsToTry = currentLanguage === 'hi' ? getHindiModelUrls() : getEnglishModelUrls();
  let lastError: any = null;



  for (const url of urlsToTry) {
    try {


      // Create model from URL (cached in IndexedDB)
      const vosk = await getVosk();
      model = await vosk.createModel(url);

      // Create recognizer with sample rate
      recognizer = new model.KaldiRecognizer(16000);

      // Set up result handler
      recognizer.on('result', (message: any) => {
        const result = message.result;
        if (result && result.text && result.text.trim()) {

          if (onResultCallback) {
            onResultCallback(result.text);
          }
        }
      });

      recognizer.on('partialresult', (message: any) => {

      });

      isInitialized = true;

      return true;
    } catch (error: any) {

      lastError = error;
      // Continue to next URL
    }
  }

  // All sources failed


  // Provide helpful error message
  let errorMessage = 'Failed to load speech model.\n\n';

  if (lastError?.message?.includes('fetch') || lastError?.message?.includes('network')) {
    errorMessage += 'Network error - please check your connection.\n\n';
    errorMessage += 'The model should be in the public folder:\n';
    errorMessage += currentLanguage === 'hi' ?
    '• vosk-model-small-hi-0.22.zip' :
    '• vosk-model-small-en-us-0.15.zip';
  } else if (lastError?.message?.includes('404') || lastError?.message?.includes('Not Found')) {
    errorMessage += 'Model file not found.\n\n';
    errorMessage += 'Please ensure the voice model is in the public folder.';
  } else {
    errorMessage += `Error: ${lastError?.message || 'Unknown error'}\n\n`;
    errorMessage += 'Try loading the model from Chat Settings.';
  }

  if (onErrorCallback) {
    onErrorCallback(errorMessage);
  }
  return false;
};

/**
 * Start recording and transcribing
 */
export const startRecording = async (): Promise<boolean> => {
  if (!isInitialized) {
    const success = await initializeOfflineSpeech();
    if (!success) return false;
  }

  if (isRecording) {

    return true;
  }

  try {
    // Get microphone stream
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        channelCount: 1,
        sampleRate: 16000,
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    // Create audio context for processing
    audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(stream);

    // Create script processor for audio data
    const processor = audioContext.createScriptProcessor(4096, 1, 1);

    processor.onaudioprocess = (e) => {
      if (recognizer && isRecording) {
        const inputData = e.inputBuffer.getChannelData(0);
        // Convert float32 to int16
        const int16Data = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          int16Data[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768));
        }
        recognizer.acceptWaveform(int16Data);
      }
    };

    source.connect(processor);
    processor.connect(audioContext.destination);

    isRecording = true;


    if (onStartCallback) {
      onStartCallback();
    }

    return true;
  } catch (error: any) {

    if (onErrorCallback) {
      onErrorCallback('Failed to access microphone: ' + error.message);
    }
    return false;
  }
};

/**
 * Stop recording
 */
export const stopRecording = (): void => {
  if (!isRecording) return;

  isRecording = false;

  // Close audio context
  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  // Get final result
  if (recognizer) {
    recognizer.retrieveFinalResult();
  }



  if (onEndCallback) {
    onEndCallback();
  }
};

/**
 * Set callbacks
 */
export const setCallbacks = (callbacks: {
  onResult?: (text: string) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onEnd?: () => void;
}) => {
  if (callbacks.onResult) onResultCallback = callbacks.onResult;
  if (callbacks.onError) onErrorCallback = callbacks.onError;
  if (callbacks.onStart) onStartCallback = callbacks.onStart;
  if (callbacks.onEnd) onEndCallback = callbacks.onEnd;
};

/**
 * Check if Vosk is available
 */
export const isVoskAvailable = (): boolean => {
  return typeof AudioContext !== 'undefined' &&
  typeof navigator.mediaDevices !== 'undefined';
};

/**
 * Get initialization status
 */
export const getStatus = () => ({
  isInitialized,
  isRecording,
  hasModel: !!model
});

export default {
  initializeOfflineSpeech,
  startRecording,
  stopRecording,
  setCallbacks,
  isVoskAvailable,
  getStatus,
  setLanguage,
  getLanguage
};