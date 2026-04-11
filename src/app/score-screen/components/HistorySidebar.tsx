'use client';
import type { SessionRecord } from '@/types';
import { History, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Props {
  sessions: SessionRecord[];
  currentId: string;
  onSelect: (id: string) => void;
}

export default function HistorySidebar({ sessions, currentId, onSelect }: Props) {
  const scoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-500';
    if (s >= 60) return 'text-amber-500';
    return 'text-red-500';
  };

  const scoreBg = (s: number, isActive: boolean) => {
    if (isActive) return 'bg-indigo-50 border-indigo-300';
    if (s >= 80) return 'bg-emerald-50 border-emerald-200';
    if (s >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const avg = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.score.overall, 0) / sessions.length)
    : 0;

  const best = sessions.length ? Math.max(...sessions.map((s) => s.score.overall)) : 0;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <History size={16} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Session History</h3>
            <p className="text-xs text-slate-400">{sessions.length} attempt{sessions.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {sessions.length > 1 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 mb-0.5">Best</div>
              <div className={`text-lg font-bold font-mono-data ${scoreColor(best)}`}>{best}</div>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <div className="text-xs text-slate-400 mb-0.5">Average</div>
              <div className="text-lg font-bold font-mono-data text-slate-700">{avg}</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 max-h-[480px] overflow-y-auto custom-scroll space-y-2">
        {sessions.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400">No history yet.</p>
          </div>
        ) : (
          sessions.map((session, idx) => {
            const isActive = session.id === currentId;
            const trend = idx < sessions.length - 1
              ? session.score.overall - sessions[idx + 1].score.overall
              : null;

            return (
              <button
                key={`hist-btn-${session.id}`}
                onClick={() => onSelect(session.id)}
                className={`w-full text-left p-3 rounded-xl border transition-all duration-150 hover:shadow-sm ${scoreBg(session.score.overall, isActive)}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[120px]">
                    {session.scenarioTitle}
                  </span>
                  <div className="flex items-center gap-1.5">
                    {trend !== null && (
                      <span className={`text-xs ${trend > 0 ? 'text-emerald-500' : trend < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {trend > 0 ? <TrendingUp size={11} /> : trend < 0 ? <TrendingDown size={11} /> : <Minus size={11} />}
                      </span>
                    )}
                    <span className={`text-base font-bold font-mono-data ${scoreColor(session.score.overall)}`}>
                      {session.score.overall}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">{formatDate(session.startedAt)}</span>
                  <span className="text-xs text-slate-400">{formatDuration(session.duration)}</span>
                </div>
                {isActive && (
                  <div className="mt-1.5 text-xs text-indigo-600 font-medium">Currently viewing</div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}