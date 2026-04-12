'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SCENARIOS } from '@/backend/models/scenario.model';
import { getSessionsWithCloud } from '@/frontend/services/storage.service';
import type { Scenario, SessionRecord } from '@/types';
import ScenarioCard from './ScenarioCard';
import CustomerPersonaCard from './CustomerPersonaCard';
import ProtocolPreview from './ProtocolPreview';
import SessionHistoryPanel from './SessionHistoryPanel';
import AppLogo from '@/components/ui/AppLogo';
import ElevenLabsSetupModal, { getStoredElevenLabsKey } from '@/components/ui/ElevenLabsSetupModal';
import { Play, BarChart2, ChevronRight, ChevronDown, ChevronUp, Sparkles, Zap, Key, CheckCircle } from 'lucide-react';

export default function HomeScreenClient() {
  const router = useRouter();
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [starting, setStarting] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    getSessionsWithCloud().then(setSessions).catch(() => {});
    // Check localStorage first, then fall back to server-side env key check
    if (getStoredElevenLabsKey()) {
      setHasApiKey(true);
    } else {
      fetch('/api/elevenlabs-setup')
        .then((r) => r.json())
        .then((data: { configured?: boolean }) => {
          if (data.configured) setHasApiKey(true);
        })
        .catch(() => {});
    }
  }, []);

  const handleStart = () => {
    setStarting(true);
    // Store selected scenario in sessionStorage before navigating
    sessionStorage.setItem('selected_scenario', selectedScenario.id);
    setTimeout(() => {
      router.push('/roleplay-screen');
    }, 300);
  };

  const handleSetupSaved = () => {
    setHasApiKey(true);
  };

  const difficultyColor: Record<string, string> = {
    Beginner: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Intermediate: 'bg-amber-100 text-amber-700 border-amber-200',
    Advanced: 'bg-red-100 text-red-700 border-red-200',
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb]">
      {/* Top Navigation */}
      <header className="bg-white/90 backdrop-blur border-b border-slate-200/80 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <AppLogo size={30} />
            <span className="font-bold text-base sm:text-lg text-slate-900 tracking-tight">
              RoleplayAssess
            </span>
            <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 ml-1 gap-1">
              <Sparkles size={10} />
              AI-Powered
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {/* ElevenLabs setup button */}
            <button
              onClick={() => setShowSetupModal(true)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                hasApiKey
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' :'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
              }`}
              title={hasApiKey ? 'ElevenLabs configured — click to update' : 'Set up ElevenLabs voice'}
            >
              {hasApiKey ? <CheckCircle size={12} /> : <Key size={12} />}
              <span className="hidden sm:inline">{hasApiKey ? 'Voice Ready' : 'Setup Voice'}</span>
            </button>
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5">
              <BarChart2 size={13} className="text-indigo-500" />
              <span className="text-xs font-semibold text-slate-700">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </header>

      {/* ElevenLabs setup banner (shown when key not configured) */}
      {!hasApiKey && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Key size={13} className="text-amber-600 flex-shrink-0" />
              <p className="text-xs text-amber-800">
                <span className="font-semibold">Set up ElevenLabs</span> for realistic AI voice — free tier available.
              </p>
            </div>
            <button
              onClick={() => setShowSetupModal(true)}
              className="flex-shrink-0 text-xs font-bold text-amber-700 hover:text-amber-900 underline underline-offset-2 transition-colors"
            >
              Configure →
            </button>
          </div>
        </div>
      )}

      <main className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 py-6 sm:py-10 lg:py-14">
        {/* Hero Section */}
        <div className="mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-full px-3 py-1 mb-4">
            <Zap size={12} className="text-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">AI Training Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
            Customer Service<br className="sm:hidden" /> Roleplay Assessment
          </h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-xl leading-relaxed">
            Practice real telecom store scenarios with an AI customer. Get scored instantly across 5 performance criteria.
          </p>

          {/* Stats bar */}
          <div className="flex gap-3 mt-6 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible scrollbar-hide">
            {[
              { label: 'Scenarios', value: '3', icon: '🎭', accent: 'from-violet-50 to-indigo-50 border-indigo-100' },
              { label: 'Avg. Duration', value: '10 min', icon: '⏱️', accent: 'from-blue-50 to-cyan-50 border-blue-100' },
              { label: 'AI Scoring', value: '5 Criteria', icon: '📊', accent: 'from-emerald-50 to-teal-50 border-emerald-100' },
              { label: 'Feedback', value: 'Real-time', icon: '⚡', accent: 'from-amber-50 to-orange-50 border-amber-100' },
            ].map((stat) => (
              <div
                key={`stat-${stat.label}`}
                className={`flex items-center gap-2.5 bg-gradient-to-br ${stat.accent} border rounded-xl px-3.5 py-2.5 flex-shrink-0 shadow-sm`}
              >
                <span className="text-lg">{stat.icon}</span>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider whitespace-nowrap">{stat.label}</div>
                  <div className="text-xs sm:text-sm font-bold text-slate-800 whitespace-nowrap">{stat.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-5 lg:gap-8">
          {/* Left: Scenario Selection + Persona */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-5 sm:space-y-6">
            {/* Scenario Selector */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-indigo-500 rounded-full" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-widest">
                  Choose Your Scenario
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {SCENARIOS.map((scenario) => (
                  <ScenarioCard
                    key={`scenario-${scenario.id}`}
                    scenario={scenario}
                    isSelected={selectedScenario.id === scenario.id}
                    onSelect={() => setSelectedScenario(scenario)}
                    difficultyColor={difficultyColor}
                  />
                ))}
              </div>
            </div>

            {/* Customer Persona Card */}
            <CustomerPersonaCard scenario={selectedScenario} />

            {/* Objectives */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2.5 text-sm sm:text-base">
                <span className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-lg flex items-center justify-center text-xs font-bold shadow-sm">✓</span>
                Session Objectives
              </h3>
              <div className="space-y-2.5">
                {selectedScenario.objectives.map((obj, i) => (
                  <div key={`obj-${selectedScenario.id}-${i}`} className="flex items-start gap-3 group">
                    <span className="flex-shrink-0 w-5 h-5 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-slate-600 leading-relaxed">{obj}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
              <h3 className="font-bold text-white mb-5 relative">How It Works</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
                {[
                  {
                    step: '01',
                    title: 'AI Speaks First',
                    desc: 'The AI customer initiates the conversation. Listen carefully to their problem.',
                    gradient: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/30',
                    numColor: 'text-indigo-400',
                  },
                  {
                    step: '02',
                    title: 'You Respond',
                    desc: 'Hold the microphone button to speak your response as the store executive.',
                    gradient: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30',
                    numColor: 'text-cyan-400',
                  },
                  {
                    step: '03',
                    title: 'Get Scored',
                    desc: 'End the session anytime. AI evaluates your performance across 5 criteria.',
                    gradient: 'from-violet-500/20 to-violet-600/10 border-violet-500/30',
                    numColor: 'text-violet-400',
                  },
                ].map((step) => (
                  <div key={`step-${step.step}`} className={`bg-gradient-to-br ${step.gradient} border rounded-xl p-4`}>
                    <span className={`text-2xl font-black font-mono-data ${step.numColor} block mb-2 leading-none`}>
                      {step.step}
                    </span>
                    <div className="text-sm font-semibold text-white mb-1">{step.title}</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{step.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Sidebar Toggle */}
            <div className="lg:hidden">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <span>Protocol &amp; Session History</span>
                {showSidebar ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showSidebar && (
                <div className="mt-3 space-y-4">
                  <ProtocolPreview />
                  <SessionHistoryPanel sessions={sessions} />
                </div>
              )}
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-white font-bold text-base py-4 rounded-2xl shadow-lg shadow-indigo-300/40 transition-all duration-200 flex items-center justify-center gap-3 group"
            >
              {/* Shine effect */}
              <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              {starting ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  <span>Starting Session...</span>
                </>
              ) : (
                <>
                  <Play size={20} className="fill-white" />
                  <span className="truncate">Start Roleplay — {selectedScenario.title}</span>
                  <ChevronRight size={18} className="flex-shrink-0 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-400 -mt-2">
              No login required · Session auto-saved · Works on Chrome desktop &amp; mobile
            </p>
          </div>

          {/* Right Sidebar: Protocol + History (desktop only) */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <ProtocolPreview />
            <SessionHistoryPanel sessions={sessions} />
          </div>
        </div>
      </main>

      <ElevenLabsSetupModal
        isOpen={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        onSaved={handleSetupSaved}
      />
    </div>
  );
}