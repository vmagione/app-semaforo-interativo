import * as FileSystem from 'expo-file-system/legacy';
import { Audio } from 'expo-av';

// Generate a sine-wave WAV as a Uint8Array (8-bit mono PCM)
function buildWav(frequency: number, durationMs: number): Uint8Array {
  const sampleRate = 8000;
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const buf = new Uint8Array(44 + numSamples);

  const u16 = (off: number, v: number) => { buf[off] = v & 0xff; buf[off + 1] = (v >> 8) & 0xff; };
  const u32 = (off: number, v: number) => { buf[off] = v & 0xff; buf[off+1] = (v>>8)&0xff; buf[off+2] = (v>>16)&0xff; buf[off+3] = (v>>24)&0xff; };

  buf.set([82,73,70,70]);          // "RIFF"
  u32(4, 36 + numSamples);         // ChunkSize
  buf.set([87,65,86,69], 8);       // "WAVE"
  buf.set([102,109,116,32], 12);   // "fmt "
  u32(16, 16);                     // Subchunk1Size
  u16(20, 1);                      // AudioFormat = PCM
  u16(22, 1);                      // NumChannels = 1
  u32(24, sampleRate);             // SampleRate
  u32(28, sampleRate);             // ByteRate (8-bit mono = sampleRate)
  u16(32, 1);                      // BlockAlign
  u16(34, 8);                      // BitsPerSample
  buf.set([100,97,116,97], 36);    // "data"
  u32(40, numSamples);             // Subchunk2Size

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Fade out last 20% to avoid click
    const fade = i > numSamples * 0.8 ? (numSamples - i) / (numSamples * 0.2) : 1;
    buf[44 + i] = Math.round(128 + 100 * fade * Math.sin(2 * Math.PI * frequency * t));
  }
  return buf;
}

function toBase64(bytes: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = i+1 < bytes.length ? bytes[i+1] : 0, b2 = i+2 < bytes.length ? bytes[i+2] : 0;
    out += chars[b0 >> 2];
    out += chars[((b0 & 3) << 4) | (b1 >> 4)];
    out += i+1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i+2 < bytes.length ? chars[b2 & 63] : '=';
  }
  return out;
}

async function writeAndLoad(filename: string, wav: Uint8Array): Promise<Audio.Sound> {
  const uri = FileSystem.cacheDirectory + filename;
  await FileSystem.writeAsStringAsync(uri, toBase64(wav), {
    encoding: FileSystem.EncodingType.Base64,
  });
  const { sound } = await Audio.Sound.createAsync({ uri });
  return sound;
}

let beepSound: Audio.Sound | null = null;
let changeSound: Audio.Sound | null = null;

export async function initSounds() {
  try {
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
    beepSound  = await writeAndLoad('beep.wav',   buildWav(880, 120));
    changeSound = await writeAndLoad('change.wav', buildWav(523, 350));
  } catch (e) {
    console.warn('Audio init failed', e);
  }
}

export async function playBeep() {
  try { await beepSound?.replayAsync(); } catch {}
}

export async function playChange() {
  try { await changeSound?.replayAsync(); } catch {}
}
