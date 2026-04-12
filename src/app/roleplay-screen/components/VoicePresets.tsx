'use client';
import { useState, useEffect, useCallback } from 'react';
import { Bookmark, BookmarkCheck, Trash2, Plus, X } from 'lucide-react';
import type { TTSVoice } from '@/frontend/services/tts.service';

export interface VoicePreset {
  id: string;
  name: string;
  voice: TTSVoice;
  createdAt: number;
}

const STORAGE_KEY = 'roleplay_voice_presets';

function loadPresets(): VoicePreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as VoicePreset[]) : [];
  } catch {
    return [];
  }
}

function savePresets(presets: VoicePreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch {
    // storage quota exceeded — ignore
  }
}

interface Props {
  selectedVoice: TTSVoice;
  onLoadPreset: (voice: TTSVoice) => void;
}

export default function VoicePresets({ selectedVoice, onLoadPreset }: Props) {
  const [presets, setPresets] = useState<VoicePreset[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setPresets(loadPresets());
  }, []);

  const handleSave = useCallback(() => {
    const name = presetName.trim();
    if (!name) return;

    const newPreset: VoicePreset = {
      id: `preset-${Date.now()}`,
      name,
      voice: selectedVoice,
      createdAt: Date.now(),
    };

    setPresets((prev) => {
      const updated = [...prev, newPreset];
      savePresets(updated);
      return updated;
    });

    setPresetName('');
    setIsAdding(false);
  }, [presetName, selectedVoice]);

  const handleDelete = useCallback((id: string) => {
    setPresets((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      savePresets(updated);
      return updated;
    });
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') { setIsAdding(false); setPresetName(''); }
    },
    [handleSave]
  );

  if (!mounted) return null;

  return (
    <div className="mb-4 sm:mb-5">
      {/* Header row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Bookmark size={10} className="text-amber-400" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Voice Presets</span>
        </div>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            title="Save current voice as preset"
            className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-400/50 text-amber-400 transition-all duration-150"
          >
            <Plus size={9} />
            Save
          </button>
        )}
      </div>

      {/* Save input */}
      {isAdding && (
        <div className="flex items-center gap-1.5 mb-2">
          <input
            autoFocus
            type="text"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Preset name…"
            maxLength={24}
            className="flex-1 bg-slate-800 border border-slate-600 focus:border-amber-500/60 rounded-lg px-2.5 py-1 text-xs text-slate-200 placeholder-slate-600 outline-none transition-colors"
          />
          <button
            onClick={handleSave}
            disabled={!presetName.trim()}
            className="p-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Confirm save"
          >
            <BookmarkCheck size={13} />
          </button>
          <button
            onClick={() => { setIsAdding(false); setPresetName(''); }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-500 transition-all"
            title="Cancel"
          >
            <X size={13} />
          </button>
        </div>
      )}

      {/* Preset list */}
      {presets.length === 0 && !isAdding ? (
        <p className="text-center text-[10px] text-slate-700 font-medium">
          No presets saved yet · Click &quot;Save&quot; to store your current voice
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5 justify-center">
          {presets.map((preset) => {
            const isActive = preset.voice === selectedVoice;
            return (
              <div
                key={preset.id}
                className={`
                  flex items-center gap-1 pl-2.5 pr-1 py-0.5 rounded-full border text-[10px] font-semibold transition-all duration-150
                  ${isActive
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' :'bg-slate-800/80 border-slate-700/60 text-slate-400'
                  }
                `}
              >
                <button
                  onClick={() => onLoadPreset(preset.voice)}
                  title={`Load: ${preset.voice}`}
                  className="hover:text-white transition-colors"
                >
                  {preset.name}
                </button>
                <button
                  onClick={() => handleDelete(preset.id)}
                  title="Delete preset"
                  className="ml-0.5 p-0.5 rounded-full hover:bg-red-500/20 hover:text-red-400 text-slate-600 transition-all"
                >
                  <Trash2 size={9} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
