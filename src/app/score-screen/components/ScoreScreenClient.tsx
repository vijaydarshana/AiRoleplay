'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getPendingSession, clearPendingSession, saveSession, getSessionsWithCloud, getSessionWithCloud } from '@/frontend/services/storage.service';
import { findScenario } from '@/backend/models/scenario.model';
import { evaluateSession } from '@/frontend/services/evaluation.service';
import type { SessionRecord } from '@/types';
import OverallScoreHero from './OverallScoreHero';
import CriteriaBreakdown from './CriteriaBreakdown';
import FeedbackPanel from './FeedbackPanel';
import ProtocolSummary from './ProtocolSummary';
import SessionMetadata from './SessionMetadata';
import HistorySidebar from './HistorySidebar';
import DownloadReport from './DownloadReport';
import AppLogo from '@/components/ui/AppLogo';
import { Home, RotateCcw, Loader2, History, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

export default function ScoreScreenClient() {
  const router = useRouter();
  const [session, setSession] = useState<SessionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const [viewingHistoryId, setViewingHistoryId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const initScore = async () => {
      const historyViewId = sessionStorage.getItem('view_session_id');
      if (historyViewId) {
        sessionStorage.removeItem('view_session_id');
        const hist = await getSessionWithCloud(historyViewId);
        if (hist) {
          setSession(hist);
          const allSessions = await getSessionsWithCloud();
          setHistory(allSessions);
          setLoading(false);
          setViewingHistoryId(historyViewId);
          return;
        }
      }

      const pending = getPendingSession();
      if (!pending || !pending.transcript || pending.transcript.length < 2) {
        setError('No session data found. Please complete a roleplay session first.');
        setLoading(false);
        return;
      }

      const protocolCompletion = Number(sessionStorage.getItem('pending_protocol_completion') ?? 0);

      try {
        const { score } = await evaluateSession({
          scenarioId: pending.scenarioId ?? 'sim-replacement',
          transcript: pending.transcript,
          duration: pending.duration ?? 0,
          protocolCompletion,
        });

        const completeSession: SessionRecord = {
          id: pending.id ?? `session-${Date.now()}`,
          scenarioId: pending.scenarioId ?? 'sim-replacement',
          scenarioTitle: pending.scenarioTitle ?? findScenario(pending.scenarioId ?? 'sim-replacement').title,
          startedAt: pending.startedAt ?? Date.now(),
          duration: pending.duration ?? 0,
          turns: pending.turns ?? pending.transcript.length,
          transcript: pending.transcript,
          score,
          protocolItems: pending.protocolItems ?? [],
        };

        saveSession(completeSession);
        clearPendingSession();
        sessionStorage.removeItem('pending_protocol_completion');

        setSession(completeSession);
        const allSessions = await getSessionsWithCloud();
        setHistory(allSessions);
        toast.success('Session evaluated and saved!');
      } catch (err) {
        console.error('Evaluation error:', err);
        setError(err instanceof Error ? err.message : 'Evaluation failed. Please check your API key.');
      } finally {
        setLoading(false);
      }
    };

    initScore();
  }, []);

  const handleViewHistory = async (id: string) => {
    const hist = await getSessionWithCloud(id);
    if (hist) {
      setSession(hist);
      setViewingHistoryId(id);
      setShowHistory(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center">
        <div className="text-center max-w-sm px-4">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-5">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-200" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 size={28} className="text-white animate-spin" />
            </div>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">Evaluating Your Performance</h2>
          <p className="text-sm text-slate-500 leading-relaxed mb-6">
            The AI is reviewing your conversation and generating detailed feedback across 5 criteria...
          </p>
          <div className="space-y-2.5 text-left bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            {['Analyzing communication patterns...', 'Scoring empathy and process adherence...', 'Generating personalized feedback...'].map((step, i) => (
              <div key={`loading-step-${i}`} className="flex items-center gap-2.5 text-xs text-slate-500">
                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin flex-shrink-0" style={{ animationDelay: `${i * 0.15}s` }} />
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f6f7fb] flex items-center justify-center p-4">
        <div className="bg-white border border-red-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 border border-red-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-xl">⚠️</span>
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-2">Evaluation Failed</h2>
          <p className="text-sm text-red-600 mb-6 leading-relaxed">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/home-screen')}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors"
            >
              Go Home
            </button>
            <button
              onClick={() => router.push('/roleplay-screen')}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-bold transition-all shadow-sm shadow-indigo-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <AppLogo size={28} />
            <span className="font-bold text-slate-900 text-sm sm:text-base truncate tracking-tight">RoleplayAssess</span>
            {viewingHistoryId ? (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0">
                Past Session
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex-shrink-0">
                <Sparkles size={10} />
                Results
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {history.length > 0 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="xl:hidden flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-2.5 py-2 rounded-lg hover:bg-indigo-50"
              >
                <History size={14} />
                <span className="hidden sm:block">History</span>
              </button>
            )}
            <button
              onClick={() => router.push('/roleplay-screen')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-2.5 sm:px-3 py-2 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100"
            >
              <RotateCcw size={13} />
              <span className="hidden sm:block">Try Again</span>
            </button>
            <button
              onClick={() => router.push('/home-screen')}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-3 sm:px-4 py-2 rounded-lg transition-all shadow-sm shadow-indigo-200"
            >
              <Home size={13} />
              <span className="hidden sm:block">Home</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 py-5 sm:py-8 lg:py-10">
        {/* Mobile history accordion */}
        {history.length > 0 && (
          <div className="xl:hidden mb-4">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <History size={15} className="text-indigo-500" />
                Session History ({history.length})
              </span>
              {showHistory ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {showHistory && (
              <div className="mt-2">
                <HistorySidebar
                  sessions={history}
                  currentId={session.id}
                  onSelect={handleViewHistory}
                />
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 sm:gap-6 lg:gap-8">
          {/* Main content */}
          <div className="xl:col-span-3 space-y-5 sm:space-y-6">
            <SessionMetadata session={session} />
            <OverallScoreHero score={session.score} />
            <CriteriaBreakdown criteria={session.score.criteria} />
            <FeedbackPanel score={session.score} />
            <ProtocolSummary
              items={session.protocolItems}
              completion={session.score.protocolCompletion}
            />
            <DownloadReport session={session} />
          </div>

          {/* History sidebar - desktop only */}
          <div className="hidden xl:block xl:col-span-1">
            <div className="sticky top-24">
              <HistorySidebar
                sessions={history}
                currentId={session.id}
                onSelect={handleViewHistory}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}