'use client';
import { AlertTriangle, Clock, MessageSquare } from 'lucide-react';

interface Props {
  turnCount: number;
  duration: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function EndSessionModal({ turnCount, duration, onConfirm, onCancel }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-900/40 border border-amber-700/40 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} className="text-amber-400" />
            </div>
            <div>
              <h2 className="font-semibold text-white">End This Session?</h2>
              <p className="text-xs text-slate-400">Your session will be evaluated and scored</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-2.5">
              <Clock size={14} className="text-slate-400" />
              <div>
                <div className="text-xs text-slate-500">Duration</div>
                <div className="text-sm font-semibold font-mono-data text-white">{duration}</div>
              </div>
            </div>
            <div className="bg-slate-800 rounded-xl p-3 flex items-center gap-2.5">
              <MessageSquare size={14} className="text-slate-400" />
              <div>
                <div className="text-xs text-slate-500">Turns</div>
                <div className="text-sm font-semibold font-mono-data text-white">{turnCount}</div>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-6 leading-relaxed">
            The AI will evaluate your conversation and generate a detailed performance score. This may take a few seconds.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 active:scale-95 transition-all duration-150 text-sm font-medium"
            >
              Continue Session
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-sm font-semibold transition-all duration-150"
            >
              End & Get Score
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}