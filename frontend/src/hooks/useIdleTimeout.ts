import { useEffect, useRef, useState, useCallback } from 'react';

interface UseIdleTimeoutOptions {
  /** Tempo total de inatividade (ms) antes de forçar o logout. */
  timeout: number;
  /** Tempo (ms) antes do logout em que o aviso aparece. */
  warningBefore: number;
  /** Função executada quando o tempo total expira. */
  onTimeout: () => void;
  /** Se false, o timer fica desligado. */
  enabled: boolean;
}

export function useIdleTimeout({
  timeout,
  warningBefore,
  onTimeout,
  enabled,
}: UseIdleTimeoutOptions) {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const warningActiveRef = useRef(false);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const clearTimers = useCallback(() => {
    if (idleTimerRef.current) {
      clearTimeout(idleTimerRef.current);
      idleTimerRef.current = null;
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  }, []);

  const startWarning = useCallback(() => {
    warningActiveRef.current = true;
    setShowWarning(true);
    setSecondsLeft(Math.floor(warningBefore / 1000));

    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearTimers();
          warningActiveRef.current = false;
          onTimeoutRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [warningBefore, clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    warningActiveRef.current = false;
    setShowWarning(false);

    if (!enabled) return;

    idleTimerRef.current = setTimeout(() => {
      startWarning();
    }, timeout - warningBefore);
  }, [timeout, warningBefore, clearTimers, startWarning, enabled]);

  useEffect(() => {
    if (!enabled) {
      clearTimers();
      setShowWarning(false);
      warningActiveRef.current = false;
      return;
    }

    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const handleActivity = () => {
      if (!warningActiveRef.current) {
        reset();
      }
    };

    events.forEach((event) => window.addEventListener(event, handleActivity));
    reset();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      clearTimers();
    };
  }, [enabled, reset, clearTimers]);

  return { showWarning, secondsLeft, reset };
}