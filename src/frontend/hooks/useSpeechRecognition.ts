'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

export interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  pendingTranscript: string;
  startListening: () => void;
  stopListening: (onResult?: (text: string) => void) => void;
  sendPending: (onResult: (text: string) => void) => void;
  clearPending: () => void;
  isSupported: boolean;
  error: string | null;
  permissionDenied: boolean;
}

// ─── Web Speech API types ─────────────────────────────────────────────────────
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

function getWebSpeechAPI(): (new () => SpeechRecognitionInstance) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as Record<string, unknown>;
  return (w['SpeechRecognition'] as (new () => SpeechRecognitionInstance)) ||
    (w['webkitSpeechRecognition'] as (new () => SpeechRecognitionInstance)) ||
    null;
}

// Detect mobile browsers — on mobile, Web Speech API auto-ends after silence
// and restarting causes the "speak again" prompt loop
function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile|webOS/i.test(navigator.userAgent);
}

// ─── MIME type selection ──────────────────────────────────────────────────────
function getBestMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];
  for (const type of candidates) {
    try {
      if (MediaRecorder.isTypeSupported(type)) return type;
    } catch { /* ignore */ }
  }
  return '';
}

// ─── Whisper transcription ────────────────────────────────────────────────────
async function transcribeViaWhisper(audioBlob: Blob, mimeType: string): Promise<string> {
  let ext = 'webm';
  if (mimeType.includes('mp4') || mimeType.includes('m4a')) ext = 'mp4';
  else if (mimeType.includes('ogg')) ext = 'ogg';
  else if (mimeType.includes('wav')) ext = 'wav';

  const formData = new FormData();
  formData.append('audio', audioBlob, `recording.${ext}`);

  const res = await fetch('/api/whisper', { method: 'POST', body: formData });
  if (!res.ok) {
    let errMsg = 'Transcription failed';
    try {
      const errData = await res.json() as { error?: string };
      if (errData?.error) errMsg = errData.error;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }
  const data = await res.json() as { text?: string };
  return (data.text ?? '').trim();
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [pendingTranscript, setPendingTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Web Speech API refs
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const finalTranscriptRef = useRef<string>('');
  const interimTranscriptRef = useRef<string>(''); // track interim for mobile fallback
  const onResultCallbackRef = useRef<((text: string) => void) | null>(null);
  const isStoppingRef = useRef(false);
  const recognitionEndedRef = useRef(false);

  // MediaRecorder fallback refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>('');

  // Determine which path to use
  const WebSpeechAPI = typeof window !== 'undefined' ? getWebSpeechAPI() : null;
  const hasWebSpeech = !!WebSpeechAPI;
  const hasMediaRecorder =
    typeof window !== 'undefined' &&
    !!navigator?.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined';

  const isSupported = hasWebSpeech || hasMediaRecorder;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try { recognitionRef.current?.abort(); } catch { /* ignore */ }
      try { mediaRecorderRef.current?.stop(); } catch { /* ignore */ }
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // ── Web Speech API path ────────────────────────────────────────────────────
  const startWebSpeech = useCallback(() => {
    if (!WebSpeechAPI) return;

    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    isStoppingRef.current = false;
    recognitionEndedRef.current = false;
    // Clear any previous pending transcript when starting fresh
    setPendingTranscript('');

    const recognition = new WebSpeechAPI();
    recognition.lang = 'en-US';
    recognition.continuous = !isMobileBrowser(); // mobile: false prevents "speak again" loop
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      console.log('[useSpeechRecognition] Web Speech API started');
    };

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let interim = '';
      let final = finalTranscriptRef.current;
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const result = e.results[i];
        const best = result[0].transcript;
        if (result.isFinal) {
          final += best + ' ';
        } else {
          interim += best;
        }
      }
      finalTranscriptRef.current = final;
      interimTranscriptRef.current = interim;
      // Show live interim text in the UI via transcript state
      setTranscript((final + interim).trim());
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.warn('[useSpeechRecognition] Web Speech error:', e.error);
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setPermissionDenied(true);
        setError('Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (e.error === 'no-speech') {
        // Not a fatal error — just no speech detected yet
      } else if (e.error === 'network') {
        setError('Network error during speech recognition. Please check your connection.');
      } else if (e.error === 'aborted') {
        // Intentional stop — ignore
      } else {
        setError(`Speech recognition error: ${e.error}`);
      }
    };

    recognition.onend = () => {
      recognitionEndedRef.current = true;
      setIsListening(false);

      // On mobile (iOS Safari), isFinal results are often not fired before onend.
      // Use interim transcript as fallback when final is empty.
      const finalText = finalTranscriptRef.current.trim();
      const interimText = interimTranscriptRef.current.trim();
      const result = finalText || interimText;

      console.log('[useSpeechRecognition] Web Speech result (final:', finalText, ', interim fallback:', interimText, ')');
      setTranscript(result);
      const cb = onResultCallbackRef.current;

      if (isStoppingRef.current) {
        // User intentionally stopped via stopListening — fire callback immediately
        onResultCallbackRef.current = null;
        cb?.(result);
      } else if (isMobileBrowser()) {
        // Mobile auto-end: store as pending so user can review and manually send
        // Do NOT fire the callback yet — wait for sendPending()
        if (result) {
          setPendingTranscript(result);
          console.log('[useSpeechRecognition] Mobile auto-end — stored as pending:', result);
        } else {
          // No speech captured — fire empty callback to reset state
          onResultCallbackRef.current = null;
          cb?.(result);
        }
      } else if (result) {
        // Desktop: unexpected end with result — fire callback
        onResultCallbackRef.current = null;
        cb?.(result);
      } else {
        // Desktop only: Unexpected end with no result — restart silently
        try {
          recognition.start();
          recognitionEndedRef.current = false;
        } catch {
          onResultCallbackRef.current = null;
          cb?.(result);
        }
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.error('[useSpeechRecognition] Failed to start Web Speech API:', err);
      setError('Could not start speech recognition. Please try again.');
      setIsListening(false);
    }
  }, [WebSpeechAPI]);

  const stopWebSpeech = useCallback((onResult?: (text: string) => void) => {
    isStoppingRef.current = true;
    if (onResult) onResultCallbackRef.current = onResult;

    const recognition = recognitionRef.current;
    if (!recognition) {
      // Already stopped
      setIsListening(false);
      const cb = onResultCallbackRef.current;
      onResultCallbackRef.current = null;
      const finalText = finalTranscriptRef.current.trim();
      const interimText = interimTranscriptRef.current.trim();
      cb?.(finalText || interimText);
      return;
    }

    if (recognitionEndedRef.current) {
      // Already ended — fire callback immediately
      setIsListening(false);
      const finalText = finalTranscriptRef.current.trim();
      const interimText = interimTranscriptRef.current.trim();
      const result = finalText || interimText;
      setTranscript(result);
      const cb = onResultCallbackRef.current;
      onResultCallbackRef.current = null;
      cb?.(result);
    } else {
      try {
        recognition.stop(); // triggers onend → fires callback
      } catch {
        setIsListening(false);
        const finalText = finalTranscriptRef.current.trim();
        const interimText = interimTranscriptRef.current.trim();
        const result = finalText || interimText;
        setTranscript(result);
        const cb = onResultCallbackRef.current;
        onResultCallbackRef.current = null;
        cb?.(result);
      }
    }
  }, []);

  // ── MediaRecorder + Whisper fallback path ──────────────────────────────────
  const startMediaRecorder = useCallback(() => {
    setError(null);
    setTranscript('');
    setPendingTranscript('');
    isStoppingRef.current = false;
    onResultCallbackRef.current = null;
    chunksRef.current = [];

    // Enhanced audio constraints for better low-volume speech capture
    const audioConstraints: MediaTrackConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      channelCount: 1,
      sampleRate: 48000,
      // @ts-ignore
      googAutoGainControl: true,
      // @ts-ignore
      googNoiseSuppression: true,
      // @ts-ignore
      googHighpassFilter: true,
    };

    navigator.mediaDevices
      .getUserMedia({ audio: audioConstraints })
      .then((stream) => {
        if (isStoppingRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          setIsListening(false);
          const cb = onResultCallbackRef.current;
          onResultCallbackRef.current = null;
          cb?.('');
          return;
        }

        streamRef.current = stream;
        chunksRef.current = [];
        const mimeType = getBestMimeType();
        mimeTypeRef.current = mimeType;

        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        } catch {
          recorder = new MediaRecorder(stream);
          mimeTypeRef.current = '';
        }
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e: BlobEvent) => {
          if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          setIsListening(false);

          const cb = onResultCallbackRef.current;
          onResultCallbackRef.current = null;
          const chunks = chunksRef.current;
          chunksRef.current = [];

          if (chunks.length === 0 || chunks.every((c) => c.size === 0)) {
            setError('No audio captured. Please check your microphone and try again.');
            cb?.('');
            return;
          }

          const blobType = mimeTypeRef.current || 'audio/webm';
          const audioBlob = new Blob(chunks, { type: blobType });
          console.log(`[useSpeechRecognition] Sending ${audioBlob.size} bytes to Whisper`);

          try {
            const text = await transcribeViaWhisper(audioBlob, blobType);
            console.log('[useSpeechRecognition] Whisper result:', text);
            setTranscript(text);
            cb?.(text);
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Transcription failed. Please try again.';
            console.error('[useSpeechRecognition] Whisper error:', msg);
            setError(msg);
            cb?.('');
          }
        };

        recorder.onerror = () => {
          stream.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
          setIsListening(false);
          setError('Recording error. Please try again.');
          const cb = onResultCallbackRef.current;
          onResultCallbackRef.current = null;
          cb?.('');
        };

        recorder.start(100);
        setIsListening(true);
        console.log('[useSpeechRecognition] MediaRecorder started (Whisper fallback)');
      })
      .catch((err: Error) => {
        setIsListening(false);
        isStoppingRef.current = false;
        if (
          err.name === 'NotAllowedError' ||
          err.name === 'PermissionDeniedError' ||
          err.name === 'SecurityError'
        ) {
          setPermissionDenied(true);
          setError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          setError('Microphone is in use by another application. Please close other apps and try again.');
        } else if (err.name === 'OverconstrainedError') {
          setError('Microphone does not meet the required audio constraints. Please try a different microphone.');
        } else {
          setError(`Could not access microphone: ${err.message}`);
        }
      });
  }, []);

  const stopMediaRecorder = useCallback((onResult?: (text: string) => void) => {
    if (onResult) onResultCallbackRef.current = onResult;
    isStoppingRef.current = true;

    let recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      try { recorder.requestData(); } catch { /* ignore */ }
      try {
        recorder.stop();
      } catch {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setIsListening(false);
        const cb = onResultCallbackRef.current;
        onResultCallbackRef.current = null;
        cb?.('');
      }
    } else {
      setIsListening(false);
      const cb = onResultCallbackRef.current;
      onResultCallbackRef.current = null;
      cb?.('');
    }
  }, []);

  // ── Public API ─────────────────────────────────────────────────────────────
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    if (isListening) return;

    setError(null);
    setPermissionDenied(false);
    setTranscript('');

    if (hasWebSpeech) {
      startWebSpeech();
    } else {
      startMediaRecorder();
    }
  }, [isSupported, isListening, hasWebSpeech, startWebSpeech, startMediaRecorder]);

  const stopListening = useCallback((onResult?: (text: string) => void) => {
    if (hasWebSpeech && recognitionRef.current) {
      stopWebSpeech(onResult);
    } else {
      stopMediaRecorder(onResult);
    }
  }, [hasWebSpeech, stopWebSpeech, stopMediaRecorder]);

  /** Send the pending transcript (mobile manual send) */
  const sendPending = useCallback((onResult: (text: string) => void) => {
    const text = pendingTranscript;
    setPendingTranscript('');
    setTranscript('');
    onResult(text);
  }, [pendingTranscript]);

  /** Clear pending transcript without sending */
  const clearPending = useCallback(() => {
    setPendingTranscript('');
    setTranscript('');
    finalTranscriptRef.current = '';
    interimTranscriptRef.current = '';
    onResultCallbackRef.current = null;
  }, []);

  return { isListening, transcript, pendingTranscript, startListening, stopListening, sendPending, clearPending, isSupported, error, permissionDenied };
}
