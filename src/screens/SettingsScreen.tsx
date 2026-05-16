import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Switch,
  ScrollView, SafeAreaView, Platform, StatusBar as RNStatusBar, Alert,
  NativeSyntheticEvent, NativeScrollEvent,
} from 'react-native';
import { useApp } from '../context/AppContext';
import PinModal from '../components/PinModal';

// ── Wheel Column ─────────────────────────────────────────────────────────────
const ITEM_H = 56;
const VISIBLE = 5;
const PICKER_H = ITEM_H * VISIBLE;
const PAD = ITEM_H * Math.floor(VISIBLE / 2);

function WheelColumn({
  count, value, onChange,
}: {
  count: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<ScrollView>(null);
  const [centered, setCentered] = useState(value);
  const layoutDone = useRef(false);

  const handleLayout = useCallback(() => {
    if (layoutDone.current) return;
    layoutDone.current = true;
    ref.current?.scrollTo({ y: value * ITEM_H, animated: false });
  }, [value]);

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
      const clamped = Math.max(0, Math.min(count - 1, idx));
      setCentered(clamped);
      onChange(clamped);
    },
    [count, onChange],
  );

  return (
    <View style={colStyles.wrap}>
      <View pointerEvents="none" style={colStyles.indicator} />
      <ScrollView
        ref={ref}
        onLayout={handleLayout}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        nestedScrollEnabled
        onMomentumScrollEnd={handleScrollEnd}
        onScrollEndDrag={handleScrollEnd}
        contentContainerStyle={{ paddingVertical: PAD }}
        scrollEventThrottle={16}
      >
        {Array.from({ length: count }, (_, i) => {
          const dist = Math.abs(i - centered);
          return (
            <View key={i} style={colStyles.item}>
              <Text style={[
                colStyles.num,
                dist === 0 && colStyles.numCenter,
                dist === 1 && colStyles.numNear,
              ]}>
                {String(i).padStart(2, '0')}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const colStyles = StyleSheet.create({
  wrap: { width: 84, height: PICKER_H, overflow: 'hidden' },
  indicator: {
    position: 'absolute',
    top: PAD,
    left: 6,
    right: 6,
    height: ITEM_H,
    borderTopWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#4FC3F7',
    zIndex: 2,
  },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
  num: { color: '#3A3A3C', fontSize: 20, fontWeight: '400', fontVariant: ['tabular-nums'] },
  numNear: { color: '#888', fontSize: 26 },
  numCenter: { color: '#FFF', fontSize: 36, fontWeight: '700' },
});

// ── Time Picker ──────────────────────────────────────────────────────────────
function TimePicker({
  label, value, onChange, accentColor,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  accentColor: string;
}) {
  const mins = Math.floor(value / 60);
  const secs = value % 60;

  // Ref keeps latest value without stale closures in callbacks
  const valueRef = useRef(value);
  valueRef.current = value;

  const onMinsChange = useCallback((m: number) => {
    const s = valueRef.current % 60;
    onChange(Math.min(3600, m * 60 + s));
  }, [onChange]);

  const onSecsChange = useCallback((s: number) => {
    const m = Math.floor(valueRef.current / 60);
    onChange(Math.min(3600, m * 60 + s));
  }, [onChange]);

  return (
    <View style={tpStyles.card}>
      <Text style={[tpStyles.label, { color: accentColor }]}>{label}</Text>
      <View style={tpStyles.row}>
        <View style={tpStyles.col}>
          <WheelColumn count={61} value={mins} onChange={onMinsChange} />
          <Text style={tpStyles.unit}>min</Text>
        </View>
        <Text style={tpStyles.colon}>:</Text>
        <View style={tpStyles.col}>
          <WheelColumn count={60} value={secs} onChange={onSecsChange} />
          <Text style={tpStyles.unit}>seg</Text>
        </View>
      </View>
    </View>
  );
}

const tpStyles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  label: { fontSize: 18, fontWeight: '700', marginBottom: 14 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  col: { alignItems: 'center' },
  colon: { color: '#FFF', fontSize: 40, fontWeight: '700', marginBottom: 22 },
  unit: { color: '#8E8E93', fontSize: 13, marginTop: 6, fontWeight: '600', letterSpacing: 0.5 },
});

// ── Settings Screen ──────────────────────────────────────────────────────────
export default function SettingsScreen() {
  const {
    redDuration, greenDuration, showCountdown, soundEnabled, pin,
    setRedDuration, setGreenDuration, setShowCountdown, setSoundEnabled, setPin, navigateTo,
  } = useApp();

  const [localRed, setLocalRed] = useState(redDuration);
  const [localGreen, setLocalGreen] = useState(greenDuration);
  const [pinModal, setPinModal] = useState<'none' | 'verify' | 'set'>('none');

  const handleSave = () => {
    const safeRed = Math.min(3600, Math.max(5, localRed));
    const safeGreen = Math.min(3600, Math.max(5, localGreen));
    if (localRed < 5 || localGreen < 5) {
      Alert.alert('Tempo mínimo', 'O tempo mínimo por fase é de 5 segundos. Os valores foram ajustados automaticamente.');
    }
    setRedDuration(safeRed);
    setGreenDuration(safeGreen);
    navigateTo('main');
  };

  const handleChangePinPress = () => {
    if (pin) {
      setPinModal('verify');
    } else {
      setPinModal('set');
    }
  };

  const handleVerifySuccess = () => setPinModal('set');

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

        <TimePicker
          label="🔴  Vermelho"
          value={localRed}
          onChange={setLocalRed}
          accentColor="#FF453A"
        />
        <TimePicker
          label="🟢  Verde"
          value={localGreen}
          onChange={setLocalGreen}
          accentColor="#32D74B"
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

        <Text style={styles.credit}>By Vinnicius Henrique Magione Soares</Text>
      </ScrollView>

      <PinModal
        visible={pinModal === 'verify'}
        mode="verify"
        currentPin={pin}
        onSuccess={handleVerifySuccess}
        onCancel={() => setPinModal('none')}
      />
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
  credit: {
    color: '#3A3A3C',
    fontSize: 11,
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 8,
  },
});
