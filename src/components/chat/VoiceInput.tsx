/**
 * VoiceInput - Microphone button with speech recognition
 * Supports both online (Web Speech API) and offline (Vosk) modes
 * Works behind firewalls, VPNs, and corporate networks
 */

import React, { useRef, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import offlineSpeech from '../../services/offlineSpeech';

interface RootState {
  chat: {
    settings: {
      useOfflineVoice?: boolean;
    } | null;
  };
}

interface VoiceInputProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  onResult: (text: string) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({
  isListening,
  onStart,
  onStop,
  onResult
}) => {
  // Get offline voice setting from Redux
  const settings = useSelector((state: RootState) => state.chat.settings);
  const useOfflineVoiceSetting = settings?.useOfflineVoice ?? false;

  const recognitionRef = useRef<any>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [isSupported, setIsSupported] = useState(true);
  const [useOfflineMode, setUseOfflineMode] = useState(useOfflineVoiceSetting);
  const [isInitializingOffline, setIsInitializingOffline] = useState(false);
  const [speechLanguage, setSpeechLanguage] = useState<'en' | 'hi'>('en');
  const [shouldAutoStartAfterInit, setShouldAutoStartAfterInit] = useState(false);

  // Sync offline mode with settings
  useEffect(() => {
    if (useOfflineVoiceSetting && !useOfflineMode) {
      setUseOfflineMode(true);
    }
  }, [useOfflineVoiceSetting, useOfflineMode]);

  // Use refs for callbacks to prevent useEffect re-runs
  const onResultRef = useRef(onResult);
  const onStopRef = useRef(onStop);

  // Update refs when callbacks change
  useEffect(() => {
    onResultRef.current = onResult;
    onStopRef.current = onStop;
  }, [onResult, onStop]);

  // Check and request microphone permission
  const checkMicrophonePermission = async (): Promise<boolean> => {
    try {
      // First check if we can query permission status
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');

        // Listen for permission changes
        result.onchange = () => {
          setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
        };

        if (result.state === 'granted') {
          return true;
        }
      }

      // Request permission by accessing the microphone
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Stop all tracks after getting permission
      stream.getTracks().forEach(track => track.stop());

      setPermissionStatus('granted');
      return true;
    } catch (error: any) {
      console.error('Microphone permission error:', error);

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        alert('Microphone access denied. Please allow microphone access in your browser/system settings to use voice input.');
      } else if (error.name === 'NotFoundError') {
        alert('No microphone found. Please connect a microphone and try again.');
      } else {
        alert('Could not access microphone: ' + error.message);
      }

      return false;
    }
  };

  useEffect(() => {
    // Check if speech recognition is available
    const SpeechRecognition = (window as any).SpeechRecognition ||
                              (window as any).webkitSpeechRecognition;

    console.log('Initializing speech recognition, available:', !!SpeechRecognition);

    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this environment');
      setIsSupported(false);
      return;
    }

    try {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = speechLanguage === 'hi' ? 'hi-IN' : 'en-IN'; // Hindi or English

      recognitionRef.current.onresult = (event: any) => {
        console.log('Speech recognition result:', event.results[0][0].transcript);
        const transcript = event.results[0][0].transcript;
        onResultRef.current(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        if (event.error === 'not-allowed') {
          setPermissionStatus('denied');
          alert('Microphone access was denied. Please enable it in your browser settings.');
        } else if (event.error === 'no-speech') {
          // User didn't speak - not an error to show
          console.log('No speech detected');
        } else if (event.error === 'network') {
          console.log('Network error detected, switching to offline mode...');
          setUseOfflineMode(true);
          setShouldAutoStartAfterInit(true); // Auto-start after initialization
          alert('Network blocked. Switching to offline mode.\n\nPlease wait while the voice model loads, then try again.');
        } else if (event.error === 'aborted') {
          console.log('Speech recognition aborted');
        }

        onStopRef.current();
      };

      recognitionRef.current.onstart = () => {
        console.log('Speech recognition started successfully');
      };

      recognitionRef.current.onspeechstart = () => {
        console.log('Speech detected - user is speaking');
      };

      recognitionRef.current.onspeechend = () => {
        console.log('Speech ended - processing...');
      };

      recognitionRef.current.onaudiostart = () => {
        console.log('Audio capture started');
      };

      recognitionRef.current.onaudioend = () => {
        console.log('Audio capture ended');
      };

      recognitionRef.current.onend = () => {
        console.log('Speech recognition session ended');
        onStopRef.current();
      };

      setIsSupported(true);
      console.log('Speech recognition initialized successfully');
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      setIsSupported(false);
    }

    // Check initial permission status
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then(result => {
          console.log('Initial microphone permission:', result.state);
          setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
        })
        .catch((err) => {
          console.log('Could not query microphone permission:', err);
          setPermissionStatus('unknown');
        });
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speechLanguage]); // Reinitialize when language changes

  // Debug: log isListening changes and stop recognition when turned off externally
  useEffect(() => {
    console.log('VoiceInput isListening changed to:', isListening);

    // If isListening was turned off externally (e.g., chat closed), stop the recognition
    if (!isListening) {
      if (useOfflineMode) {
        offlineSpeech.stopRecording();
      } else if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors when stopping
        }
      }
    }
  }, [isListening, useOfflineMode]);

  // Initialize offline mode when enabled
  useEffect(() => {
    if (useOfflineMode && !isInitializingOffline) {
      setIsInitializingOffline(true);

      offlineSpeech.setCallbacks({
        onResult: (text) => {
          console.log('Offline speech result:', text);
          onResultRef.current(text);
        },
        onError: (error) => {
          console.error('Offline speech error:', error);
          alert(error);
          onStopRef.current();
        },
        onStart: () => {
          console.log('Offline speech started');
        },
        onEnd: () => {
          console.log('Offline speech ended');
          onStopRef.current();
        }
      });

      offlineSpeech.initializeOfflineSpeech(speechLanguage).then(async (success) => {
        setIsInitializingOffline(false);
        if (success) {
          console.log(`Offline mode ready (${speechLanguage === 'hi' ? 'Hindi' : 'English'})`);

          // Auto-start recording if we switched due to network error
          if (shouldAutoStartAfterInit) {
            setShouldAutoStartAfterInit(false);
            console.log('Auto-starting recording in offline mode...');
            onStart();
            const recordingSuccess = await offlineSpeech.startRecording();
            if (!recordingSuccess) {
              onStopRef.current();
            }
          }
        } else {
          setShouldAutoStartAfterInit(false);
        }
      });
    }
  }, [useOfflineMode, isInitializingOffline, speechLanguage, shouldAutoStartAfterInit, onStart]);

  const toggleListening = async () => {
    console.log('toggleListening called, isSupported:', isSupported, 'isListening:', isListening, 'offlineMode:', useOfflineMode);

    if (isListening) {
      // Stop listening
      console.log('Stopping speech recognition...');
      if (useOfflineMode) {
        offlineSpeech.stopRecording();
      } else {
        try {
          recognitionRef.current?.stop();
        } catch (e) {
          console.log('Error stopping:', e);
        }
      }
      onStop();
      return;
    }

    // Check if initializing offline mode
    if (isInitializingOffline) {
      alert('Please wait, initializing offline speech recognition...');
      return;
    }

    // Use offline mode if enabled
    if (useOfflineMode) {
      console.log('Using offline speech recognition (Vosk)...');
      onStart();
      const success = await offlineSpeech.startRecording();
      if (!success) {
        onStop();
      }
      return;
    }

    // Online mode - Web Speech API
    if (!isSupported) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
      return;
    }

    if (!recognitionRef.current) {
      console.error('Recognition ref is null');
      alert('Speech recognition is not available. Please refresh the page.');
      return;
    }

    // Always request microphone permission to ensure it's active
    console.log('Requesting microphone permission...');
    const hasPermission = await checkMicrophonePermission();
    if (!hasPermission) {
      console.log('Permission denied');
      return;
    }
    console.log('Permission granted, starting recognition...');

    try {
      console.log('Starting speech recognition (online mode)...');
      // Show animation immediately
      onStart();
      recognitionRef.current.start();
    } catch (error: any) {
      console.error('Failed to start speech recognition:', error);
      if (error.message?.includes('already started') || error.name === 'InvalidStateError') {
        // Already running, try stopping and restarting
        console.log('Already running, restarting...');
        try {
          recognitionRef.current.stop();
          setTimeout(() => {
            onStart();
            recognitionRef.current.start();
          }, 100);
        } catch (e) {
          console.error('Restart failed:', e);
          onStop();
        }
      } else {
        alert('Failed to start voice input: ' + error.message);
        onStop();
      }
    }
  };

  // Get button style based on state
  const getButtonStyle = () => {
    if (isInitializingOffline) {
      return 'bg-blue-100 animate-pulse';
    }
    if (!isSupported && !useOfflineMode) {
      return 'bg-gray-300 cursor-not-allowed';
    }
    if (isListening) {
      return ''; // Custom style will be applied via inline styles
    }
    if (permissionStatus === 'denied') {
      return 'bg-yellow-100 hover:bg-yellow-200';
    }
    if (useOfflineMode) {
      return 'bg-green-100 hover:bg-green-200'; // Green to indicate offline mode
    }
    return 'bg-gray-100 hover:bg-gray-200';
  };

  // Get title based on state
  const getTitle = () => {
    if (isInitializingOffline) {
      return 'Downloading offline speech model...';
    }
    if (!isSupported && !useOfflineMode) {
      return 'Speech recognition not supported';
    }
    if (isListening) {
      return useOfflineMode ? 'Stop listening (Offline Mode)' : 'Stop listening';
    }
    if (permissionStatus === 'denied') {
      return 'Microphone access denied - Click to retry';
    }
    if (useOfflineMode) {
      return 'Start voice input (Offline Mode - No internet needed)';
    }
    return 'Start voice input';
  };

  const toggleLanguage = () => {
    if (isListening) return; // Don't change while recording
    const newLang = speechLanguage === 'en' ? 'hi' : 'en';
    setSpeechLanguage(newLang);
    // Reset offline mode to reload model with new language
    if (useOfflineMode) {
      offlineSpeech.setLanguage(newLang);
    }
    console.log(`Language switched to: ${newLang === 'hi' ? 'Hindi' : 'English'}`);
  };

  const handleClick = () => {
    console.log('Microphone button clicked, isSupported:', isSupported, 'permissionStatus:', permissionStatus);
    toggleListening();
  };

  return (
    <div className="flex items-center gap-1">
      {/* Language toggle button */}
      <button
        onClick={toggleLanguage}
        disabled={isListening || isInitializingOffline}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    transition-all ${isListening ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-200'}
                    ${speechLanguage === 'hi' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}
        title={`Switch to ${speechLanguage === 'en' ? 'Hindi' : 'English'}`}
        type="button"
      >
        {speechLanguage === 'hi' ? 'हि' : 'EN'}
      </button>

      {/* Microphone button */}
      <button
        onClick={handleClick}
        className={`w-10 h-10 rounded-full flex items-center justify-center
                    transition-all ${getButtonStyle()}`}
        style={isListening ? {
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)',
          boxShadow: '0 0 0 0 rgba(255, 107, 0, 0.7)',
          animation: 'pulse-orange 1.5s infinite',
          transform: 'scale(1.1)'
        } : undefined}
        title={getTitle()}
        type="button"
      >
        {permissionStatus === 'denied' ? (
          // Show warning icon when permission denied
          <svg
            className="w-5 h-5 text-yellow-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        ) : (
          // Normal microphone icon
          <svg
            className={`w-5 h-5 ${isListening ? 'text-white' : 'text-gray-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </button>
    </div>
  );
};

export default VoiceInput;
