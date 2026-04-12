'use client';
import { useState, useRef, useCallback } from 'react';

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: () => void;
  stopListening: () => Promise<string>;
  isSupported: boolean;
  error: string | null;
}

/** Pick the best MIME type for the current browser/device */
function getBestMimeType(): string {
  if (typeof MediaRecorder === 'undefined') return '';
  // Prefer webm/opus (Chrome desktop/Android), fall back to mp4 (iOS Safari), then plain webm
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return '';
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const resolveRef = useRef<((value: string) => void) | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mimeTypeRef = useRef<string>('');

  // MediaRecorder is supported in all modern browsers (Chrome, Firefox, Safari 14.1+, Edge)
  const isSupported =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices &&
    typeof MediaRecorder !== 'undefined';

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Microphone access is not supported in this browser. Please use Chrome, Firefox, or Safari.');
      return;
    }

    setError(null);
    setTranscript('');
    chunksRef.current = [];

    // Mobile Chrome requires explicit audio constraints for best quality
    const audioConstraints: MediaStreamConstraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        sampleRate: 16000,
        channelCount: 1,
      },
    };

    navigator.mediaDevices
      .getUserMedia(audioConstraints)
      .then((stream) => {
        streamRef.current = stream;

        const mimeType = getBestMimeType();
        mimeTypeRef.current = mimeType;

        let recorder: MediaRecorder;
        try {
          recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
        } catch {
          // Fallback: let browser choose format
          recorder = new MediaRecorder(stream);
          mimeTypeRef.current = '';
        }
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        recorder.onstop = async () => {
          stopStream();
          setIsListening(false);

          if (chunksRef.current.length === 0) {
            resolveRef.current?.('');
            resolveRef.current = null;
            return;
          }

          // Use recorded mime type or fall back to webm
          const blobType = mimeTypeRef.current || 'audio/webm';
          const audioBlob = new Blob(chunksRef.current, { type: blobType });

          // Determine file extension for Whisper
          const ext = blobType.includes('mp4') ? 'mp4' : blobType.includes('ogg') ? 'ogg' : 'webm';
          const fileName = `audio.${ext}`;

          try {
            const formData = new FormData();
            formData.append('audio', audioBlob, fileName);

            const res = await fetch('/api/whisper', {
              method: 'POST',
              body: formData,
            });

            if (!res.ok) {
              const errData = await res.json().catch(() => ({}));
              throw new Error((errData as { error?: string })?.error ?? 'Transcription failed');
            }

            const data = await res.json() as { text?: string };
            const text: string = data.text ?? '';
            setTranscript(text);
            resolveRef.current?.(text);
          } catch (err) {
            console.error('[useSpeechRecognition] Whisper error:', err);
            setError('Transcription failed. Please try again.');
            resolveRef.current?.('');
          } finally {
            resolveRef.current = null;
          }
        };

        recorder.onerror = () => {
          stopStream();
          setIsListening(false);
          setError('Recording error. Please try again.');
          resolveRef.current?.('');
          resolveRef.current = null;
        };

        // Use timeslice for mobile — ensures data is collected even on short recordings
        recorder.start(250);
        setIsListening(true);
      })
      .catch((err: Error) => {
        console.error('[useSpeechRecognition] Mic access error:', err);
        stopStream();
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Microphone permission denied. Please tap the lock icon in your browser address bar and allow microphone access.');
        } else if (err.name === 'NotFoundError') {
          setError('No microphone found. Please connect a microphone and try again.');
        } else if (err.name === 'NotReadableError') {
          setError('Microphone is in use by another app. Please close other apps and try again.');
        } else {
          setError('Could not access microphone. Please check your browser settings.');
        }
        setIsListening(false);
      });
  }, [isSupported, stopStream]);

  const stopListening = useCallback((): Promise<string> => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else {
        resolve('');
        resolveRef.current = null;
      }
    });
  }, []);

  return { isListening, transcript, startListening, stopListening, isSupported, error };
}
