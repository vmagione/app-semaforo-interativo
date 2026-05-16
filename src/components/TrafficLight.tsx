import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import type { Phase } from '../context/AppContext';

const RED_ON   = '#FF453A';
const RED_OFF  = '#2a0800';
const GRN_ON   = '#32D74B';
const GRN_OFF  = '#002a0a';

interface Props { phase: Phase }

export default function TrafficLight({ phase }: Props) {
  const redAnim = useRef(new Animated.Value(phase === 'red' ? 1 : 0)).current;
  const grnAnim = useRef(new Animated.Value(phase === 'green' ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(redAnim, { toValue: phase === 'red' ? 1 : 0, duration: 400, useNativeDriver: false }),
      Animated.timing(grnAnim, { toValue: phase === 'green' ? 1 : 0, duration: 400, useNativeDriver: false }),
    ]).start();
  }, [phase]);

  const redBg  = redAnim.interpolate({ inputRange: [0, 1], outputRange: [RED_OFF, RED_ON] });
  const grnBg  = grnAnim.interpolate({ inputRange: [0, 1], outputRange: [GRN_OFF, GRN_ON] });
  const redElev = redAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  const grnElev = grnAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });

  return (
    <View style={styles.housing}>
      {/* Pole top cap */}
      <View style={styles.topCap} />
      <View style={styles.body}>
        <Animated.View style={[styles.light, { backgroundColor: redBg, elevation: redElev }]} />
        <View style={styles.divider} />
        <Animated.View style={[styles.light, { backgroundColor: grnBg, elevation: grnElev }]} />
      </View>
    </View>
  );
}

const LIGHT_SIZE = 88;

const styles = StyleSheet.create({
  housing: {
    alignItems: 'center',
  },
  topCap: {
    width: 18,
    height: 12,
    backgroundColor: '#555',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  body: {
    backgroundColor: '#1C1C1E',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#3A3A3C',
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 12,
  },
  divider: {
    width: LIGHT_SIZE * 0.6,
    height: 2,
    backgroundColor: '#2C2C2E',
    marginVertical: 12,
  },
  light: {
    width: LIGHT_SIZE,
    height: LIGHT_SIZE,
    borderRadius: LIGHT_SIZE / 2,
    borderWidth: 2,
    borderColor: '#000',
  },
});
