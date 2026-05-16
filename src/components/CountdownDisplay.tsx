import React from 'react';
import { Text, StyleSheet } from 'react-native';
import type { Phase } from '../context/AppContext';

interface Props {
  seconds: number;
  phase: Phase;
}

export default function CountdownDisplay({ seconds, phase }: Props) {
  const color = phase === 'red' ? '#FF453A' : '#32D74B';
  return (
    <Text style={[styles.text, { color }]}>
      {String(seconds).padStart(2, '0')}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 110,
    fontWeight: '900',
    fontVariant: ['tabular-nums'],
    letterSpacing: 4,
  },
});
