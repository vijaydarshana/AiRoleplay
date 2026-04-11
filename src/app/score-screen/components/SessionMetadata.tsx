'use client';
import type { SessionRecord } from '@/types';
import { Clock, MessageSquare, Calendar, Tag } from 'lucide-react';

interface Props {
  session: SessionRecord;
}

export default function SessionMetadata({ session }: Props) {
  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const difficultyMap: Record<string, string> = {
    'sim-replacement': 'Beginner',
    'bill-dispute': 'Intermediate',
    'new-connection': 'Advanced',
  };

  const diffColor: Record<string, string> = {
    Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
    Advanced: 'bg-red-50 text-red-700 border-red-200',
  };

  const diff = difficultyMap[session.scenarioId] ?? 'Beginner';

  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-4 sm:px-5 py-3.5 sm:py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-2.5">
        <div className="flex items-center gap-2">
          <Tag size={13} className="text-slate-400 flex-shrink-0" />
          <span className="text-sm font-bold text-slate-800">{session.scenarioTitle}</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${diffColor[diff]}`}>
            {diff}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <Calendar size={12} className="text-slate-400 flex-shrink-0" />
          <span className="truncate">{formatDate(session.startedAt)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <Clock size={12} className="text-indigo-400" />
          <span className="font-semibold text-slate-700">{formatDuration(session.duration)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1">
          <MessageSquare size={12} className="text-violet-400" />
          <span className="font-semibold text-slate-700">{session.turns} turns</span>
        </div>
      </div>
    </div>
  );
}