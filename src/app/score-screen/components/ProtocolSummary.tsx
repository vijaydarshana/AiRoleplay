'use client';
import type { ProtocolItem } from '@/types';
import { CheckCircle2, XCircle, ClipboardList } from 'lucide-react';

interface Props {
  items: ProtocolItem[];
  completion: number;
}

export default function ProtocolSummary({ items, completion }: Props) {
  const checked = items.filter((i) => i.checked).length;

  const completionColor = () => {
    if (completion >= 85) return { text: 'text-emerald-600', bar: 'bg-emerald-500', bg: 'bg-emerald-50 border-emerald-200' };
    if (completion >= 60) return { text: 'text-amber-600', bar: 'bg-amber-500', bg: 'bg-amber-50 border-amber-200' };
    return { text: 'text-red-600', bar: 'bg-red-500', bg: 'bg-red-50 border-red-200' };
  };

  const colors = completionColor();

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <ClipboardList size={16} className="text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">Protocol Checklist</h3>
              <p className="text-xs text-slate-400">{checked} of {items.length} steps completed</p>
            </div>
          </div>
          <span className={`text-2xl font-bold font-mono-data ${colors.text}`}>{completion}%</span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-100 rounded-full mb-5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${colors.bar}`}
            style={{ width: `${completion}%` }}
          />
        </div>

        {/* Items grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {items.map((item) => (
            <div
              key={`summary-${item.id}`}
              className={`flex items-center gap-2.5 p-3 rounded-xl border ${
                item.checked ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
              }`}
            >
              {item.checked ? (
                <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />
              ) : (
                <XCircle size={15} className="text-red-400 flex-shrink-0" />
              )}
              <span className={`text-xs font-medium ${item.checked ? 'text-emerald-700' : 'text-red-600'}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}