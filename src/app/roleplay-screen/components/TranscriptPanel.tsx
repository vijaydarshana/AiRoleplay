'use client';
import { useEffect, useRef } from 'react';
import type { TranscriptTurn } from '@/types';

interface Props {
  transcript: TranscriptTurn[];
  interimText: string;
  isListening: boolean;
  customerName: string;
}

export default function TranscriptPanel({ transcript, interimText, isListening, customerName }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript, interimText]);

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="h-full overflow-y-auto custom-scroll px-3 sm:px-5 lg:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
      {transcript.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-700 border border-slate-700 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
            <span className="text-2xl">🎙️</span>
          </div>
          <p className="text-sm font-semibold text-slate-300">Waiting for conversation to begin...</p>
          <p className="text-xs text-slate-600 mt-1">The AI customer will speak first</p>
        </div>
      )}

      {transcript.map((turn) => (
        <div
          key={turn.id}
          className={`transcript-message flex gap-2.5 sm:gap-3 ${turn.speaker === 'candidate' ? 'flex-row-reverse' : 'flex-row'}`}
        >
          {/* Avatar */}
          <div
            className={`
              flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-bold shadow-sm
              ${turn.speaker === 'ai' ?'bg-gradient-to-br from-indigo-500 to-violet-600 text-white' :'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
              }
            `}
          >
            {turn.speaker === 'ai' ? customerName.charAt(0) : 'ME'}
          </div>

          {/* Bubble */}
          <div className={`max-w-[85%] sm:max-w-[75%] ${turn.speaker === 'candidate' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold ${turn.speaker === 'ai' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                {turn.speaker === 'ai' ? customerName : 'You (Executive)'}
              </span>
              <span className="text-[10px] text-slate-600">{formatTime(turn.timestamp)}</span>
            </div>
            <div
              className={`
                px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed shadow-sm
                ${turn.speaker === 'ai' ?'bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-2xl rounded-tl-sm' :'bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-2xl rounded-tr-sm shadow-indigo-900/30'
                }
              `}
            >
              {turn.text}
            </div>
          </div>
        </div>
      ))}

      {/* Interim text while recording */}
      {isListening && interimText && (
        <div className="flex gap-2.5 sm:gap-3 flex-row-reverse">
          <div className="flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-xs font-bold bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
            ME
          </div>
          <div className="max-w-[85%] sm:max-w-[75%] items-end flex flex-col gap-1">
            <span className="text-xs font-semibold text-emerald-400">You (typing...)</span>
            <div className="px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed bg-indigo-600/30 text-white/60 border border-indigo-500/30 italic">
              {interimText}
            </div>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}