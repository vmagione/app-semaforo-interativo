import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playBeep, playChange, initSounds } from '../utils/audio';

export type Phase = 'red' | 'green';
export type Screen = 'main' | 'settings';

interface AppContextType {
  phase: Phase;
  timeLeft: number;
  isRunning: boolean;
  isLocked: boolean;
  pin: string;
  redDuration: number;
  greenDuration: number;
  showCountdown: boolean;
  currentScreen: Screen;
  start: () => void;
  stop: () => void;
  lock: () => void;
  unlock: () => void;
  navigateTo: (s: Screen) => void;
  setRedDuration: (v: number) => void;
  setGreenDuration: (v: number) => void;
  setShowCountdown: (v: boolean) => void;
  setPin: (v: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>('red');
  const [timeLeft, setTimeLeft] = useState(30);
  const [isRunning, setIsRunning] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [pin, setPinState] = useState('');
  const [redDuration, setRedDurationState] = useState(30);
  const [greenDuration, setGreenDurationState] = useState(15);
  const [showCountdown, setShowCountdownState] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  // Mutable refs so the interval callback always sees fresh values
  const r = useRef({
    phase: 'red' as Phase,
    timeLeft: 30,
    redDuration: 30,
    greenDuration: 15,
    interval: null as ReturnType<typeof setInterval> | null,
  });

  // Keep refs in sync with state
  r.current.phase = phase;
  r.current.redDuration = redDuration;
  r.current.greenDuration = greenDuration;

  useEffect(() => {
    (async () => {
      try {
        const [rd, gd, sc, p] = await Promise.all([
          AsyncStorage.getItem('redDuration'),
          AsyncStorage.getItem('greenDuration'),
          AsyncStorage.getItem('showCountdown'),
          AsyncStorage.getItem('pin'),
        ]);
        if (rd) { setRedDurationState(+rd); r.current.redDuration = +rd; }
        if (gd) { setGreenDurationState(+gd); r.current.greenDuration = +gd; }
        if (sc !== null) setShowCountdownState(sc === 'true');
        if (p) setPinState(p);
        // Initialize with loaded red duration
        const initialDur = rd ? +rd : 30;
        setTimeLeft(initialDur);
        r.current.timeLeft = initialDur;
      } catch {}
    })();
    initSounds();
  }, []);

  const start = useCallback(() => {
    if (r.current.interval) return;
    setIsRunning(true);

    r.current.interval = setInterval(() => {
      r.current.timeLeft -= 1;
      const t = r.current.timeLeft;

      if (t > 0 && t <= 3) playBeep();

      if (t <= 0) {
        const next: Phase = r.current.phase === 'red' ? 'green' : 'red';
        const nextDur = next === 'red' ? r.current.redDuration : r.current.greenDuration;
        r.current.phase = next;
        r.current.timeLeft = nextDur;
        setPhase(next);
        setTimeLeft(nextDur);
        playChange();
      } else {
        setTimeLeft(t);
      }
    }, 1000);
  }, []);

  const stop = useCallback(() => {
    if (r.current.interval) {
      clearInterval(r.current.interval);
      r.current.interval = null;
    }
    r.current.phase = 'red';
    r.current.timeLeft = r.current.redDuration;
    setIsRunning(false);
    setPhase('red');
    setTimeLeft(r.current.redDuration);
  }, []);

  const lock = useCallback(() => setIsLocked(true), []);
  const unlock = useCallback(() => setIsLocked(false), []);
  const navigateTo = useCallback((s: Screen) => setCurrentScreen(s), []);

  const setRedDuration = useCallback((v: number) => {
    setRedDurationState(v);
    r.current.redDuration = v;
    AsyncStorage.setItem('redDuration', String(v));
  }, []);

  const setGreenDuration = useCallback((v: number) => {
    setGreenDurationState(v);
    r.current.greenDuration = v;
    AsyncStorage.setItem('greenDuration', String(v));
  }, []);

  const setShowCountdown = useCallback((v: boolean) => {
    setShowCountdownState(v);
    AsyncStorage.setItem('showCountdown', String(v));
  }, []);

  const setPin = useCallback((v: string) => {
    setPinState(v);
    AsyncStorage.setItem('pin', v);
  }, []);

  return (
    <AppContext.Provider value={{
      phase, timeLeft, isRunning, isLocked, pin,
      redDuration, greenDuration, showCountdown, currentScreen,
      start, stop, lock, unlock, navigateTo,
      setRedDuration, setGreenDuration, setShowCountdown, setPin,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp outside AppProvider');
  return ctx;
}
