import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { Phase } from '../context/AppContext';

interface Props {
  seconds: number;
  phase: Phase;
}

function formatTime(s: number): string {
  if (s < 60) return String(s).padStart(2, '0');
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export default function CountdownDisplay({ seconds, phase }: Props) {
  const color = phase === 'red' ? '#FF453A' : '#32D74B';
  const isMinutes = seconds >= 60;
  return (
    <Text style={[styles.text, { color, fontSize: isMinutes ? 80 : 110, letterSpacing: isMinutes ? 2 : 4 }]}>
      {formatTime(seconds)}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
  },
});
