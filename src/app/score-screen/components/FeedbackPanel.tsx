'use client';
import { useState } from 'react';
import type { SessionScore } from '@/types';
import { ChevronDown, ChevronUp, Lightbulb, Star, ArrowRight } from 'lucide-react';

interface Props {
  score: SessionScore;
}

const criteriaIcons: Record<string, string> = {
  communication: '💬',
  empathy: '❤️',
  process: '📋',
  resolution: '✅',
  professionalism: '🤝',
};

const scoreLabel = (s: number) => {
  if (s >= 80) return { label: 'Strong', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
  if (s >= 60) return { label: 'Fair', color: 'text-amber-600 bg-amber-50 border-amber-200' };
  return { label: 'Weak', color: 'text-red-600 bg-red-50 border-red-200' };
};

export default function FeedbackPanel({ score }: Props) {
  const [openId, setOpenId] = useState<string | null>(score.criteria[0]?.id ?? null);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-800 mb-1">Detailed AI Feedback</h3>
        <p className="text-xs text-slate-400">
          Click each criterion to read the AI evaluator&apos;s specific feedback
        </p>
      </div>

      <div className="divide-y divide-slate-100">
        {score.criteria.map((criterion) => {
          const isOpen = openId === criterion.id;
          const sl = scoreLabel(criterion.score);

          return (
            <div key={`feedback-${criterion.id}`}>
              <button
                onClick={() => setOpenId(isOpen ? null : criterion.id)}
                className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors text-left group"
              >
                <span className="text-xl flex-shrink-0">{criteriaIcons[criterion.id] ?? '📊'}</span>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-slate-800">{criterion.name}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${sl.color}`}>
                      {sl.label}
                    </span>
                  </div>
                  {!isOpen && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">{criterion.feedback}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="text-2xl font-bold font-mono-data text-slate-800">{criterion.score}</span>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </div>
              </button>

              {isOpen && (
                <div className="px-6 pb-5 space-y-4 fade-in-up">
                  {/* Main feedback */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-sm text-slate-600 leading-relaxed">{criterion.feedback}</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Highlights */}
                    {criterion.highlights.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Star size={11} />
                          What Worked
                        </h5>
                        <ul className="space-y-1.5">
                          {criterion.highlights.map((h, i) => (
                            <li key={`highlight-${criterion.id}-${i}`} className="flex items-start gap-2 text-xs text-slate-600">
                              <span className="text-emerald-500 flex-shrink-0 mt-0.5">✓</span>
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Improvements */}
                    {criterion.improvements.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                          <Lightbulb size={11} />
                          Suggestions
                        </h5>
                        <ul className="space-y-1.5">
                          {criterion.improvements.map((imp, i) => (
                            <li key={`improvement-${criterion.id}-${i}`} className="flex items-start gap-2 text-xs text-slate-600">
                              <ArrowRight size={11} className="text-amber-500 flex-shrink-0 mt-0.5" />
                              {imp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}