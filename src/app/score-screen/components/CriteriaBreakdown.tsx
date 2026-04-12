'use client';
import { useEffect, useState } from 'react';
import type { EvaluationCriteria } from '@/types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface Props {
  criteria: EvaluationCriteria[];
}

const criteriaIcons: Record<string, string> = {
  communication: '💬',
  empathy: '❤️',
  process: '📋',
  resolution: '✅',
  professionalism: '🤝',
};

const scoreColor = (score: number) => {
  if (score >= 80) return { bar: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' };
  if (score >= 60) return { bar: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' };
  return { bar: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', badge: 'bg-red-100 text-red-700' };
};

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-slate-700">{label}</p>
      <p className="text-lg font-bold text-slate-900">{payload[0].value}%</p>
    </div>
  );
}

export default function CriteriaBreakdown({ criteria }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = requestAnimationFrame(() => setAnimated(true));
    return () => cancelAnimationFrame(t);
  }, []);

  const chartData = criteria.map((c) => ({
    name: c.name.split(' ')[0],
    fullName: c.name,
    score: animated ? c.score : 0,
    weight: c.weight,
  }));

  // Total weight check
  const totalWeight = criteria.reduce((acc, c) => acc + c.weight, 0);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="text-base font-semibold text-slate-800">Criteria Breakdown</h3>
            <p className="text-xs text-slate-400 mt-0.5">Scores across all {criteria.length} evaluation dimensions (total weight: {totalWeight}%)</p>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-48 mb-6 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tickFormatter={(v) => `${v}%`}
                tick={{ fontSize: 11, fill: '#94a3b8', fontFamily: 'DM Sans' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]} isAnimationActive animationDuration={1000}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={scoreColor(entry.score).bar} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
          {criteria.map((criterion) => {
            const colors = scoreColor(criterion.score);
            const weightedContribution = Math.round((criterion.score * criterion.weight) / 100);
            return (
              <div
                key={`criterion-${criterion.id}`}
                className={`rounded-xl border p-4 ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{criteriaIcons[criterion.id] ?? '📊'}</span>
                  <div className="text-right">
                    <span className={`text-xl font-bold ${colors.text}`}>
                      {criterion.score}%
                    </span>
                  </div>
                </div>
                <div className="text-xs font-semibold text-slate-700 mb-1 leading-tight">
                  {criterion.name}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span>Weight: {criterion.weight}%</span>
                  <span className={`font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                    +{weightedContribution}pts
                  </span>
                </div>

                {/* Mini progress bar */}
                <div className="h-1.5 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      criterion.score >= 80 ? 'bg-emerald-500' :
                      criterion.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: animated ? `${criterion.score}%` : '0%' }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Weighted total summary */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs text-slate-500 font-medium">Weighted Score Calculation:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {criteria.map((c, i) => {
                const contribution = Math.round((c.score * c.weight) / 100);
                const colors = scoreColor(c.score);
                return (
                  <span key={c.id} className="flex items-center gap-1 text-xs">
                    {i > 0 && <span className="text-slate-300 font-bold">+</span>}
                    <span className={`font-bold px-1.5 py-0.5 rounded ${colors.badge}`}>
                      {contribution}
                    </span>
                  </span>
                );
              })}
              <span className="text-slate-400 font-bold mx-1">=</span>
              <span className="text-sm font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg">
                {criteria.reduce((acc, c) => acc + Math.round((c.score * c.weight) / 100), 0)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}