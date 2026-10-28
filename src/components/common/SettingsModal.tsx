import React, { useState } from 'react';
import { Settings, Volume2, RotateCcw, AlertTriangle, X, Check, Eye } from 'lucide-react';
import { speechService } from '../../services/speechService';
import { progressService } from '../../services/progressService';
import { VoiceSettings } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProgressReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onProgressReset,
}) => {
  const [voiceSettings, setVoiceSettings] = useState<VoiceSettings>(speechService.getSettings());
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const voices = speechService.getVoices();

  if (!isOpen) return null;

  const handleToggleVoice = (enabled: boolean) => {
    speechService.updateSettings({ enabled });
    setVoiceSettings(prev => ({ ...prev, enabled }));
  };

  const handleRateChange = (rate: number) => {
    speechService.updateSettings({ speechRate: rate });
    setVoiceSettings(prev => ({ ...prev, speechRate: rate }));
  };

  const handleVoiceChange = (voiceURI: string) => {
    speechService.updateSettings({ selectedVoiceURI: voiceURI });
    setVoiceSettings(prev => ({ ...prev, selectedVoiceURI: voiceURI }));
  };

  const handleResetProgress = () => {
    progressService.resetProgress();
    setShowResetConfirm(false);
    onProgressReset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-surface w-full max-w-md rounded-2xl shadow-elevated border border-app-border overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-app-border flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-primary-blue" />
            <h2 className="text-sm font-bold text-text-main">Learning Lab Preferences</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-text-main rounded-md hover:bg-slate-200/60"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-5 space-y-5 text-xs">
          {/* Voice Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text-main flex items-center space-x-1.5">
                <Volume2 className="w-4 h-4 text-primary-blue" />
                <span>Web Speech Narration</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={voiceSettings.enabled}
                  onChange={e => handleToggleVoice(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-blue"></div>
              </label>
            </div>

            {voiceSettings.enabled && (
              <div className="space-y-2.5 pt-1 pl-6">
                <div>
                  <label className="text-[11px] text-text-muted block mb-1">Narration Speed ({voiceSettings.speechRate}x)</label>
                  <input
                    type="range"
                    min="0.75"
                    max="1.5"
                    step="0.05"
                    value={voiceSettings.speechRate}
                    onChange={e => handleRateChange(parseFloat(e.target.value))}
                    className="w-full accent-primary-blue cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>0.75x</span>
                    <span>1.0x</span>
                    <span>1.5x</span>
                  </div>
                </div>

                {voices.length > 0 && (
                  <div>
                    <label className="text-[11px] text-text-muted block mb-1">Synthesizer Voice</label>
                    <select
                      value={voiceSettings.selectedVoiceURI}
                      onChange={e => handleVoiceChange(e.target.value)}
                      className="w-full text-xs p-2 bg-slate-50 border border-app-border rounded-lg"
                    >
                      {voices.map(v => (
                        <option key={v.voiceURI} value={v.voiceURI}>
                          {v.name} ({v.lang})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-app-border pt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-text-main flex items-center space-x-1.5">
                <Eye className="w-4 h-4 text-slate-500" />
                <span>Reduced Motion Animations</span>
              </span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={e => setReducedMotion(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-blue"></div>
              </label>
            </div>
            <p className="text-[11px] text-text-muted mt-1 pl-6">
              Simplifies 3D camera transitions and UI motions for students sensitive to motion.
            </p>
          </div>

          {/* Reset Learning Progress */}
          <div className="border-t border-app-border pt-4">
            {!showResetConfirm ? (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 text-red-600 bg-red-50 border border-red-200 rounded-xl hover:bg-red-100 transition-colors font-medium"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset All Learning Progress</span>
              </button>
            ) : (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2.5">
                <div className="flex items-start space-x-2 text-red-700">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-[11px] font-medium leading-relaxed">
                    Are you sure? This will clear your completed lessons, quiz scores, points, and custom flashcards. This cannot be undone.
                  </p>
                </div>
                <div className="flex items-center space-x-2 justify-end pt-1">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleResetProgress}
                    className="px-3 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-app-border flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary-blue text-white rounded-lg hover:bg-blue-600 text-xs font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
