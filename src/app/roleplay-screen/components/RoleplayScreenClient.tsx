'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { useSpeechRecognition } from '@/frontend/hooks/useSpeechRecognition';
import { useSpeechSynthesis } from '@/frontend/hooks/useSpeechSynthesis';
import { useTimer } from '@/frontend/hooks/useTimer';
import { DEFAULT_PROTOCOL_ITEMS, findScenario } from '@/backend/models/scenario.model';
import { setPendingSession } from '@/frontend/services/storage.service';
import { sendChatMessage } from '@/frontend/services/chat.service';
import { fetchTTSAudio } from '@/frontend/services/tts.service';
import type { TranscriptTurn, ProtocolItem, AIStatus, Scenario } from '@/types';
import TranscriptPanel from './TranscriptPanel';
import VoiceControls from './VoiceControls';
import type { TTSVoice } from './VoiceControls';
import ProtocolChecklist from './ProtocolChecklist';
import SessionHeader from './SessionHeader';
import AIStatusBadge from './AIStatusBadge';
import EndSessionModal from './EndSessionModal';
import { ClipboardList, X } from 'lucide-react';


export default function RoleplayScreenClient() {
  const router = useRouter();
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [transcript, setTranscript] = useState<TranscriptTurn[]>([]);
  const [protocolItems, setProtocolItems] = useState<ProtocolItem[]>(DEFAULT_PROTOCOL_ITEMS);
  const [aiStatus, setAiStatus] = useState<AIStatus>('idle');
  const [showEndModal, setShowEndModal] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [showProtocol, setShowProtocol] = useState(false);
  const [lastAiText, setLastAiText] = useState<string | null>(null);
  const [isReplaying, setIsReplaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<TTSVoice>('nova');
  const replayAudioRef = useRef<HTMLAudioElement | null>(null);
  const selectedVoiceRef = useRef<TTSVoice>('nova');

  const timer = useTimer();
  const speech = useSpeechRecognition();
  const synth = useSpeechSynthesis();
  const isProcessingRef = useRef(false);
  const sessionIdRef = useRef(uuidv4());

  // Load scenario from sessionStorage
  useEffect(() => {
    const id = sessionStorage.getItem('selected_scenario') ?? 'sim-replacement';
    setScenario(findScenario(id));
  }, []);

  // Auto-start AI first turn once scenario is loaded
  useEffect(() => {
    if (scenario && !sessionStarted) {
      setSessionStarted(true);
      timer.start();
      triggerAITurn([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  // Update interim text while recording
  useEffect(() => {
    if (speech.isListening) {
      setInterimText(speech.transcript);
    }
  }, [speech.transcript, speech.isListening]);

  const checkProtocol = useCallback((text: string) => {
    const lower = text.toLowerCase();
    setProtocolItems((prev) =>
      prev.map((item) => {
        if (item.checked) return item;
        const hit = item.keywords.some((kw) => lower.includes(kw));
        return hit ? { ...item, checked: true } : item;
      })
    );
  }, []);

  const triggerAITurn = useCallback(
    async (currentTranscript: TranscriptTurn[]) => {
      if (!scenario || isProcessingRef.current) return;
      isProcessingRef.current = true;
      setAiStatus('processing');

      try {
        const { text } = await sendChatMessage({
          scenarioId: scenario.id,
          transcript: currentTranscript,
        });

        const turn: TranscriptTurn = {
          id: `turn-ai-${Date.now()}`,
          speaker: 'ai',
          text,
          timestamp: Date.now(),
        };

        setTranscript((prev) => [...prev, turn]);
        setLastAiText(text);
        setAiStatus('speaking');

        // Use selected voice for AI speech via TTS API
        try {
          const blob = await fetchTTSAudio({ text, voice: selectedVoiceRef.current });
          const url = URL.createObjectURL(blob);

          if (replayAudioRef.current) {
            replayAudioRef.current.pause();
            URL.revokeObjectURL(replayAudioRef.current.src);
          }

          const audio = new Audio(url);
          replayAudioRef.current = audio;

          await new Promise<void>((resolve) => {
            audio.onended = () => {
              URL.revokeObjectURL(url);
              resolve();
            };
            audio.onerror = () => {
              URL.revokeObjectURL(url);
              synth.speak(text).then(resolve).catch(resolve);
            };
            audio.play().catch(() => {
              URL.revokeObjectURL(url);
              synth.speak(text).then(resolve).catch(resolve);
            });
          });
        } catch {
          // Fallback to browser speech synthesis
          await synth.speak(text);
        }

        setAiStatus('idle');
      } catch (err) {
        console.error('AI turn error:', err);
        setAiStatus('error');
        toast.error('AI response failed. Check your API key in .env.local and try again.');
      } finally {
        isProcessingRef.current = false;
      }
    },
    [scenario, synth]
  );

  const handleReplay = useCallback(async () => {
    if (!lastAiText || isReplaying || aiStatus !== 'idle') return;
    setIsReplaying(true);
    setAiStatus('speaking');

    const voiceToUse = selectedVoiceRef.current;

    try {
      const blob = await fetchTTSAudio({ text: lastAiText, voice: voiceToUse });
      const url = URL.createObjectURL(blob);

      if (replayAudioRef.current) {
        replayAudioRef.current.pause();
        URL.revokeObjectURL(replayAudioRef.current.src);
      }

      const audio = new Audio(url);
      replayAudioRef.current = audio;

      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => {
          synth.speak(lastAiText!).then(resolve);
        };
        audio.play().catch(() => {
          synth.speak(lastAiText!).then(resolve);
        });
      });

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Replay error:', err);
      try {
        await synth.speak(lastAiText);
      } catch {
        toast.error('Replay failed. Please try again.');
      }
    } finally {
      setIsReplaying(false);
      setAiStatus('idle');
    }
  }, [lastAiText, isReplaying, aiStatus, synth]);

  const handleStartRecording = useCallback(() => {
    if (aiStatus !== 'idle' || speech.isListening) return;
    synth.stop();
    speech.startListening();
    setAiStatus('listening');
  }, [aiStatus, speech, synth]);

  const handleStopRecording = useCallback(async () => {
    if (!speech.isListening) return;
    setAiStatus('processing');
    const spokenText = await speech.stopListening();
    setInterimText('');

    if (!spokenText.trim()) {
      setAiStatus('idle');
      return;
    }

    const candidateTurn: TranscriptTurn = {
      id: `turn-candidate-${Date.now()}`,
      speaker: 'candidate',
      text: spokenText.trim(),
      timestamp: Date.now(),
    };

    checkProtocol(spokenText);

    setTranscript((prev) => {
      const updated = [...prev, candidateTurn];
      triggerAITurn(updated);
      return updated;
    });
  }, [speech, checkProtocol, triggerAITurn]);

  const handleEndSession = useCallback(() => {
    setShowEndModal(true);
  }, []);

  const confirmEndSession = useCallback(async () => {
    timer.stop();
    synth.stop();
    setShowEndModal(false);

    const completedItems = protocolItems.filter((p) => p.checked).length;
    const protocolCompletion = Math.round((completedItems / protocolItems.length) * 100);

    setPendingSession({
      id: sessionIdRef.current,
      scenarioId: scenario?.id ?? 'sim-replacement',
      scenarioTitle: scenario?.title ?? '',
      startedAt: Date.now() - timer.elapsed * 1000,
      duration: timer.elapsed,
      turns: transcript.length,
      transcript,
      protocolItems,
    });

    sessionStorage.setItem('pending_protocol_completion', String(protocolCompletion));

    router.push('/score-screen');
  }, [timer, synth, protocolItems, scenario, transcript, router]);

  const handleVoiceChange = useCallback((voice: TTSVoice) => {
    setSelectedVoice(voice);
    selectedVoiceRef.current = voice;
  }, []);

  const handleStopAudio = useCallback(() => {
    // Stop browser speech synthesis
    synth.stop();
    // Stop TTS replay audio if playing
    if (replayAudioRef.current) {
      replayAudioRef.current.pause();
      replayAudioRef.current.currentTime = 0;
    }
    setIsReplaying(false);
    setAiStatus('idle');
    isProcessingRef.current = false;
  }, [synth]);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Loading scenario...</p>
        </div>
      </div>
    );
  }

  const checkedCount = protocolItems.filter((i) => i.checked).length;
  const protocolCompletion = Math.round((checkedCount / protocolItems.length) * 100);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <SessionHeader
        scenario={scenario}
        timerFormatted={timer.formatted}
        turnCount={transcript.length}
        onEnd={handleEndSession}
        aiStatus={aiStatus}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Transcript + Controls */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* AI Status + Protocol Toggle (mobile) */}
          <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-3 border-b border-slate-800 flex items-center justify-between gap-3">
            <AIStatusBadge status={aiStatus} customerName={scenario.customer.name} />
            {/* Mobile protocol toggle */}
            <button
              onClick={() => setShowProtocol(!showProtocol)}
              className="lg:hidden flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 transition-colors flex-shrink-0"
            >
              <ClipboardList size={13} className="text-violet-400" />
              <span>Protocol</span>
              <span className={`text-xs font-bold font-mono-data ${protocolCompletion === 100 ? 'text-emerald-400' : 'text-slate-400'}`}>
                {protocolCompletion}%
              </span>
            </button>
          </div>

          {/* Transcript */}
          <div className="flex-1 overflow-hidden">
            <TranscriptPanel
              transcript={transcript}
              interimText={interimText}
              isListening={speech.isListening}
              customerName={scenario.customer.name}
            />
          </div>

          {/* Voice Controls */}
          <VoiceControls
            aiStatus={aiStatus}
            isListening={speech.isListening}
            isSupported={speech.isSupported}
            error={speech.error}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onEnd={handleEndSession}
            onReplay={handleReplay}
            canReplay={!!lastAiText}
            isReplaying={isReplaying}
            onVoiceChange={handleVoiceChange}
            selectedVoice={selectedVoice}
            onStopAudio={handleStopAudio}
          />
        </div>

        {/* Protocol Sidebar - desktop always visible, mobile as overlay */}
        <div className={`
          ${showProtocol ? 'flex' : 'hidden'} lg:flex
          flex-col
          fixed lg:relative inset-0 lg:inset-auto z-40 lg:z-auto
          w-full lg:w-72 xl:w-80
          bg-slate-900 lg:border-l border-slate-800
          overflow-y-auto
        `}>
          {/* Mobile close button */}
          <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950">
            <span className="text-sm font-semibold text-slate-200">Protocol Checklist</span>
            <button
              onClick={() => setShowProtocol(false)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400"
            >
              <X size={16} />
            </button>
          </div>
          <ProtocolChecklist
            items={protocolItems}
            onToggle={() => setShowProtocol(!showProtocol)}
          />
        </div>
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <EndSessionModal
          turnCount={transcript.length}
          duration={timer.formatted}
          onConfirm={confirmEndSession}
          onCancel={() => setShowEndModal(false)}
        />
      )}
    </div>
  );
}