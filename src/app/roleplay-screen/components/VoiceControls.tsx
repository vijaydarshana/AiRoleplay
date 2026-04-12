'use client';
import type { AIStatus } from '@/types';
import type { TTSVoice } from '@/frontend/services/tts.service';
import { Mic, AlertCircle, PhoneOff, RotateCcw, StopCircle } from 'lucide-react';

const TTS_VOICES: { id: TTSVoice; label: string; description: string }[] = [
  { id: 'riya',      label: '🇮🇳 Riya ♀',    description: 'Indian female – warm & conversational' },
  { id: 'raju',      label: '🇮🇳 Raju ♂',    description: 'Indian male – authentic & relatable' },
  { id: 'ruhaan',    label: '🇮🇳 Ruhaan ♂',  description: 'Indian male – clear & cheerful' },
  { id: 'aria',      label: 'Aria ♀',         description: 'Expressive & most human-sounding' },
  { id: 'charlotte', label: 'Charlotte ♀',    description: 'Seductive & whispery' },
  { id: 'alice',     label: 'Alice ♀',        description: 'Confident & British' },
  { id: 'bill',      label: 'Bill ♂',         description: 'Trustworthy & deep' },
  { id: 'george',    label: 'George ♂',       description: 'Warm & authoritative' },
  { id: 'jessica',   label: 'Jessica ♀',      description: 'Expressive & bright' },
];

const INDIAN_VOICES: TTSVoice[] = ['riya', 'raju', 'ruhaan'];

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
  speed: number;
  pitch: number;
  onSpeedChange: (value: number) => void;
  onPitchChange: (value: number) => void;
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
  speed,
  pitch,
  onSpeedChange,
  onPitchChange,
}: Props) {
  const canStart = isSupported && (aiStatus === 'idle' || aiStatus === 'speaking') && !isListening;
  const canStop = isSupported && isListening;
  const isIndianVoice = INDIAN_VOICES.includes(selectedVoice);

  const handleMicClick = () => {
    if (aiStatus === 'speaking') {
      onStopAudio();
    }
    onStartRecording();
  };

  return (
    <div className="flex-shrink-0 border-t border-slate-800/80 bg-slate-950 px-4 lg:px-8 py-4 sm:py-5">
      {!isSupported && (
        <div className="mb-3 sm:mb-4 flex items-start gap-2.5 bg-red-950/50 border border-red-700/40 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
          <AlertCircle size={15} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-red-300">
            Microphone access is not supported in this browser. Please use a modern browser (Chrome, Firefox, Safari, or Edge).
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

      {/* Speed & Pitch controls — only for Indian voices */}
      {isIndianVoice && (
        <div className="mb-4 sm:mb-5 bg-slate-900/60 border border-slate-800/60 rounded-xl px-4 py-3">
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4l3 3"/>
            </svg>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Delivery Controls</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {/* Speed */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Speed</span>
                <span className="text-[10px] text-amber-400 font-bold font-mono">
                  {speed === 1.0 ? 'Normal' : speed < 1.0 ? `${Math.round((1 - speed) * 100)}% slower` : `${Math.round((speed - 1) * 100)}% faster`}
                </span>
              </div>
              <input
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={speed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-amber-500 bg-slate-700"
                title={`Speed: ${speed}x`}
              />
              <div className="flex justify-between text-[9px] text-slate-600">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>
            {/* Pitch */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Pitch</span>
                <span className="text-[10px] text-sky-400 font-bold font-mono">
                  {pitch === 0 ? 'Normal' : pitch > 0 ? `+${pitch}` : `${pitch}`}
                </span>
              </div>
              <input
                type="range"
                min={-10}
                max={10}
                step={1}
                value={pitch}
                onChange={(e) => onPitchChange(parseInt(e.target.value, 10))}
                className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-sky-500 bg-slate-700"
                title={`Pitch: ${pitch}`}
              />
              <div className="flex justify-between text-[9px] text-slate-600">
                <span>Low</span>
                <span>Normal</span>
                <span>High</span>
              </div>
            </div>
          </div>
        </div>
      )}

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

        {/* Stop AI button — shown while AI is speaking */}
        {aiStatus === 'speaking' && !isListening && (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={onStopAudio}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center bg-orange-600/15 hover:bg-orange-600/30 border border-orange-600/40 hover:border-orange-500/60 transition-all duration-150 active:scale-95"
              title="Stop AI"
            >
              <StopCircle size={19} className="text-orange-400" />
            </button>
            <p className="text-[10px] text-orange-400 font-medium text-center uppercase tracking-wider">Stop</p>
          </div>
        )}

        {/* Start to Speak button */}
        {!isListening && (
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <button
                onClick={handleMicClick}
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
                : aiStatus === 'speaking' ? 'Tap to Interrupt' : isReplaying ? 'Replaying...' : 'Tap to Speak'}
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