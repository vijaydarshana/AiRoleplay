'use client';
import type { Scenario } from '@/types';
import { User, AlertCircle, Target, MessageCircle } from 'lucide-react';

interface Props {
  scenario: Scenario;
}

export default function CustomerPersonaCard({ scenario }: Props) {
  const { customer } = scenario;

  const emotionConfig: Record<string, { bg: string; text: string; dot: string }> = {
    'Stressed & frustrated': { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' },
    'Angry & demanding': { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
    'Skeptical & comparing': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
  };

  const emotion = emotionConfig[customer.emotion] ?? emotionConfig['Stressed & frustrated'];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-3 sm:gap-4 flex-wrap">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-white font-semibold text-sm sm:text-base">{customer.name}</div>
          <div className="text-slate-300 text-xs">{customer.age} · {customer.gender}</div>
        </div>
        <div className="flex-shrink-0">
          <span className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium border ${emotion.bg} ${emotion.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${emotion.dot} flex-shrink-0`} />
            <span className="truncate max-w-[120px] sm:max-w-none">{customer.emotion}</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className={`rounded-xl p-3 sm:p-4 border ${emotion.bg}`}>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle size={14} className={emotion.text} />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Situation</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{customer.situation}</p>
        </div>

        <div className="rounded-xl p-3 sm:p-4 border bg-blue-50 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Target size={14} className="text-blue-600" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">What They Need</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">{customer.need}</p>
        </div>

        <div className="sm:col-span-2 rounded-xl p-3 sm:p-4 border bg-slate-50 border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <MessageCircle size={14} className="text-slate-500" />
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Backstory</span>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{customer.backstory}</p>
        </div>
      </div>

      <div className="border-t border-slate-100 px-4 sm:px-6 py-3 bg-slate-50 flex items-start gap-2">
        <span className="text-xs text-slate-400 flex-shrink-0">🎭</span>
        <span className="text-xs text-slate-500">
          The AI will play <strong>{customer.name}</strong> throughout the session. Stay in character as the store executive.
        </span>
      </div>
    </div>
  );
}