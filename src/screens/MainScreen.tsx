import { useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ZoneContainer from "../components/ZoneContainer";
import BottomMenu from "../components/BottomMenu";
import { useAppStore } from "../store/useAppStore";
import { computeButtonColor } from "../logic/stateMachine";
import { ZONES } from "../data/zones";

// Figma body image aspect ratio: 393.46 wide × 621.91 tall
const IMG_ASPECT = 393.46 / 621.91;

export default function MainScreen() {
  const [state, actions] = useAppStore();

  const handlePress = useCallback(
    (id: string) => actions.pressButton(id),
    [actions],
  );
  const handleLongPress = useCallback(
    (id: string) => actions.longPressButton(id),
    [actions],
  );

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
      <SafeAreaView style={styles.headerSafe} edges={["top"]}>
        <View style={styles.header}>
          <Text style={styles.title}>T1D SHOT</Text>
        </View>
      </SafeAreaView>

      {/* Body image + buttons overlay */}
      <View style={styles.bodyWrap}>
        <View style={styles.imageContainer}>
          <Image
            source={require("../../assets/images/body.png")}
            style={[styles.image, StyleSheet.absoluteFill]}
            resizeMode="contain"
          />

          {ZONES.map((zone) => (
            <ZoneContainer
              key={zone.id}
              zoneId={zone.id}
              getColor={(buttonId) =>
                computeButtonColor(state.buttonStates[buttonId], state.now)
              }
              isCheckmarked={(buttonId) =>
                state.lastInGroup["thighs"] === buttonId ||
                state.lastInGroup["shoulders-and-belly"] === buttonId
              }
              onPress={handlePress}
              onLongPress={handleLongPress}
            />
          ))}
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
    backgroundColor: "#080C18",
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080C18",
  },
  headerSafe: {
    backgroundColor: "#080C18",
  },
  header: {
    paddingTop: 12,
    paddingBottom: 12,
    alignItems: "center",
  },
  title: {
    color: "rgba(255,255,255,0.26)",
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 3.1,
    textTransform: "uppercase",
  },
  bodyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  imageContainer: {
    position: "relative",
    flex: 1,
    maxWidth: "100%",
    aspectRatio: IMG_ASPECT,
    alignSelf: "center",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
  },
});
