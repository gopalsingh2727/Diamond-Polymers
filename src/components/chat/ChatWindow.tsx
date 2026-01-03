/**
 * ChatWindow - Main chat interface with orange theme
 */

import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { sendChatMessage } from '../../componest/redux/chat/chatActions';
import ChatMessage from './ChatMessage';
import VoiceInput from './VoiceInput';

interface ChatWindowProps {
  isMinimized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  onDragStart: (e: React.MouseEvent) => void;
  isDragging: boolean;
  assistantName: string;
  voiceGender: 'male' | 'female';
}

interface RootState {
  chat: {
    messages: any[];
    isSending: boolean;
    error: string | null;
    settings: any;
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  isMinimized,
  onClose,
  onMinimize,
  onMaximize,
  onDragStart,
  isDragging,
  assistantName,
  voiceGender
}) => {
  const dispatch = useDispatch();
  const { messages, isSending, error, settings } = useSelector(
    (state: RootState) => state.chat
  );

  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [messageHistory, setMessageHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle close - stop mic and speech first
  const handleClose = () => {
    // Stop speech recognition if active
    if (isListening) {
      setIsListening(false);
    }

    // Stop speech synthesis if active
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }

    // Call the parent close handler
    onClose();
  };

  // Cleanup on unmount - stop all audio
  useEffect(() => {
    return () => {
      // Stop speech synthesis on unmount
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
    };
  }, []);

  // Load available voices for text-to-speech
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    // Load voices immediately
    loadVoices();

    // Also listen for voiceschanged event (needed for some browsers)
    if ('speechSynthesis' in window) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if ('speechSynthesis' in window) {
        speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (!isMinimized) {
      inputRef.current?.focus();
    }
  }, [isMinimized]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;

    const message = inputValue.trim();

    // Add to message history
    setMessageHistory((prev) => [...prev, message]);
    setHistoryIndex(-1);
    setInputValue('');

    const result = await dispatch(sendChatMessage(message) as any);

    // Speak response if auto-speak is enabled
    if (result?.success && result.response && settings?.autoSpeak) {
      speakText(result.response);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // IMPORTANT: Stop propagation to prevent affecting menu and other components
    e.stopPropagation();

    // Enter key - send message
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }

    // Up arrow - navigate backwards through history (older messages)
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (messageHistory.length === 0) return;

      const newIndex = historyIndex === -1 ?
      messageHistory.length - 1 :
      Math.max(0, historyIndex - 1);

      setHistoryIndex(newIndex);
      setInputValue(messageHistory[newIndex]);
      return;
    }

    // Down arrow - navigate forwards through history (newer messages)
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const newIndex = historyIndex + 1;

      if (newIndex >= messageHistory.length) {
        setHistoryIndex(-1);
        setInputValue('');
      } else {
        setHistoryIndex(newIndex);
        setInputValue(messageHistory[newIndex]);
      }
      return;
    }

    // Escape key - clear input
    if (e.key === 'Escape') {
      e.preventDefault();
      setInputValue('');
      setHistoryIndex(-1);
      return;
    }
  };

  const handleVoiceResult = async (text: string) => {
    setIsListening(false);
    if (!text.trim()) return;

    // Show the text in input first
    setInputValue(text);

    // Auto-send voice input after a short delay
    setTimeout(async () => {
      setInputValue('');
      const result = await dispatch(sendChatMessage(text) as any);

      // Always speak the response for voice input
      if (result?.success && result.response) {
        speakText(result.response);
      }
    }, 300);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {

      return;
    }

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    // Clean text for speech (remove markdown, excessive punctuation)
    const cleanText = text.
    replace(/[#*_`]/g, '').
    replace(/\n+/g, '. ').
    replace(/•/g, '').
    trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = settings?.language || 'en-IN';
    utterance.rate = settings?.speechRate || 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Select voice based on gender preference
    if (voices.length > 0) {
      // Try to find a matching voice
      let selectedVoice = voices.find((v) => {
        const name = v.name.toLowerCase();
        if (voiceGender === 'female') {
          return name.includes('female') ||
          name.includes('swara') ||
          name.includes('veena') ||
          name.includes('samantha') ||
          name.includes('karen');
        } else {
          return name.includes('male') ||
          name.includes('ravi') ||
          name.includes('alex') ||
          name.includes('daniel');
        }
      });

      // Fallback: find any voice for the language
      if (!selectedVoice) {
        const langCode = (settings?.language || 'en-IN').split('-')[0];
        selectedVoice = voices.find((v) => v.lang.startsWith(langCode));
      }

      // Fallback: use first available voice
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }

    // Track speaking state
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {

      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Minimized view
  if (isMinimized) {
    return (
      <div
        onClick={onMaximize}
        className="w-64 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg
                   shadow-lg cursor-pointer hover:shadow-xl transition-all p-3
                   flex items-center gap-3">



        <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <span className="text-white font-medium">{assistantName}</span>
      </div>);

  }

  return (
    <div className="w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden">
      {/* Header - Draggable */}
      <div
        onMouseDown={onDragStart}
        className={`flex items-center justify-between px-4 py-3 cursor-grab
                   ${isDragging ? 'cursor-grabbing' : ''}`}
        style={{
          background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)'
        }}>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-semibold">{assistantName}</h3>
            <span className="text-white/70 text-xs">
              {isSending ? 'Typing...' : 'Online'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-20">
          {/* Minimize button */}
          <button
            type="button"
            onClick={(e) => {e.stopPropagation();e.preventDefault();onMinimize();}}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30
                       flex items-center justify-center transition-colors cursor-pointer">


            <svg className="w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>

          {/* Close button */}
          <button
            type="button"
            onClick={(e) => {e.stopPropagation();e.preventDefault();handleClose();}}
            onMouseDown={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-full bg-white/20 hover:bg-red-500
                       flex items-center justify-center transition-colors cursor-pointer">


            <svg className="w-4 h-4 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ?
        <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-3">👋</div>
            <p className="font-medium text-lg text-gray-700">Hi there! I'm {assistantName}</p>
            <p className="text-sm mt-2 text-gray-500">Your friendly manufacturing assistant</p>
            <div className="mt-6 bg-orange-50 rounded-lg p-4 mx-2">
              <p className="text-sm font-medium text-orange-700 mb-3">What can I help you with?</p>
              <div className="text-xs text-gray-600 space-y-2 text-left">
                <p>💬 Just say <span className="text-orange-500 font-medium">"Hi"</span> to start chatting</p>
                <p>📦 Type an <span className="text-orange-500 font-medium">Order ID</span> for order details</p>
                <p>🏭 Type a <span className="text-orange-500 font-medium">Machine name</span> for status</p>
                <p>👤 Type an <span className="text-orange-500 font-medium">Operator name</span> for activity</p>
                <p>📊 Say <span className="text-orange-500 font-medium">"report"</span> for daily summary</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-4">Type <span className="font-mono bg-gray-100 px-1 rounded">/help</span> for all commands</p>
          </div> :

        messages.map((msg, index) =>
        <ChatMessage
          key={index}
          role={msg.role}
          content={msg.content}
          timestamp={msg.timestamp}
          assistantName={assistantName} />

        )
        }
        <div ref={messagesEndRef} />
      </div>

      {/* Error display */}
      {error &&
      <div className="px-4 py-2 bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      }

      {/* Input Area */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">
          {/* Stop speaker button - shows when speaking */}
          {isSpeaking &&
          <button
            onClick={stopSpeaking}
            className="w-10 h-10 rounded-full flex items-center justify-center
                         bg-red-500 hover:bg-red-600 transition-all animate-pulse"

            title="Stop speaking"
            type="button">

              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            </button>
          }

          {/* Voice input button */}
          <VoiceInput
            isListening={isListening}
            onStart={() => setIsListening(true)}
            onStop={() => setIsListening(false)}
            onResult={handleVoiceResult} />


          {/* Text input */}
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Type a message...'}
            disabled={isSending || isListening}
            className="flex-1 px-4 py-2 rounded-full border border-gray-200
                       focus:outline-none focus:border-orange-400 focus:ring-2
                       focus:ring-orange-100 text-sm disabled:bg-gray-50" />




          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            className="w-10 h-10 rounded-full flex items-center justify-center
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"

            style={{
              background: inputValue.trim() && !isSending ?
              'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)' :
              '#e5e7eb'
            }}>

            {isSending ?
            <svg className="w-5 h-5 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg> :

            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            }
          </button>
        </div>
      </div>
    </div>);

};

export default ChatWindow;