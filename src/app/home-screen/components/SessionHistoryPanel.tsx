'use client';
import type { SessionRecord } from '@/types';
import { History, TrendingUp, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  sessions: SessionRecord[];
}

export default function SessionHistoryPanel({ sessions }: Props) {
  const router = useRouter();

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-500';
  };

  const scoreBg = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
          <History size={16} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Past Attempts</h3>
          <p className="text-xs text-slate-400">{sessions.length} session{sessions.length !== 1 ? 's' : ''} saved</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="text-center py-6">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-sm text-slate-500">No sessions yet.</p>
          <p className="text-xs text-slate-400 mt-1">Complete your first roleplay to see history here.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.slice(0, 5).map((session) => (
            <button
              key={`history-${session.id}`}
              onClick={() => {
                sessionStorage.setItem('view_session_id', session.id);
                router.push('/score-screen');
              }}
              className="w-full text-left group"
            >
              <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm ${scoreBg(session.score.overall)}`}>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-700 truncate">{session.scenarioTitle}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{formatDate(session.startedAt)} · {formatDuration(session.duration)}</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-sm font-bold font-mono-data ${scoreColor(session.score.overall)}`}>
                    {session.score.overall}
                  </span>
                  <ChevronRight size={12} className="text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {sessions.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp size={12} className="text-emerald-500" />
            <span>
              Best score:{' '}
              <span className="font-semibold text-slate-700">
                {Math.max(...sessions.map((s) => s.score.overall))}
              </span>
              {' '}· Avg:{' '}
              <span className="font-semibold text-slate-700">
                {Math.round(sessions.reduce((a, s) => a + s.score.overall, 0) / sessions.length)}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}