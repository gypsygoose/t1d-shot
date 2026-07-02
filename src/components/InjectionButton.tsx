import React, { useCallback } from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ButtonColor } from '../types';
import { COLOR_HEX, checkmarkColor } from '../logic/stateMachine';

const BTN_SIZE = 22;

interface Props {
  color: ButtonColor;
  showCheckmark: boolean;
  onPress: () => void;
  onLongPress: () => void;
  // Position as fraction of parent container
  x: number; // 0..1
  y: number; // 0..1
}

export default function InjectionButton({ color, showCheckmark, onPress, onLongPress, x, y }: Props) {
  const isBlocked = color === 'black' || color === 'gray';

  const handlePress = useCallback((_: GestureResponderEvent) => {
    if (!isBlocked) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  }, [isBlocked, onPress]);

  const handleLongPress = useCallback((_: GestureResponderEvent) => {
    if (color !== 'black') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onLongPress();
    }
  }, [color, onLongPress]);

  const bgColor = COLOR_HEX[color];
  const ckColor = checkmarkColor(color);
  const borderColor = color === 'white' ? '#BDBDBD' : bgColor;

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      delayLongPress={800}
      activeOpacity={0.75}
      style={[
        styles.btn,
        {
          backgroundColor: bgColor,
          borderColor,
          left: `${(x * 100).toFixed(1)}%` as unknown as number,
          top: `${(y * 100).toFixed(1)}%` as unknown as number,
        },
      ]}
      accessible
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked }}
    >
      {showCheckmark && (
        <Text style={[styles.check, { color: ckColor }]}>✓</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    position: 'absolute',
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    // center the button on its x/y anchor
    marginLeft: -(BTN_SIZE / 2),
    marginTop: -(BTN_SIZE / 2),
  },
  check: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 13,
  },
});
