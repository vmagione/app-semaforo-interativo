import React, { useEffect, useState } from 'react';
import Svg, { Circle, Line, G } from 'react-native-svg';
import type { Phase } from '../context/AppContext';

// 4-frame walk cycle: [leftLegX2, leftLegY2, rightLegX2, rightLegY2, leftArmX2, rightArmX2]
const WALK: [number, number, number, number, number, number][] = [
  [-4,  30,  4,  30, -16, 16],  // neutral
  [-16, 24,  10, 27,  14,-14],  // left leg forward
  [-4,  30,  4,  30, -16, 16],  // neutral
  [10,  27, -16, 24, -14, 14],  // right leg forward
];

const STAND: [number, number, number, number, number, number] =
  [-4, 30, 4, 30, -16, 16];

interface Props {
  phase: Phase;
  size?: number;
}

export default function WalkingBoy({ phase, size = 90 }: Props) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (phase !== 'green') {
      setFrame(0);
      return;
    }
    const id = setInterval(() => setFrame(f => (f + 1) % 4), 160);
    return () => clearInterval(id);
  }, [phase]);

  const [lx2, ly2, rx2, ry2, lax2, rax2] = phase === 'green' ? WALK[frame] : STAND;

  // SVG coordinate system: origin at hips (0,0), head up at -65
  const vb = '-30 -80 60 120'; // viewBox

  const strokeW = 4;
  const color = '#4FC3F7'; // light blue
  const headColor = '#FFD54F'; // amber/yellow

  return (
    <Svg width={size} height={size * 1.6} viewBox={vb}>
      {/* Head */}
      <Circle cx={0} cy={-65} r={12} fill={headColor} />
      {/* Body */}
      <Line x1={0} y1={-53} x2={0} y2={0} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      {/* Left arm (pivot at shoulders y=-42) */}
      <Line x1={0} y1={-42} x2={lax2} y2={-26} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      {/* Right arm */}
      <Line x1={0} y1={-42} x2={rax2} y2={-26} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      {/* Left leg */}
      <Line x1={0} y1={0} x2={lx2} y2={ly2} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
      {/* Right leg */}
      <Line x1={0} y1={0} x2={rx2} y2={ry2} stroke={color} strokeWidth={strokeW} strokeLinecap="round" />
    </Svg>
  );
}
