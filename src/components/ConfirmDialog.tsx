import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  CANCEL_BUTTON_BORDER_COLOR,
  CANCEL_BUTTON_TEXT_COLOR,
  CARD_BORDER_COLOR,
  DESTRUCTIVE_COLOR,
  MODAL_OVERLAY_COLOR,
  PRIMARY_ACTION_COLOR,
  PRIMARY_TEXT_COLOR,
  SECONDARY_TEXT_COLOR,
  SURFACE_COLOR,
} from '../constants';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  destructive = false,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelLabel}>{cancelLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.confirmBtn, destructive && styles.destructiveBtn]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmLabel}>{confirmLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: SURFACE_COLOR,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: CARD_BORDER_COLOR,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: PRIMARY_TEXT_COLOR,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: SECONDARY_TEXT_COLOR,
    lineHeight: 21,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: CANCEL_BUTTON_BORDER_COLOR,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: CANCEL_BUTTON_TEXT_COLOR,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: PRIMARY_ACTION_COLOR,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: PRIMARY_TEXT_COLOR,
  },
  destructiveBtn: {
    backgroundColor: DESTRUCTIVE_COLOR,
  },
});
