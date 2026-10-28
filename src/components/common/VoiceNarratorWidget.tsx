import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Square,
  Sparkles,
  ChevronUp,
  ChevronDown,
  Headphones,
} from 'lucide-react';
import { speechService } from '../../services/speechService';
import { VoiceSettings } from '../../types';

export const VoiceNarratorWidget: React.FC = () => {
  const [caption, setCaption] = useState<string>('');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [settings, setSettings] = useState<VoiceSettings>(speechService.getSettings());
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const unsubscribe = speechService.subscribe((newCaption, speaking) => {
      setCaption(newCaption);
      setIsSpeaking(speaking);
    });

    setVoices(speechService.getVoices());

    return () => {
      unsubscribe();
    };
  }, []);

  const handleToggleMute = () => {
    const nextEnabled = !settings.enabled;
    speechService.updateSettings({ enabled: nextEnabled });
    setSettings(prev => ({ ...prev, enabled: nextEnabled }));
  };

  const handleRateChange = (rate: number) => {
    speechService.updateSettings({ speechRate: rate });
    setSettings(prev => ({ ...prev, speechRate: rate }));
  };

  const handleVoiceChange = (voiceURI: string) => {
    speechService.updateSettings({ selectedVoiceURI: voiceURI });
    setSettings(prev => ({ ...prev, selectedVoiceURI: voiceURI }));
  };

  const handlePlayPause = () => {
    if (isSpeaking) {
      speechService.pause();
    } else {
      speechService.resume();
    }
  };

  const handleStop = () => {
    speechService.stop();
  };

  const handleReplay = () => {
    speechService.replay();
  };

  // If no caption has ever been played, show a welcoming introductory caption
  const displayCaption =
    caption ||
    'Welcome to OS Learning Lab. Select any simulation step or lesson to listen to interactive voice explanations and read live captions here.';

  return (
    <aside
      aria-label="Voice learning assistant"
      className="fixed bottom-4 right-4 z-40 max-w-sm sm:max-w-md w-[calc(100vw-2rem)] bg-surface/95 backdrop-blur-md border border-blue-200/80 rounded-2xl shadow-elevated transition-all overflow-hidden"
    >
      {/* Header bar */}
      <div className="px-3.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
              isSpeaking
                ? 'bg-primary-blue text-white shadow-xs animate-pulse'
                : 'bg-blue-100 text-primary-blue'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-text-main flex items-center space-x-1">
              <span>Voice Tutor</span>
              {isSpeaking && (
                <span className="flex items-center space-x-0.5 text-[10px] text-primary-blue font-mono font-normal">
                  <span className="w-1 h-3 bg-blue-500 animate-pulse rounded-full" />
                  <span className="w-1 h-2 bg-blue-500 animate-pulse delay-75 rounded-full" />
                  <span className="w-1 h-4 bg-blue-500 animate-pulse delay-150 rounded-full" />
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Mute/Unmute */}
          <button
            onClick={handleToggleMute}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              settings.enabled
                ? 'text-primary-blue hover:bg-blue-100'
                : 'text-slate-400 hover:bg-slate-100'
            }`}
            title={settings.enabled ? 'Mute voice' : 'Enable voice'}
          >
            {settings.enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Expand/Collapse Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-text-muted hover:text-text-main rounded-lg hover:bg-slate-100 transition-colors"
            title={isExpanded ? 'Minimize tutor' : 'Expand tutor'}
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-3.5 space-y-3">
          {/* Live Captions Box */}
          <div className="p-3 bg-slate-50 border border-app-border rounded-xl text-xs text-text-main leading-relaxed min-h-[58px] max-h-36 overflow-y-auto selection:bg-blue-200">
            <div className="flex items-start space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-primary-blue mt-0.5 shrink-0" />
              <p className="font-medium text-slate-700">{displayCaption}</p>
            </div>
          </div>

          {/* Playback Controls & Speed */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
            <div className="flex items-center space-x-1.5">
              <button
                onClick={handlePlayPause}
                disabled={!caption}
                className="p-1.5 bg-blue-50 text-primary-blue hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                title={isSpeaking ? 'Pause' : 'Resume'}
              >
                {isSpeaking ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={handleReplay}
                disabled={!caption}
                className="p-1.5 text-text-muted hover:text-primary-blue hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                title="Replay explanation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleStop}
                disabled={!isSpeaking}
                className="p-1.5 text-text-muted hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
                title="Stop speech"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Speech Rate Pills */}
            <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-mono">
              {[0.8, 1.0, 1.25].map(rate => (
                <button
                  key={rate}
                  onClick={() => handleRateChange(rate)}
                  className={`px-1.5 py-0.5 rounded transition-all ${
                    settings.speechRate === rate
                      ? 'bg-white text-primary-blue font-bold shadow-xs'
                      : 'text-text-muted hover:text-text-main'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>

            {/* Voice Dropdown */}
            {voices.length > 0 && (
              <select
                value={settings.selectedVoiceURI}
                onChange={e => handleVoiceChange(e.target.value)}
                className="text-[10px] text-text-muted bg-slate-50 border border-slate-200 rounded px-1.5 py-1 max-w-[110px] truncate focus:outline-hidden"
              >
                {voices.map(v => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      )}
    </aside>
  );
};
