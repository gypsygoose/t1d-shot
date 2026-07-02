import { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ButtonColor } from '../types';
import { COLOR_HEX, checkmarkColor } from '../logic/stateMachine';

// Match Figma button group size: ~29px diameter
const BTN_SIZE = 29;
const INNER_SIZE = 20;

interface Props {
  color: ButtonColor;
  showCheckmark: boolean;
  onPress: () => void;
  onLongPress: () => void;
  x: number; // 0..1 fraction of container
  y: number; // 0..1 fraction of container
}

export default function InjectionButton({
  color,
  showCheckmark,
  onPress,
  onLongPress,
  x,
  y,
}: Props) {
  const isBlocked = color === 'black' || color === 'gray';

  const handlePress = useCallback(
    (_: GestureResponderEvent) => {
      if (!isBlocked) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }
    },
    [isBlocked, onPress],
  );

  const handleLongPress = useCallback(
    (_: GestureResponderEvent) => {
      if (color !== 'black') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress();
      }
    },
    [color, onLongPress],
  );

  const bg = COLOR_HEX[color];
  const ck = checkmarkColor(color);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={800}
      activeOpacity={0.75}
      style={[
        styles.outer,
        {
          backgroundColor: bg,
          left: `${(x * 100).toFixed(2)}%` as unknown as number,
          top: `${(y * 100).toFixed(2)}%` as unknown as number,
        },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked }}
    >
      {/* Inner white ring to mimic Figma multi-layer button */}
      <Text style={[styles.inner, { backgroundColor: bg }]}>
        {showCheckmark ? (
          <Text style={[styles.check, { color: ck }]}>✓</Text>
        ) : null}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -(BTN_SIZE / 2),
    marginTop: -(BTN_SIZE / 2),
    // Soft shadow so buttons stand out on body image
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  inner: {
    width: INNER_SIZE,
    height: INNER_SIZE,
    borderRadius: INNER_SIZE / 2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 10,
    fontWeight: '800',
    lineHeight: 12,
  },
});
