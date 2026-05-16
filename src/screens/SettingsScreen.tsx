import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Switch,
  ScrollView, SafeAreaView, Platform, StatusBar as RNStatusBar, Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import PinModal from '../components/PinModal';

function formatDuration(s: number): string {
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function DurationRow({
  label, value, onChange, min, max,
}: { label: string; value: number; onChange: (v: number) => void; min: number; max: number }) {
  const step = value >= 60 ? 30 : 5;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.counter}>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => onChange(Math.max(min, value - step))}
        >
          <Text style={styles.counterBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.counterValue}>{formatDuration(value)}</Text>
        <TouchableOpacity
          style={styles.counterBtn}
          onPress={() => onChange(Math.min(max, value + step))}
        >
          <Text style={styles.counterBtnText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const {
    redDuration, greenDuration, showCountdown, soundEnabled, pin,
    setRedDuration, setGreenDuration, setShowCountdown, setSoundEnabled, setPin, navigateTo,
  } = useApp();

  const [localRed, setLocalRed] = useState(redDuration);
  const [localGreen, setLocalGreen] = useState(greenDuration);
  const [pinModal, setPinModal] = useState<'none' | 'verify' | 'set'>('none');

  const handleSave = () => {
    setRedDuration(localRed);
    setGreenDuration(localGreen);
    navigateTo('main');
  };

  const handleChangePinPress = () => {
    if (pin) {
      // Must verify current pin first
      setPinModal('verify');
    } else {
      setPinModal('set');
    }
  };

  const handleVerifySuccess = () => {
    setPinModal('set');
  };

  const handleSetSuccess = (newPin?: string) => {
    if (newPin) {
      setPin(newPin);
      Alert.alert('PIN salvo!', 'Seu PIN foi configurado com sucesso.');
    }
    setPinModal('none');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigateTo('main')} style={styles.backBtn}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.section}>Duração das Fases</Text>

        <DurationRow
          label="🔴  Vermelho"
          value={localRed}
          onChange={setLocalRed}
          min={5}
          max={3600}
        />
        <DurationRow
          label="🟢  Verde"
          value={localGreen}
          onChange={setLocalGreen}
          min={5}
          max={3600}
        />

        <View style={styles.divider} />
        <Text style={styles.section}>Exibição</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Mostrar contagem</Text>
          <Switch
            value={showCountdown}
            onValueChange={setShowCountdown}
            trackColor={{ false: '#3A3A3C', true: '#32D74B' }}
            thumbColor="#FFF"
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Sons ativos</Text>
          <Switch
            value={soundEnabled}
            onValueChange={setSoundEnabled}
            trackColor={{ false: '#3A3A3C', true: '#32D74B' }}
            thumbColor="#FFF"
          />
        </View>

        <View style={styles.divider} />
        <Text style={styles.section}>Bloqueio</Text>

        <TouchableOpacity style={styles.pinBtn} onPress={handleChangePinPress}>
          <Text style={styles.pinBtnText}>
            {pin ? '🔑  Alterar PIN' : '🔑  Criar PIN de bloqueio'}
          </Text>
        </TouchableOpacity>

        {pin ? (
          <Text style={styles.pinHint}>PIN configurado. Toque em Bloquear na tela principal para ativar.</Text>
        ) : (
          <Text style={styles.pinHint}>Sem PIN configurado. O botão de bloqueio não funcionará até criar um.</Text>
        )}

        <View style={{ height: 32 }} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Salvar e Voltar</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Verify existing PIN before allowing change */}
      <PinModal
        visible={pinModal === 'verify'}
        mode="verify"
        currentPin={pin}
        onSuccess={handleVerifySuccess}
        onCancel={() => setPinModal('none')}
      />
      {/* Set new PIN */}
      <PinModal
        visible={pinModal === 'set'}
        mode="set"
        currentPin={pin}
        onSuccess={handleSetSuccess}
        onCancel={() => setPinModal('none')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#0d1117',
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight ?? 0 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  backBtn: { width: 80 },
  backText: { color: '#4FC3F7', fontSize: 16, fontWeight: '600' },
  title: { color: '#FFF', fontSize: 18, fontWeight: '700' },
  content: { padding: 20 },
  section: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#2C2C2E',
    marginVertical: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  rowLabel: { color: '#FFF', fontSize: 16 },
  counter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counterBtnText: { color: '#FFF', fontSize: 22, fontWeight: '700', lineHeight: 26 },
  counterValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    minWidth: 68,
    textAlign: 'center',
  },
  pinBtn: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4FC3F7',
    alignItems: 'center',
  },
  pinBtnText: { color: '#4FC3F7', fontSize: 16, fontWeight: '600' },
  pinHint: {
    color: '#8E8E93',
    fontSize: 13,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: '#4FC3F7',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#000', fontSize: 17, fontWeight: '800' },
});
