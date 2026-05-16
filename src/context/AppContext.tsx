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
  soundEnabled: boolean;
  currentScreen: Screen;
  start: () => void;
  stop: () => void;
  lock: () => void;
  unlock: () => void;
  navigateTo: (s: Screen) => void;
  setRedDuration: (v: number) => void;
  setGreenDuration: (v: number) => void;
  setShowCountdown: (v: boolean) => void;
  setSoundEnabled: (v: boolean) => void;
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
  const [soundEnabled, setSoundEnabledState] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<Screen>('main');

  // Mutable refs so the interval callback always sees fresh values
  const r = useRef({
    phase: 'red' as Phase,
    timeLeft: 30,
    redDuration: 30,
    greenDuration: 15,
    soundEnabled: true,
    interval: null as ReturnType<typeof setInterval> | null,
  });

  // Keep refs in sync with state
  r.current.phase = phase;
  r.current.redDuration = redDuration;
  r.current.greenDuration = greenDuration;
  r.current.soundEnabled = soundEnabled;

  useEffect(() => {
    (async () => {
      try {
        const [rd, gd, sc, p, se] = await Promise.all([
          AsyncStorage.getItem('redDuration'),
          AsyncStorage.getItem('greenDuration'),
          AsyncStorage.getItem('showCountdown'),
          AsyncStorage.getItem('pin'),
          AsyncStorage.getItem('soundEnabled'),
        ]);
        if (rd) { setRedDurationState(+rd); r.current.redDuration = +rd; }
        if (gd) { setGreenDurationState(+gd); r.current.greenDuration = +gd; }
        if (sc !== null) setShowCountdownState(sc === 'true');
        if (p) setPinState(p);
        if (se !== null) { setSoundEnabledState(se === 'true'); r.current.soundEnabled = se === 'true'; }
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

      if (t > 0 && t <= 3 && r.current.soundEnabled) playBeep();

      if (t <= 0) {
        const next: Phase = r.current.phase === 'red' ? 'green' : 'red';
        const nextDur = next === 'red' ? r.current.redDuration : r.current.greenDuration;
        r.current.phase = next;
        r.current.timeLeft = nextDur;
        setPhase(next);
        setTimeLeft(nextDur);
        if (r.current.soundEnabled) playChange();
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

  // When red duration changes and timer is stopped, immediately reflect it in the display
  useEffect(() => {
    if (!r.current.interval) {
      setTimeLeft(redDuration);
      r.current.timeLeft = redDuration;
    }
  }, [redDuration]);

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

  const setSoundEnabled = useCallback((v: boolean) => {
    setSoundEnabledState(v);
    r.current.soundEnabled = v;
    AsyncStorage.setItem('soundEnabled', String(v));
  }, []);

  const setPin = useCallback((v: string) => {
    setPinState(v);
    AsyncStorage.setItem('pin', v);
  }, []);

  return (
    <AppContext.Provider value={{
      phase, timeLeft, isRunning, isLocked, pin,
      redDuration, greenDuration, showCountdown, soundEnabled, currentScreen,
      start, stop, lock, unlock, navigateTo,
      setRedDuration, setGreenDuration, setShowCountdown, setSoundEnabled, setPin,
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
