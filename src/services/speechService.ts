import { VoiceSettings } from '../types';

export type SpeechListener = (text: string, isSpeaking: boolean) => void;

class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSupported: boolean = false;
  private listeners: Set<SpeechListener> = new Set();
  private currentCaption: string = '';
  private isSpeaking: boolean = false;
  private voices: SpeechSynthesisVoice[] = [];

  private settings: VoiceSettings = {
    enabled: true,
    speechRate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    selectedVoiceURI: '',
    autoNarrateSteps: true,
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.isSupported = true;
      this.loadVoices();

      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
    // Default to natural English voice if none selected
    if (!this.settings.selectedVoiceURI && this.voices.length > 0) {
      const preferred = this.voices.find(
        v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Online'))
      ) || this.voices.find(v => v.lang.startsWith('en')) || this.voices[0];
      
      if (preferred) {
        this.settings.selectedVoiceURI = preferred.voiceURI;
      }
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.voices;
  }

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<VoiceSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (!this.settings.enabled && this.isSpeaking) {
      this.stop();
    }
  }

  public subscribe(listener: SpeechListener): () => void {
    this.listeners.add(listener);
    listener(this.currentCaption, this.isSpeaking);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn(this.currentCaption, this.isSpeaking));
  }

  public speak(text: string, force: boolean = false) {
    this.currentCaption = text;

    // Always notify captions so deaf/hard-of-hearing or muted users see captions!
    if (!this.isSupported || (!this.settings.enabled && !force)) {
      this.isSpeaking = false;
      this.notify();
      return;
    }

    if (!this.synth) return;

    // Cancel existing utterance to prevent speech queue overlap
    this.synth.cancel();

    if (!text.trim()) {
      this.isSpeaking = false;
      this.notify();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.settings.speechRate;
    utterance.pitch = this.settings.pitch;
    utterance.volume = this.settings.volume;

    if (this.settings.selectedVoiceURI) {
      const voice = this.voices.find(v => v.voiceURI === this.settings.selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notify();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notify();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notify();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.isSpeaking) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth && this.synth.paused) {
      this.synth.resume();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentCaption = '';
    this.notify();
  }

  public replay() {
    if (this.currentCaption) {
      this.speak(this.currentCaption, true);
    }
  }

  public getCaption(): string {
    return this.currentCaption;
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }
}

export const speechService = new SpeechService();
