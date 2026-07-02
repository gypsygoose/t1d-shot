import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import BodySilhouette from '../components/BodySilhouette';
import InjectionButton from '../components/InjectionButton';
import BottomMenu from '../components/BottomMenu';
import { useAppStore } from '../store/useAppStore';
import { computeButtonColor } from '../logic/stateMachine';
import { BUTTONS } from '../data/zones';

// The SVG viewBox is 300 × 580. We render it at the full container width,
// maintaining aspect ratio so buttons can be positioned as percentage of container.

const VIEWBOX_W = 300;
const VIEWBOX_H = 580;

export default function MainScreen() {
  const [state, actions] = useAppStore();
  const { width: screenW } = useWindowDimensions();

  const containerW = screenW;
  const containerH = containerW * (VIEWBOX_H / VIEWBOX_W);

  const handlePress = useCallback((id: string) => actions.pressButton(id), [actions]);
  const handleLongPress = useCallback((id: string) => actions.longPressButton(id), [actions]);

  if (!state.isLoaded) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color="#1A56DB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.header}>T1D Shot</Text>

      <View style={styles.bodyWrap}>
        <View style={[styles.silhouetteContainer, { width: containerW, height: containerH }]}>
          <BodySilhouette />

          {BUTTONS.map((btn) => {
            const btnState = state.buttonStates[btn.id];
            if (!btnState) return null;
            const color = computeButtonColor(btnState, state.now);
            const showCheckmark = state.lastInGroup['thighs'] === btn.id
              || state.lastInGroup['shoulders-and-belly'] === btn.id;

            return (
              <InjectionButton
                key={btn.id}
                color={color}
                showCheckmark={showCheckmark}
                onPress={() => handlePress(btn.id)}
                onLongPress={() => handleLongPress(btn.id)}
                x={btn.x}
                y={btn.y}
              />
            );
          })}
        </View>
      </View>

      <BottomMenu
        canUndo={state.events.length > 0}
        onUndo={actions.undo}
        onClear={actions.clearAll}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    paddingVertical: 12,
    letterSpacing: 0.5,
  },
  bodyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  silhouetteContainer: {
    position: 'relative',
  },
});
