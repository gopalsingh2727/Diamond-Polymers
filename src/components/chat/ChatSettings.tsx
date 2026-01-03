/**
 * ChatSettings - Settings modal for chat configuration
 */

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateChatSettings, acceptChatRules } from '../../componest/redux/chat/chatActions';
import { updateSettingsLocal } from '../../componest/redux/chat/chatSlice';
import offlineSpeech from '../../services/offlineSpeech';

interface ChatSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

interface RootState {
  chat: {
    settings: any;
  };
}

const ChatSettings: React.FC<ChatSettingsProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { settings } = useSelector((state: RootState) => state.chat);

  const [formData, setFormData] = useState({
    assistantName: '',
    voiceGender: 'female',
    language: 'en-IN',
    autoSpeak: true,
    speechRate: 1,
    isEnabled: true,
    useOfflineVoice: false
  });

  const [saving, setSaving] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelStatus, setModelStatus] = useState<{
    english: 'not_loaded' | 'loading' | 'loaded' | 'error';
    hindi: 'not_loaded' | 'loading' | 'loaded' | 'error';
  }>({ english: 'not_loaded', hindi: 'not_loaded' });

  useEffect(() => {
    if (settings) {
      setFormData({
        assistantName: settings.assistantName || 'Assistant',
        voiceGender: settings.voiceGender || 'female',
        language: settings.language || 'en-IN',
        autoSpeak: settings.autoSpeak ?? true,
        speechRate: settings.speechRate || 1,
        isEnabled: settings.isEnabled ?? true,
        useOfflineVoice: settings.useOfflineVoice ?? false
      });
    }
  }, [settings]);

  // Check model status on open
  useEffect(() => {
    if (isOpen) {
      const status = offlineSpeech.getStatus();
      if (status.isInitialized && status.hasModel) {
        const currentLang = offlineSpeech.getLanguage();
        setModelStatus((prev) => ({
          ...prev,
          [currentLang === 'en' ? 'english' : 'hindi']: 'loaded'
        }));
      }
    }
  }, [isOpen]);

  const handleLoadModel = async (language: 'en' | 'hi') => {
    const key = language === 'en' ? 'english' : 'hindi';
    setModelStatus((prev) => ({ ...prev, [key]: 'loading' }));
    setLoadingModels(true);

    try {
      const success = await offlineSpeech.initializeOfflineSpeech(language);
      setModelStatus((prev) => ({
        ...prev,
        [key]: success ? 'loaded' : 'error'
      }));
    } catch (error) {

      setModelStatus((prev) => ({ ...prev, [key]: 'error' }));
    }

    setLoadingModels(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await dispatch(updateChatSettings(formData) as any);
    setSaving(false);

    if (result.success) {
      onClose();
    }
  };

  const handleAcceptRules = async () => {
    await dispatch(acceptChatRules() as any);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-96 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div
          className="px-6 py-4 border-b"
          style={{
            background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)'
          }}>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Chat Settings</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30
                         flex items-center justify-center transition-colors">


              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Enable Chat */}
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">Enable Chat Agent</label>
            <button
              onClick={() => setFormData({ ...formData, isEnabled: !formData.isEnabled })}
              className={`w-12 h-6 rounded-full transition-colors ${
              formData.isEnabled ? 'bg-orange-500' : 'bg-gray-300'}`
              }>

              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                formData.isEnabled ? 'translate-x-6' : 'translate-x-0.5'}`
                } />

            </button>
          </div>

          {/* Assistant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assistant Name
            </label>
            <input
              type="text"
              value={formData.assistantName}
              onChange={(e) => setFormData({ ...formData, assistantName: e.target.value })}
              placeholder="e.g., KALESHI, RIYA, ARJUN"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg
                         focus:outline-none focus:border-orange-400 focus:ring-2
                         focus:ring-orange-100" />



          </div>

          {/* Voice Gender */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Voice Gender
            </label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, voiceGender: 'female' })}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.voiceGender === 'female' ?
                'border-orange-500 bg-orange-50 text-orange-700' :
                'border-gray-200 text-gray-600 hover:border-gray-300'}`
                }>

                Girl
              </button>
              <button
                onClick={() => setFormData({ ...formData, voiceGender: 'male' })}
                className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${
                formData.voiceGender === 'male' ?
                'border-orange-500 bg-orange-50 text-orange-700' :
                'border-gray-200 text-gray-600 hover:border-gray-300'}`
                }>

                Boy
              </button>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg
                         focus:outline-none focus:border-orange-400">


              <option value="en-IN">English (India)</option>
              <option value="hi-IN">Hindi</option>
              <option value="en-US">English (US)</option>
            </select>
          </div>

          {/* Auto Speak */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Auto-speak responses</label>
              <p className="text-xs text-gray-500">
                {formData.autoSpeak ? 'ON - Speaks all responses' : 'OFF - Silent mode'}
              </p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, autoSpeak: !formData.autoSpeak })}
              className={`w-12 h-6 rounded-full transition-colors ${
              formData.autoSpeak ? 'bg-orange-500' : 'bg-gray-300'}`
              }>

              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                formData.autoSpeak ? 'translate-x-6' : 'translate-x-0.5'}`
                } />

            </button>
          </div>

          {/* Speech Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Speech Speed: {formData.speechRate}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={formData.speechRate}
              onChange={(e) => setFormData({ ...formData, speechRate: parseFloat(e.target.value) })}
              className="w-full accent-orange-500" />

          </div>

          {/* Use Offline Voice */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-700">Use Offline Voice</label>
              <p className="text-xs text-gray-500">Works behind firewalls/VPNs</p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, useOfflineVoice: !formData.useOfflineVoice })}
              className={`w-12 h-6 rounded-full transition-colors ${
              formData.useOfflineVoice ? 'bg-orange-500' : 'bg-gray-300'}`
              }>

              <div
                className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                formData.useOfflineVoice ? 'translate-x-6' : 'translate-x-0.5'}`
                } />

            </button>
          </div>

          {/* Offline Voice Models */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Offline Voice Input Models
            </label>
            <p className="text-xs text-gray-500 mb-3">
              {formData.useOfflineVoice ?
              'Load voice models for offline use (required for voice input)' :
              'Load voice models for offline use (works without internet)'}
            </p>

            {/* English Model */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">English</span>
                {modelStatus.english === 'loaded' &&
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Ready</span>
                }
                {modelStatus.english === 'loading' &&
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded animate-pulse">Loading...</span>
                }
                {modelStatus.english === 'error' &&
                <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">Error</span>
                }
              </div>
              <button
                onClick={() => handleLoadModel('en')}
                disabled={loadingModels || modelStatus.english === 'loaded'}
                className={`px-3 py-1 text-sm rounded-lg transition-all ${
                modelStatus.english === 'loaded' ?
                'bg-green-100 text-green-700 cursor-default' :
                'bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50'}`
                }>

                {modelStatus.english === 'loaded' ? '✓ Loaded' : 'Load'}
              </button>
            </div>

            {/* Hindi Model */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Hindi (हिंदी)</span>
                {modelStatus.hindi === 'loaded' &&
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Ready</span>
                }
                {modelStatus.hindi === 'loading' &&
                <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded animate-pulse">Loading...</span>
                }
                {modelStatus.hindi === 'error' &&
                <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded">Error</span>
                }
              </div>
              <button
                onClick={() => handleLoadModel('hi')}
                disabled={loadingModels || modelStatus.hindi === 'loaded'}
                className={`px-3 py-1 text-sm rounded-lg transition-all ${
                modelStatus.hindi === 'loaded' ?
                'bg-green-100 text-green-700 cursor-default' :
                'bg-orange-100 text-orange-700 hover:bg-orange-200 disabled:opacity-50'}`
                }>

                {modelStatus.hindi === 'loaded' ? '✓ Loaded' : 'Load'}
              </button>
            </div>
          </div>

          {/* Rules acceptance */}
          {settings && !settings.rulesAccepted &&
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800 mb-2">
                Please accept the usage rules to continue.
              </p>
              <button
              onClick={handleAcceptRules}
              className="text-sm text-orange-600 font-medium hover:underline">

                View and Accept Rules
              </button>
            </div>
          }
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">

            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg text-white font-medium
                       transition-all disabled:opacity-50"

            style={{
              background: 'linear-gradient(135deg, #FF6B00 0%, #FF8C00 100%)'
            }}>

            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>);

};

export default ChatSettings;