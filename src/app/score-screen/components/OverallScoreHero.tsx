'use client';
import { useEffect, useState } from 'react';
import type { SessionScore } from '@/types';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

interface Props {
  score: SessionScore;
}

export default function OverallScoreHero({ score }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const overall = score.overall;

  // Calculate weighted score to verify/display
  const weightedScore = score.criteria.reduce((acc, c) => acc + (c.score * c.weight) / 100, 0);
  const displayScore = Math.round(overall);
  const displayPercentage = Math.round(weightedScore);

  const grade = () => {
    if (overall >= 90) return { label: 'Excellent', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', glow: 'shadow-emerald-100' };
    if (overall >= 75) return { label: 'Good', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', glow: 'shadow-blue-100' };
    if (overall >= 60) return { label: 'Fair', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', glow: 'shadow-amber-100' };
    return { label: 'Needs Work', color: 'text-red-700', bg: 'bg-red-50 border-red-200', glow: 'shadow-red-100' };
  };

  const gradeInfo = grade();

  const ringColor = () => {
    if (overall >= 75) return '#10b981';
    if (overall >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const chartData = [
    { name: 'score', value: animated ? overall : 0, fill: ringColor() },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Top accent gradient */}
      <div className="h-1 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />
      <div className="p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row gap-6 lg:gap-10 items-center sm:items-start">
          {/* Radial chart */}
          <div className={`relative flex-shrink-0 w-44 h-44 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shadow-inner ${gradeInfo.glow} shadow-lg`}>
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="68%"
                outerRadius="100%"
                barSize={13}
                data={chartData}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  background={{ fill: '#f1f5f9' }}
                  dataKey="value"
                  cornerRadius={6}
                  isAnimationActive={true}
                  animationDuration={1200}
                />
              </RadialBarChart>
            </ResponsiveContainer>
            {/* Center score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-slate-900 leading-none">
                {displayScore}
              </span>
              <span className="text-sm font-bold text-slate-500 mt-0.5">/ 100</span>
              <span className={`text-xs font-bold mt-1 px-2 py-0.5 rounded-full border ${gradeInfo.bg} ${gradeInfo.color}`}>
                {displayScore}%
              </span>
            </div>
          </div>

          {/* Score details */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start mb-2 flex-wrap">
              <h2 className="text-xl font-bold text-slate-900">Overall Performance</h2>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold border ${gradeInfo.bg} ${gradeInfo.color}`}>
                {gradeInfo.label}
              </span>
            </div>

            {/* Score breakdown pill */}
            <div className="flex items-center gap-2 justify-center sm:justify-start mb-4 flex-wrap">
              <div className="inline-flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
                <Target size={12} className="text-indigo-500" />
                <span className="text-xs font-semibold text-slate-600">
                  Weighted Score:
                </span>
                <span className="text-xs font-bold text-indigo-700">{displayPercentage}%</span>
              </div>
              <div className="inline-flex items-center gap-1 text-xs text-slate-400">
                {score.criteria.map((c, i) => (
                  <span key={c.id} className="flex items-center gap-1">
                    {i > 0 && <span className="text-slate-300">+</span>}
                    <span className="font-mono text-slate-500">{Math.round((c.score * c.weight) / 100)}</span>
                  </span>
                ))}
                <span className="text-slate-400 ml-1">= {displayPercentage}pts</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed mb-5 max-w-xl">
              {score.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3.5">
                <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <TrendingUp size={12} />
                  Strengths
                </h4>
                <ul className="space-y-1.5">
                  {score.strengths.map((s, i) => (
                    <li key={`strength-${i}`} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-emerald-500 flex-shrink-0 mt-0.5 font-bold">✓</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3.5">
                <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <TrendingDown size={12} />
                  Areas to Improve
                </h4>
                <ul className="space-y-1.5">
                  {score.areasForImprovement.map((a, i) => (
                    <li key={`improve-${i}`} className="flex items-start gap-2 text-sm text-slate-700">
                      <span className="text-amber-500 flex-shrink-0 mt-0.5 font-bold">→</span>
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}