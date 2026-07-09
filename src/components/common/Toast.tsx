import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { TOAST_TEXT_COLOR } from '../../constants';
import { ToastStatus } from '../../types';
import { ToastInfoIcon } from '../icons/ToastInfoIcon';
import { ToastWarnIcon } from '../icons/ToastWarnIcon';
import { ToastSuccessIcon } from '../icons/ToastSuccessIcon';
import { ToastErrorIcon } from '../icons/ToastErrorIcon';
import {
  TOAST_INFO_COLOR,
  TOAST_WARN_COLOR,
  TOAST_SUCCESS_COLOR,
  TOAST_ERROR_COLOR,
  TOAST_INFO_BACKGROUND_COLOR,
  TOAST_WARN_BACKGROUND_COLOR,
  TOAST_SUCCESS_BACKGROUND_COLOR,
  TOAST_ERROR_BACKGROUND_COLOR,
} from '../../constants';

// A single toast bubble. Fades itself in on mount and, after `duration`,
// fades out and calls `onDismiss` — the caller (ToastStack) owns the list
// this is rendered into, so removal only happens once the exit animation
// finishes.
interface Props {
  message: string;
  status: ToastStatus;
  duration: number;
  onDismiss: () => void;
}

const FADE_MS = 200;

const STATUS_ICON: Record<ToastStatus, () => React.JSX.Element> = {
  [ToastStatus.Info]: ToastInfoIcon,
  [ToastStatus.Warn]: ToastWarnIcon,
  [ToastStatus.Success]: ToastSuccessIcon,
  [ToastStatus.Error]: ToastErrorIcon,
};

const STATUS_BORDER_COLOR: Record<ToastStatus, string> = {
  [ToastStatus.Info]: TOAST_INFO_COLOR,
  [ToastStatus.Warn]: TOAST_WARN_COLOR,
  [ToastStatus.Success]: TOAST_SUCCESS_COLOR,
  [ToastStatus.Error]: TOAST_ERROR_COLOR,
};

const STATUS_BACKGROUND_COLOR: Record<ToastStatus, string> = {
  [ToastStatus.Info]: TOAST_INFO_BACKGROUND_COLOR,
  [ToastStatus.Warn]: TOAST_WARN_BACKGROUND_COLOR,
  [ToastStatus.Success]: TOAST_SUCCESS_BACKGROUND_COLOR,
  [ToastStatus.Error]: TOAST_ERROR_BACKGROUND_COLOR,
};

export function Toast({ message, status, duration, onDismiss }: Props) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: FADE_MS,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true,
      }).start(onDismiss);
    }, duration);

    return () => clearTimeout(timer);
    // Runs once per mount: message/status/duration are fixed for this
    // entry's lifetime (ToastStack keys each one by a stable id).
  }, []);

  const Icon = STATUS_ICON[status];

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity,
          backgroundColor: STATUS_BACKGROUND_COLOR[status],
          borderColor: STATUS_BORDER_COLOR[status],
        },
      ]}
    >
      <View style={styles.icon}>
        <Icon />
      </View>
      <Animated.Text style={styles.text}>{message}</Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginHorizontal: 24,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  icon: {
    marginRight: 10,
  },
  text: {
    flex: 1,
    color: TOAST_TEXT_COLOR,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'left',
  },
});
