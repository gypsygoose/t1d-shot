import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from './Toast';
import { ToastStatus } from '../../types';

// One entry in the stack — `id` must be stable for the entry's lifetime so
// Toast's own mount-time fade-in/out isn't retriggered by a re-render.
export interface ToastEntry {
  id: string;
  message: string;
  status: ToastStatus;
  duration: number;
}

interface Props {
  toasts: ToastEntry[];
  onDismiss: (id: string) => void;
}

// Renders toasts newest-first (top of the stack) — `toasts` is expected to
// already be ordered that way, so a freshly shown toast appears above
// whatever was already on screen instead of replacing it.
export function ToastStack({ toasts, onDismiss }: Props) {
  if (toasts.length === 0) return null;

  return (
    <SafeAreaView style={styles.safe} edges={['top']} pointerEvents="none">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          status={toast.status}
          duration={toast.duration}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
});
