'use client';
import type { Scenario } from '@/types';
import { Clock, Users, CheckCircle2 } from 'lucide-react';

interface Props {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: () => void;
  difficultyColor: Record<string, string>;
}

export default function ScenarioCard({ scenario, isSelected, onSelect, difficultyColor }: Props) {
  const emoji: Record<string, string> = {
    'sim-replacement': '📱',
    'bill-dispute': '💰',
    'new-connection': '🔌',
  };

  const accentGradient: Record<string, string> = {
    'sim-replacement': 'from-indigo-500 to-violet-600',
    'bill-dispute': 'from-amber-500 to-orange-600',
    'new-connection': 'from-emerald-500 to-teal-600',
  };

  return (
    <button
      onClick={onSelect}
      className={`
        relative w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200
        hover:shadow-lg active:scale-[0.98]
        ${isSelected
          ? 'border-indigo-500 bg-white shadow-lg shadow-indigo-100/60'
          : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md'
        }
      `}
    >
      {/* Top accent bar */}
      {isSelected && (
        <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${accentGradient[scenario.id] ?? 'from-indigo-500 to-violet-600'} rounded-t-2xl`} />
      )}

      {isSelected ? (
        <span className="absolute top-3 right-3 text-indigo-600">
          <CheckCircle2 size={18} className="fill-indigo-100" />
        </span>
      ) : (
        <span className="absolute top-3 right-3 w-4.5 h-4.5 border-2 border-slate-200 rounded-full" />
      )}

      <div className="text-2xl mb-2.5">{emoji[scenario.id]}</div>
      <div className={`font-bold text-sm leading-snug mb-1 ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
        {scenario.title}
      </div>
      <div className="text-xs text-slate-500 mb-3 leading-relaxed">{scenario.subtitle}</div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${difficultyColor[scenario.difficulty]}`}>
          {scenario.difficulty}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
          <Clock size={11} />
          {scenario.duration}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
        <Users size={12} className="text-slate-400" />
        <span>{scenario.customer.name}</span>
      </div>
    </button>
  );
}