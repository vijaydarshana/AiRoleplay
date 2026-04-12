'use client';
import { useState, useEffect } from 'react';
import { X, Key, ExternalLink, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

const STORAGE_KEY = 'elevenlabs_api_key';

export function getStoredElevenLabsKey(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}

export function clearStoredElevenLabsKey(): void {
  if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
}

export default function ElevenLabsSetupModal({ isOpen, onClose, onSaved }: Props) {
  const [apiKey, setApiKey] = useState('');
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const stored = getStoredElevenLabsKey();
      if (stored) setApiKey(stored);
      setStatus('idle');
      setErrorMsg('');
    }
  }, [isOpen]);

  const handleTest = async () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setErrorMsg('Please enter your API key.');
      setStatus('error');
      return;
    }
    setStatus('testing');
    setErrorMsg('');
    try {
      const res = await fetch('/api/elevenlabs-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: trimmed }),
      });
      const data = await res.json() as { ok?: boolean; error?: string };
      if (res.ok && data.ok) {
        localStorage.setItem(STORAGE_KEY, trimmed);
        setStatus('success');
        setTimeout(() => {
          onSaved();
          onClose();
        }, 1200);
      } else {
        setErrorMsg(data.error ?? 'Invalid API key. Please check and try again.');
        setStatus('error');
      }
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
      setStatus('error');
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Key size={15} className="text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">ElevenLabs Voice Setup</h2>
              <p className="text-[10px] text-slate-500">Required for AI voice playback</p>
            </div>
          </div>
          <button
            onClick={handleSkip}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            This app uses ElevenLabs for realistic AI voice. Enter your free API key below — it&apos;s stored only in your browser and never sent to our servers.
          </p>

          {/* Steps */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3.5 space-y-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">How to get your free key</p>
            {[
              { step: '1', text: 'Go to elevenlabs.io and create a free account' },
              { step: '2', text: 'Click your profile → API Keys' },
              { step: '3', text: 'Copy your key and paste it below' },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-2.5">
                <span className="flex-shrink-0 w-4 h-4 bg-violet-600/30 text-violet-400 rounded-full flex items-center justify-center text-[9px] font-bold mt-0.5">
                  {item.step}
                </span>
                <span className="text-xs text-slate-400 leading-relaxed">{item.text}</span>
              </div>
            ))}
            <a
              href="https://elevenlabs.io/app/settings/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[10px] text-violet-400 hover:text-violet-300 font-semibold mt-1 transition-colors"
            >
              <ExternalLink size={10} />
              Open ElevenLabs API Keys →
            </a>
          </div>

          {/* Input */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Your API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => { setApiKey(e.target.value); setStatus('idle'); setErrorMsg(''); }}
                placeholder="sk_..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 pr-16 font-mono"
                onKeyDown={(e) => { if (e.key === 'Enter') handleTest(); }}
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-500 hover:text-slate-300 font-semibold transition-colors"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Status messages */}
          {status === 'error' && errorMsg && (
            <div className="flex items-start gap-2 bg-red-950/40 border border-red-700/40 rounded-xl px-3 py-2.5">
              <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-300">{errorMsg}</p>
            </div>
          )}
          {status === 'success' && (
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-700/40 rounded-xl px-3 py-2.5">
              <CheckCircle size={13} className="text-emerald-400 flex-shrink-0" />
              <p className="text-xs text-emerald-300 font-semibold">API key verified and saved!</p>
            </div>
          )}

          <p className="text-[10px] text-slate-600 leading-relaxed">
            🔒 Your key is stored locally in your browser only. Free tier includes 10,000 characters/month.
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            Skip (use browser voice)
          </button>
          <button
            onClick={handleTest}
            disabled={status === 'testing' || status === 'success' || !apiKey.trim()}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
          >
            {status === 'testing' ? (
              <><Loader2 size={13} className="animate-spin" /> Verifying...</>
            ) : status === 'success' ? (
              <><CheckCircle size={13} /> Saved!</>
            ) : (
              'Verify & Save'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
