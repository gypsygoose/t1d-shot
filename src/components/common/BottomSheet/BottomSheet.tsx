import { ReactNode, useEffect, useRef, useState } from "react";
import {
  BackHandler,
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../../theme";
import { BackIcon } from "../../icons";
import {
  DISMISS_DISTANCE,
  DISMISS_VELOCITY,
  PAGE_SLIDE_MS,
  SCREEN_HEIGHT,
  SCREEN_WIDTH,
  SHEET_CLOSE_MS,
  SHEET_OPEN_MS,
  VERTICAL_MOVE_THRESHOLD,
} from "./constants";
import { BottomSheetSecondaryPage } from "./types";

interface Props {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  secondaryPage?: BottomSheetSecondaryPage;
}

export function BottomSheet({
  visible,
  onClose,
  title,
  children,
  secondaryPage,
}: Props) {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const secondaryTranslateX = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  // Kept mounted for the duration of the dismiss animation, then unmounted
  // entirely so the (otherwise full-screen) overlay stops intercepting
  // touches meant for whatever is behind the sheet.
  const [mounted, setMounted] = useState(visible);
  // Same reasoning, applied to the secondary page: while it's translated
  // off to the right it would otherwise still sit (via transform, not
  // layout) on top of the primary page's touchable rows.
  const [secondaryMounted, setSecondaryMounted] = useState(
    secondaryPage?.visible ?? false,
  );

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.setValue(SCREEN_HEIGHT);
      Animated.timing(translateY, {
        toValue: 0,
        duration: SHEET_OPEN_MS,
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: SHEET_CLOSE_MS,
        useNativeDriver: true,
      }).start(() => setMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (secondaryPage?.visible) {
      setSecondaryMounted(true);
      secondaryTranslateX.setValue(SCREEN_WIDTH);
      Animated.timing(secondaryTranslateX, {
        toValue: 0,
        duration: PAGE_SLIDE_MS,
        useNativeDriver: true,
      }).start();
    } else if (secondaryMounted) {
      Animated.timing(secondaryTranslateX, {
        toValue: SCREEN_WIDTH,
        duration: PAGE_SLIDE_MS,
        useNativeDriver: true,
      }).start(() => setSecondaryMounted(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondaryPage?.visible]);

  useEffect(() => {
    if (!visible) return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (secondaryPage?.visible) {
        secondaryPage.onBack();
      } else {
        onClose();
      }
      return true;
    });
    return () => sub.remove();
  }, [visible, onClose, secondaryPage]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        Math.abs(gestureState.dy) > VERTICAL_MOVE_THRESHOLD &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderTerminationRequest: () => false,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (
          gestureState.dy > DISMISS_DISTANCE ||
          gestureState.vy > DISMISS_VELOCITY
        ) {
          onClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
          }).start();
        }
      },
    }),
  ).current;

  const overlayOpacity = translateY.interpolate({
    inputRange: [0, SCREEN_HEIGHT],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  if (!mounted) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: overlayOpacity,
          backgroundColor: colors.bottomSheetBackdrop,
        },
      ]}
    >
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY }],
            backgroundColor: colors.surface,
            borderTopColor: colors.cardBorder,
          },
        ]}
      >
        <View {...panResponder.panHandlers}>
          <View
            style={[
              styles.handle,
              { backgroundColor: colors.bottomSheetHandle },
            ]}
          />
        </View>

        <View style={styles.pageContainer}>
          <View style={styles.page}>
            {title ? (
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.primaryText }]}>
                  {title}
                </Text>
              </View>
            ) : null}

            <ScrollView
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
            >
              {children}
              <View style={styles.bottomPad} />
            </ScrollView>
          </View>

          {secondaryMounted && secondaryPage ? (
            <Animated.View
              style={[
                styles.page,
                styles.secondaryPage,
                {
                  backgroundColor: colors.surface,
                  transform: [{ translateX: secondaryTranslateX }],
                },
              ]}
            >
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={secondaryPage.onBack}
                  activeOpacity={0.7}
                >
                  <BackIcon />
                </TouchableOpacity>
                <Text style={[styles.title, { color: colors.primaryText }]}>
                  {secondaryPage.title}
                </Text>
              </View>

              <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
              >
                {secondaryPage.children}
                <View style={styles.bottomPad} />
              </ScrollView>
            </Animated.View>
          ) : null}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "80%",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pageContainer: {
    flex: 1,
    overflow: "hidden",
  },
  page: {
    flex: 1,
  },
  secondaryPage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollView: {
    flex: 1,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    marginRight: 8,
    marginLeft: -8,
    paddingHorizontal: 8,
  },
  title: {
    flex: 1,
    fontSize: 19,
    fontWeight: "700",
  },
  bottomPad: {
    // Extra clearance so the last row isn't hidden behind the bottom menu
    // bar, which now renders on top of the sheet instead of a full-screen
    // Modal covering it.
    height: 110,
  },
});
