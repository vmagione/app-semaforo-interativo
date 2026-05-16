import React, { useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet, Vibration,
} from 'react-native';

interface Props {
  visible: boolean;
  mode: 'verify' | 'set';
  currentPin: string;
  onSuccess: (newPin?: string) => void;
  onCancel: () => void;
}

const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];

export default function PinModal({ visible, mode, currentPin, onSuccess, onCancel }: Props) {
  const [entry, setEntry] = useState('');
  const [step, setStep] = useState<'first' | 'confirm'>('first');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');

  const reset = () => { setEntry(''); setStep('first'); setFirstPin(''); setError(''); };

  const handleKey = (key: string) => {
    if (key === '⌫') { setEntry(e => e.slice(0, -1)); setError(''); return; }
    if (key === '') return;
    if (entry.length >= 4) return;
    const next = entry + key;
    setEntry(next);
    setError('');

    if (next.length === 4) {
      setTimeout(() => {
        if (mode === 'verify') {
          if (next === currentPin) {
            reset();
            onSuccess();
          } else {
            Vibration.vibrate(300);
            setError('PIN incorreto. Tente novamente.');
            setEntry('');
          }
        } else {
          // 'set' mode: two-step
          if (step === 'first') {
            setFirstPin(next);
            setEntry('');
            setStep('confirm');
          } else {
            if (next === firstPin) {
              reset();
              onSuccess(next);
            } else {
              Vibration.vibrate(300);
              setError('PINs não coincidem. Tente novamente.');
              setEntry('');
              setStep('first');
              setFirstPin('');
            }
          }
        }
      }, 100);
    }
  };

  const title = mode === 'verify'
    ? 'Digite o PIN'
    : step === 'first' ? 'Criar PIN (4 dígitos)' : 'Confirmar PIN';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>

          {/* Dot indicators */}
          <View style={styles.dots}>
            {[0,1,2,3].map(i => (
              <View key={i} style={[styles.dot, i < entry.length && styles.dotFilled]} />
            ))}
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          {/* Keypad */}
          <View style={styles.keypad}>
            {KEYS.map((k, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.key, k === '' && styles.keyEmpty]}
                onPress={() => handleKey(k)}
                activeOpacity={k === '' ? 1 : 0.6}
                disabled={k === ''}
              >
                <Text style={styles.keyText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.cancelBtn} onPress={() => { reset(); onCancel(); }}>
            <Text style={styles.cancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    padding: 28,
    width: 300,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  title: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  dots: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#8E8E93',
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: '#4FC3F7',
    borderColor: '#4FC3F7',
  },
  error: {
    color: '#FF453A',
    fontSize: 13,
    marginBottom: 8,
    textAlign: 'center',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 210,
    marginTop: 12,
    gap: 8,
  },
  key: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  keyEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  keyText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  cancelBtn: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 24,
  },
  cancelText: {
    color: '#8E8E93',
    fontSize: 15,
  },
});
