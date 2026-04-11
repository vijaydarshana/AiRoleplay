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
  if (score >= 80) return { bar: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' };
  if (score >= 60) return { bar: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' };
  return { bar: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' };
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
      <p className="text-lg font-bold text-slate-900 font-mono-data">{payload[0].value}</p>
    </div>
  );
}

export default function CriteriaBreakdown({ criteria }: Props) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 200);
    return () => clearTimeout(t);
  }, []);

  const chartData = criteria.map((c) => ({
    name: c.name.split(' ')[0],
    fullName: c.name,
    score: animated ? c.score : 0,
    weight: c.weight,
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-1">Criteria Breakdown</h3>
        <p className="text-xs text-slate-400 mb-6">Scores across all 5 evaluation dimensions</p>

        {/* Bar Chart */}
        <div className="h-48 mb-6">
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
            return (
              <div
                key={`criterion-${criterion.id}`}
                className={`rounded-xl border p-4 ${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg">{criteriaIcons[criterion.id] ?? '📊'}</span>
                  <span className={`text-xl font-bold font-mono-data ${colors.text}`}>
                    {criterion.score}
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-700 mb-1 leading-tight">
                  {criterion.name}
                </div>
                <div className="text-xs text-slate-500">{criterion.weight}% weight</div>

                {/* Mini progress bar */}
                <div className="mt-2 h-1 bg-white/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${
                      criterion.score >= 80 ? 'bg-emerald-500' :
                      criterion.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ width: animated ? `${criterion.score}%` : '0%' }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}