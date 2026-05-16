import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert,
  SafeAreaView, Platform, StatusBar as RNStatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';
import TrafficLight from '../components/TrafficLight';
import WalkingBoy from '../components/WalkingBoy';
import CountdownDisplay from '../components/CountdownDisplay';
import PinModal from '../components/PinModal';

export default function MainScreen() {
  const {
    phase, timeLeft, isRunning, isLocked, pin, showCountdown,
    start, stop, lock, unlock, navigateTo,
  } = useApp();

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalMode, setPinModalMode] = useState<'verify' | 'set'>('verify');

  const handleLockPress = () => {
    if (isLocked) {
      // Unlock flow
      setPinModalMode('verify');
      setShowPinModal(true);
    } else {
      // Lock flow
      if (!pin) {
        Alert.alert(
          'PIN necessário',
          'Configure um PIN nas Configurações antes de bloquear.',
          [{ text: 'OK' }],
        );
        return;
      }
      if (!isRunning) start();
      lock();
    }
  };

  const handleUnlockSuccess = () => {
    setShowPinModal(false);
    unlock();
  };

  const bgColor = phase === 'red' ? '#110004' : '#001108';

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <View style={[styles.container, { backgroundColor: bgColor }]}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.lockBtn} onPress={handleLockPress}>
            <Text style={styles.lockIcon}>{isLocked ? '🔒' : '🔓'}</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Semáforo</Text>

          {!isLocked ? (
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => navigateTo('settings')}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.settingsBtn} />
          )}
        </View>

        {/* ── Traffic light ── */}
        <View style={styles.lightWrapper}>
          <TrafficLight phase={phase} />
        </View>

        {/* ── Countdown ── */}
        {showCountdown ? (
          <CountdownDisplay seconds={timeLeft} phase={phase} />
        ) : (
          <View style={{ height: 120 }} />
        )}

        {/* ── Label ── */}
        <Text style={[styles.label, { color: phase === 'red' ? '#FF453A' : '#32D74B' }]}>
          {phase === 'red' ? 'AGUARDE' : 'PODE IR!'}
        </Text>

        {/* ── Sidewalk + Boy ── */}
        <View style={styles.streetArea}>
          <View style={styles.sidewalk} />
          <View style={styles.boyRow}>
            <WalkingBoy phase={phase} size={100} />
          </View>
          <View style={styles.road}>
            {[0,1,2,3,4].map(i => (
              <View key={i} style={styles.roadDash} />
            ))}
          </View>
        </View>

        {/* ── Start / Stop (hidden when locked) ── */}
        {!isLocked && (
          <TouchableOpacity
            style={[styles.actionBtn, isRunning && styles.stopBtn]}
            onPress={isRunning ? stop : start}
            activeOpacity={0.8}
          >
            <Text style={styles.actionBtnText}>
              {isRunning ? 'PARAR' : 'INICIAR'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <PinModal
        visible={showPinModal}
        mode={pinModalMode}
        currentPin={pin}
        onSuccess={handleUnlockSuccess}
        onCancel={() => setShowPinModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  lockBtn: {
    padding: 8,
  },
  lockIcon: {
    fontSize: 26,
  },
  title: {
    color: '#EBEBF5',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  settingsBtn: {
    padding: 8,
    width: 44,
    alignItems: 'center',
  },
  settingsIcon: {
    fontSize: 24,
  },
  lightWrapper: {
    marginTop: 12,
  },
  label: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 3,
    marginTop: 4,
  },
  streetArea: {
    width: '100%',
    marginTop: 'auto',
    marginBottom: 16,
  },
  sidewalk: {
    height: 8,
    backgroundColor: '#8D8D93',
    borderRadius: 4,
    marginBottom: 4,
  },
  boyRow: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  road: {
    height: 36,
    backgroundColor: '#2C2C2E',
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 16,
    marginTop: 4,
  },
  roadDash: {
    flex: 1,
    height: 4,
    backgroundColor: '#FFD60A',
    borderRadius: 2,
  },
  actionBtn: {
    backgroundColor: '#32D74B',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 60,
    marginBottom: 24,
    elevation: 6,
  },
  stopBtn: {
    backgroundColor: '#FF453A',
  },
  actionBtnText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 2,
  },
});
