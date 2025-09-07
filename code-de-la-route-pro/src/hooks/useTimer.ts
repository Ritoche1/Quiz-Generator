import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseTimerReturn {
  timeRemaining: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: () => void;
  restart: () => void;
}

/**
 * Custom hook for countdown timer
 * @param initialTime - initial time in seconds
 * @param onTimeUp - callback when timer reaches 0
 * @returns timer controls and state
 */
export function useTimer(
  initialTime: number,
  onTimeUp?: () => void
): UseTimerReturn {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  // Update the ref when onTimeUp changes
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Timer effect
  useEffect(() => {
    if (isRunning && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            // Call onTimeUp callback if provided
            if (onTimeUpRef.current) {
              onTimeUpRef.current();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeRemaining]);

  const start = useCallback(() => {
    if (timeRemaining > 0) {
      setIsRunning(true);
    }
  }, [timeRemaining]);

  const stop = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setTimeRemaining(initialTime);
  }, [initialTime]);

  const restart = useCallback(() => {
    setTimeRemaining(initialTime);
    setIsRunning(true);
  }, [initialTime]);

  return {
    timeRemaining,
    isRunning,
    start,
    stop,
    reset,
    restart,
  };
}