import { useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import InjectionButton from '../components/InjectionButton';
import BottomMenu from '../components/BottomMenu';
import { useAppStore } from '../store/useAppStore';
import { computeButtonColor } from '../logic/stateMachine';
import { BUTTONS } from '../data/zones';

// Figma body image aspect ratio: 393.46 wide × 621.91 tall
const IMG_ASPECT = 393.46 / 621.91;

export default function MainScreen() {
  const [state, actions] = useAppStore();
  const { width: screenW } = useWindowDimensions();

  // Image fills full screen width; height derived from aspect ratio
  const imgW = screenW;
  const imgH = imgW / IMG_ASPECT;

  const handlePress = useCallback((id: string) => actions.pressButton(id), [actions]);
  const handleLongPress = useCallback((id: string) => actions.longPressButton(id), [actions]);

  if (!state.isLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#080C18" />

      {/* Header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.title}>T1D SHOTS</Text>
        </View>
      </SafeAreaView>

      {/* Body image + buttons overlay */}
      <View style={styles.bodyWrap}>
        <View style={[styles.imageContainer, { width: imgW, height: imgH }]}>
          <Image
            source={require('../../assets/images/body_icon.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="contain"
          />

          {BUTTONS.map((btn) => {
            const btnState = state.buttonStates[btn.id];
            if (!btnState) return null;
            const color = computeButtonColor(btnState, state.now);
            const showCheckmark =
              state.lastInGroup['thighs'] === btn.id ||
              state.lastInGroup['shoulders-and-belly'] === btn.id;

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

      {/* Bottom menu */}
      <BottomMenu
        canUndo={state.events.length > 0}
        onUndo={actions.undo}
        onClear={actions.clearAll}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080C18',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#080C18',
  },
  headerSafe: {
    backgroundColor: '#080C18',
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: 'center',
  },
  title: {
    color: 'rgba(255,255,255,0.26)',
    fontSize: 13,
    fontWeight: '400',
    letterSpacing: 3.1,
    textTransform: 'uppercase',
  },
  bodyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
  },
});
