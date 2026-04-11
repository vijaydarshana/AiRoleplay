'use client';
import { useState, useRef, useCallback, useEffect } from 'react';

interface TimerHook {
  elapsed: number; // seconds
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  formatted: string;
}

export function useTimer(): TimerHook {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);

  const start = useCallback(() => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
      setIsRunning(true);
    }
  }, [isRunning]);

  const stop = useCallback(() => {
    if (isRunning) {
      accumulatedRef.current += Math.floor((Date.now() - startTimeRef.current) / 1000);
      setIsRunning(false);
    }
  }, [isRunning]);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
    accumulatedRef.current = 0;
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        const current = accumulatedRef.current + Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed(current);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
  const secs = (elapsed % 60).toString().padStart(2, '0');
  const formatted = `${mins}:${secs}`;

  return { elapsed, isRunning, start, stop, reset, formatted };
}
