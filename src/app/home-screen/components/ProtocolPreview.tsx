'use client';
import { DEFAULT_PROTOCOL_ITEMS } from '@/lib/scenarios';
import { ClipboardList } from 'lucide-react';

export default function ProtocolPreview() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
          <ClipboardList size={16} className="text-violet-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Protocol Checklist</h3>
          <p className="text-xs text-slate-400">Auto-tracked during session</p>
        </div>
      </div>
      <div className="space-y-2">
        {DEFAULT_PROTOCOL_ITEMS?.map((item) => (
          <div
            key={`preview-${item?.id}`}
            className="flex items-center gap-2.5 py-1.5"
          >
            <div className="w-4 h-4 border-2 border-slate-300 rounded flex-shrink-0" />
            <span className="text-xs text-slate-500">{item?.label}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400 leading-relaxed">
          Items check off automatically as you speak. Aim for 100% completion.
        </p>
      </div>
    </div>
  );
}