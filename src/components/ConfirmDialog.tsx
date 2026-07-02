import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

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

export default function ConfirmDialog({
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
              <Text style={[styles.confirmLabel, destructive && styles.destructiveLabel]}>
                {confirmLabel}
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111111',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#444444',
    lineHeight: 22,
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#CCCCCC',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444444',
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#1A56DB',
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  destructiveBtn: {
    backgroundColor: '#DC2626',
  },
  destructiveLabel: {
    color: '#FFFFFF',
  },
});
