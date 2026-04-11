'use client';
import type { AIStatus } from '@/types';
import type { TTSVoice } from '@/frontend/services/tts.service';
import { Mic, AlertCircle, PhoneOff, RotateCcw } from 'lucide-react';

const TTS_VOICES: { id: TTSVoice; label: string; description: string }[] = [
  { id: 'nova',    label: 'Nova',    description: 'Warm & friendly' },
  { id: 'shimmer', label: 'Shimmer', description: 'Soft & clear' },
  { id: 'fable',   label: 'Fable',   description: 'Expressive' },
  { id: 'echo',    label: 'Echo',    description: 'Crisp & neutral' },
  { id: 'alloy',   label: 'Alloy',   description: 'Balanced' },
  { id: 'onyx',    label: 'Onyx',    description: 'Deep & rich' },
];

export type { TTSVoice };

interface Props {
  aiStatus: AIStatus;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onEnd: () => void;
  onReplay: () => void;
  canReplay: boolean;
  isReplaying: boolean;
  selectedVoice: TTSVoice;
  onVoiceChange: (voice: TTSVoice) => void;
  onStopAudio: () => void;
}

export default function VoiceControls({
  aiStatus,
  isListening,
  isSupported,
  error,
  onStartRecording,
  onStopRecording,
  onEnd,
  onReplay,
  canReplay,
  isReplaying,
  selectedVoice,
  onVoiceChange,
  onStopAudio,
}: Props) {
  const canStart = isSupported && (aiStatus === 'idle') && !isListening;
  const canStop = isSupported && isListening;

  return (
    <div className="flex-shrink-0 border-t border-slate-800/80 bg-slate-950 px-4 lg:px-8 py-4 sm:py-5">
      {!isSupported && (
        <div className="mb-3 sm:mb-4 flex items-start gap-2.5 bg-red-950/50 border border-red-700/40 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">
            Speech recognition requires Chrome. Please open this page in Chrome on desktop or mobile.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-3 sm:mb-4 flex items-start gap-2.5 bg-red-950/50 border border-red-700/40 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Voice selector */}
      <div className="mb-4 sm:mb-5">
        <div className="flex items-center justify-center gap-1.5 mb-2.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">AI Voice</span>
        </div>
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {TTS_VOICES.map((voice) => (
            <button
              key={voice.id}
              onClick={() => onVoiceChange(voice.id)}
              title={voice.description}
              className={`
                px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150
                ${selectedVoice === voice.id
                  ? 'bg-violet-600 text-white border border-violet-500 shadow-sm shadow-violet-500/40'
                  : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:border-violet-500/50 hover:text-slate-200 hover:bg-slate-700/60'
                }
              `}
            >
              {voice.label}
            </button>
          ))}
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-1.5 font-medium">
          {TTS_VOICES.find(v => v.id === selectedVoice)?.description ?? ''}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-slate-800/60 mb-4 sm:mb-5" />

      <div className="flex items-center justify-center gap-6 sm:gap-8">
        {/* End Session button */}
        {(aiStatus === 'idle' || isListening) && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onEnd}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-red-600/15 hover:bg-red-600/30 border border-red-600/40 hover:border-red-500/60 transition-all duration-150 active:scale-95"
              title="End Session"
            >
              <PhoneOff size={19} className="text-red-400" />
            </button>
            <p className="text-[10px] text-slate-600 font-medium text-center uppercase tracking-wider">End</p>
          </div>
        )}

        {/* Stop Audio button */}
        {aiStatus === 'speaking' && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onStopAudio}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-amber-500/15 hover:bg-amber-500/30 border-2 border-amber-500/40 hover:border-amber-400/60 transition-all duration-150 active:scale-95 shadow-lg shadow-amber-900/20"
              title="Stop AI speech"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="currentColor" className="text-amber-400">
                <rect x="6" y="6" width="12" height="12" rx="2.5" />
              </svg>
            </button>
            <p className="text-[10px] text-amber-500 font-semibold text-center uppercase tracking-wider">Stop</p>
          </div>
        )}

        {/* Start to Speak button */}
        {!isListening && (
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <button
                onClick={onStartRecording}
                disabled={!canStart}
                className={`
                  relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center
                  transition-all duration-200 select-none touch-none
                  ${canStart
                    ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 hover:from-indigo-400 hover:to-indigo-600 active:scale-95 shadow-xl shadow-indigo-500/30 cursor-pointer border-2 border-indigo-400/30'
                    : 'bg-slate-800 border-2 border-slate-700 cursor-not-allowed opacity-40'
                  }
                `}
              >
                <Mic size={28} className="text-white" />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 font-medium text-center max-w-[100px] leading-relaxed uppercase tracking-wider">
              {aiStatus === 'processing' ? 'AI thinking...'
                : aiStatus === 'speaking' ? 'AI speaking...' : isReplaying ? 'Replaying...' : 'Tap to Speak'}
            </p>
          </div>
        )}

        {/* End to Speak button */}
        {isListening && (
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <span className="pulse-ring absolute inset-0 rounded-full bg-emerald-500/20" />
              <span className="pulse-ring absolute inset-0 rounded-full bg-emerald-500/10" style={{ animationDelay: '0.3s' }} />
              <button
                onClick={onStopRecording}
                disabled={!canStop}
                className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-xl shadow-emerald-500/40 scale-110 border-2 border-emerald-400/40 transition-all duration-150 select-none touch-none active:scale-100 cursor-pointer"
              >
                <div className="flex items-center gap-0.5 h-8">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div
                      key={`mic-wave-${i}`}
                      className="wave-bar w-1 bg-white rounded-full origin-bottom"
                      style={{ height: `${20 + i * 4}px` }}
                    />
                  ))}
                </div>
              </button>
            </div>
            <p className="text-[10px] text-emerald-400 font-semibold text-center max-w-[100px] leading-relaxed uppercase tracking-wider">
              Tap to Send
            </p>
          </div>
        )}

        {/* Replay button */}
        {aiStatus === 'idle' && !isListening && canReplay && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onReplay}
              disabled={isReplaying}
              className={`
                w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center
                border transition-all duration-150 active:scale-95
                ${isReplaying
                  ? 'bg-violet-600/20 border-violet-500/40 cursor-not-allowed'
                  : 'bg-violet-600/15 hover:bg-violet-600/30 border-violet-600/40 hover:border-violet-500/60 cursor-pointer'
                }
              `}
              title={`Replay as ${selectedVoice}`}
            >
              <RotateCcw size={17} className={`text-violet-400 ${isReplaying ? 'animate-spin' : ''}`} />
            </button>
            <p className="text-[10px] text-slate-600 font-medium text-center uppercase tracking-wider">Replay</p>
          </div>
        )}
      </div>

      {/* Hint */}
      <div className="mt-4 text-center">
        <p className="text-[10px] text-slate-700 font-medium">
          Tap &quot;Tap to Speak&quot; to begin · Tap &quot;Tap to Send&quot; when done
        </p>
      </div>
    </div>
  );
}