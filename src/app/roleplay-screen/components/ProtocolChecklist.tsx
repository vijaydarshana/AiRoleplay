'use client';
import type { ProtocolItem } from '@/types';
import { ClipboardList, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  items: ProtocolItem[];
  onToggle: () => void;
}

export default function ProtocolChecklist({ items }: Props) {
  const checkedCount = items.filter((i) => i.checked).length;
  const completion = Math.round((checkedCount / items.length) * 100);

  return (
    <div className="p-4 lg:p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-7 h-7 bg-violet-900/50 border border-violet-700/50 rounded-lg flex items-center justify-center">
          <ClipboardList size={14} className="text-violet-400" />
        </div>
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Protocol</h3>
          <p className="text-xs text-slate-500">{checkedCount}/{items.length} completed</p>
        </div>
        <span className={`text-sm font-bold font-mono-data ${completion === 100 ? 'text-emerald-400' : 'text-slate-400'}`}>
          {completion}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-slate-800 rounded-full mb-4 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${completion === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
          style={{ width: `${completion}%` }}
        />
      </div>

      {/* Items */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={`
              flex items-start gap-2.5 p-2.5 rounded-xl border transition-all duration-300
              ${item.checked
                ? 'bg-emerald-900/20 border-emerald-700/30' :'bg-slate-800/50 border-slate-700/50'
              }
            `}
          >
            {item.checked ? (
              <CheckCircle2 size={15} className="text-emerald-400 flex-shrink-0 mt-0.5" />
            ) : (
              <Circle size={15} className="text-slate-600 flex-shrink-0 mt-0.5" />
            )}
            <span className={`text-xs leading-relaxed ${item.checked ? 'text-emerald-300' : 'text-slate-400'}`}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800">
        <p className="text-xs text-slate-600 leading-relaxed">
          Items check automatically as you speak. Aim for full completion.
        </p>
      </div>
    </div>
  );
}