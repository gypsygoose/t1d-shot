import React from 'react';
import Svg, { Path, Ellipse } from 'react-native-svg';

// Simple front-view human silhouette, 300 × 580 viewBox.
// Fill is a neutral body color; outline is drawn via stroke paths.

const FILL = '#D4C5B2';
const STROKE = '#9B8E7E';
const SW = 1.5;

export default function BodySilhouette() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 300 580" preserveAspectRatio="xMidYMid meet">
      {/* Torso */}
      <Path
        d="M105,130 C80,140 68,160 65,200 L60,310 C60,330 80,340 100,340 L200,340 C220,340 240,330 240,310 L235,200 C232,160 220,140 195,130 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
      />
      {/* Head */}
      <Ellipse cx="150" cy="52" rx="38" ry="44" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      {/* Neck */}
      <Path d="M135,92 L135,130 L165,130 L165,92 Z" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      {/* Left arm (screen right) */}
      <Path
        d="M195,132 C215,138 232,148 242,168 L252,220 C254,232 248,240 238,240 L225,240 L215,190 L205,145 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
      />
      {/* Left forearm */}
      <Path
        d="M225,240 L238,240 L244,300 L230,304 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
      />
      {/* Right arm (screen left) */}
      <Path
        d="M105,132 C85,138 68,148 58,168 L48,220 C46,232 52,240 62,240 L75,240 L85,190 L95,145 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
      />
      {/* Right forearm */}
      <Path
        d="M75,240 L62,240 L56,300 L70,304 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
      />
      {/* Hips */}
      <Path
        d="M60,310 L60,345 C60,370 75,380 95,382 L115,384 L130,340 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
      />
      <Path
        d="M240,310 L240,345 C240,370 225,380 205,382 L185,384 L170,340 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
      />
      {/* Right thigh (screen left) */}
      <Path
        d="M95,382 L115,384 L120,490 L90,490 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
      />
      {/* Right lower leg */}
      <Path d="M90,490 L120,490 L118,560 L92,560 Z" fill={FILL} stroke={STROKE} strokeWidth={SW} />
      {/* Left thigh (screen right) */}
      <Path
        d="M205,382 L185,384 L180,490 L210,490 Z"
        fill={FILL}
        stroke={STROKE}
        strokeWidth={SW}
      />
      {/* Left lower leg */}
      <Path d="M180,490 L210,490 L208,560 L182,560 Z" fill={FILL} stroke={STROKE} strokeWidth={SW} />
    </Svg>
  );
}
