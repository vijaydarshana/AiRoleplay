'use client';
import type { Scenario, AIStatus } from '@/types';
import { Square, Clock, MessageSquare } from 'lucide-react';
import AppLogo from '@/components/ui/AppLogo';

interface Props {
  scenario: Scenario;
  timerFormatted: string;
  turnCount: number;
  onEnd: () => void;
  aiStatus: AIStatus;
}

export default function SessionHeader({ scenario, timerFormatted, turnCount, onEnd, aiStatus }: Props) {
  const isLive = aiStatus !== 'idle';

  return (
    <header className="bg-slate-950 border-b border-slate-800/80 px-3 sm:px-4 lg:px-6 h-13 sm:h-14 flex items-center gap-2 sm:gap-4 flex-shrink-0 z-20">
      <div className="flex items-center gap-2 flex-shrink-0">
        <AppLogo size={24} />
        <span className="font-bold text-white text-sm hidden sm:block tracking-tight">RoleplayAssess</span>
      </div>

      <div className="h-5 w-px bg-slate-700/60 hidden sm:block" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="flex items-center gap-1.5 flex-shrink-0 bg-red-500/10 border border-red-500/30 rounded-full px-2 py-0.5">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider hidden xs:block">Live</span>
            </span>
          )}
          <span className="text-xs sm:text-sm font-semibold text-slate-200 truncate">{scenario.title}</span>
          <span className="hidden md:inline text-xs text-slate-500 flex-shrink-0">· {scenario.customer.name}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        {/* Timer */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg px-2.5 sm:px-3 py-1.5">
          <Clock size={12} className="text-indigo-400" />
          <span className="font-mono-data text-xs sm:text-sm font-bold text-white">{timerFormatted}</span>
        </div>

        {/* Turn count */}
        <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700/60 rounded-lg px-3 py-1.5">
          <MessageSquare size={12} className="text-violet-400" />
          <span className="font-mono-data text-xs sm:text-sm font-semibold text-slate-300">{turnCount}</span>
        </div>

        {/* End button */}
        <button
          onClick={onEnd}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg transition-all duration-150 shadow-sm shadow-red-900/40"
        >
          <Square size={10} className="fill-white" />
          <span className="hidden xs:block">End</span>
          <span className="hidden sm:block"> Session</span>
        </button>
      </div>
    </header>
  );
}