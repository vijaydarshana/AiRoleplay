'use client';
import type { AIStatus } from '@/types';

interface Props {
  status: AIStatus;
  customerName: string;
}

export default function AIStatusBadge({ status, customerName }: Props) {
  const configs: Record<AIStatus, { label: string; color: string; bg: string; animate: boolean }> = {
    idle: {
      label: 'Ready — Hold the button to respond',
      color: 'text-slate-400',
      bg: 'bg-slate-800',
      animate: false,
    },
    listening: {
      label: 'Listening to you...',
      color: 'text-green-400',
      bg: 'bg-green-900/30',
      animate: true,
    },
    processing: {
      label: `${customerName} is thinking...`,
      color: 'text-amber-400',
      bg: 'bg-amber-900/20',
      animate: true,
    },
    speaking: {
      label: `${customerName} is speaking...`,
      color: 'text-indigo-400',
      bg: 'bg-indigo-900/30',
      animate: true,
    },
    error: {
      label: 'Connection error — check API key',
      color: 'text-red-400',
      bg: 'bg-red-900/20',
      animate: false,
    },
  };

  const config = configs[status];

  return (
    <div className={`inline-flex items-center gap-2.5 px-4 py-2 rounded-xl ${config.bg} transition-all duration-300`}>
      {/* Status dot */}
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span
          className={`
            ${config.animate ? 'animate-ping' : ''}
            absolute inline-flex h-full w-full rounded-full opacity-75
            ${status === 'listening' ? 'bg-green-400' : ''}
            ${status === 'processing' ? 'bg-amber-400' : ''}
            ${status === 'speaking' ? 'bg-indigo-400' : ''}
            ${status === 'idle' ? 'bg-slate-500' : ''}
            ${status === 'error' ? 'bg-red-400' : ''}
          `}
        />
        <span
          className={`
            relative inline-flex rounded-full h-2 w-2
            ${status === 'listening' ? 'bg-green-400' : ''}
            ${status === 'processing' ? 'bg-amber-400' : ''}
            ${status === 'speaking' ? 'bg-indigo-400' : ''}
            ${status === 'idle' ? 'bg-slate-500' : ''}
            ${status === 'error' ? 'bg-red-400' : ''}
          `}
        />
      </span>

      {/* Thinking dots for processing state */}
      {status === 'processing' && (
        <div className="flex items-center gap-1">
          <span className="thinking-dot w-1.5 h-1.5 bg-amber-400 rounded-full" />
          <span className="thinking-dot w-1.5 h-1.5 bg-amber-400 rounded-full" />
          <span className="thinking-dot w-1.5 h-1.5 bg-amber-400 rounded-full" />
        </div>
      )}

      {/* Waveform for speaking */}
      {status === 'speaking' && (
        <div className="flex items-center gap-0.5 h-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={`wave-${i}`}
              className="wave-bar w-0.5 bg-indigo-400 rounded-full h-full origin-bottom"
            />
          ))}
        </div>
      )}

      <span className={`text-xs font-medium ${config.color}`}>{config.label}</span>
    </div>
  );
}