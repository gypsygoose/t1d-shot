import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import ConfirmDialog from './ConfirmDialog';
import LegendModal from './LegendModal';

interface Props {
  canUndo: boolean;
  onUndo: () => void;
  onClear: () => void;
}

export default function BottomMenu({ canUndo, onUndo, onClear }: Props) {
  const [showUndo, setShowUndo] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  return (
    <>
      <View style={styles.bar}>
        <MenuButton
          label="Отменить"
          icon="↩"
          onPress={() => setShowUndo(true)}
          disabled={!canUndo}
        />
        <MenuButton
          label="Легенда"
          icon="?"
          onPress={() => setShowLegend(true)}
        />
        <MenuButton
          label="Очистить"
          icon="🗑"
          onPress={() => setShowClear(true)}
        />
      </View>

      <ConfirmDialog
        visible={showUndo}
        title="Отменить последний укол?"
        message="Последняя зафиксированная инъекция будет удалена. Это действие нельзя отменить повторно."
        confirmLabel="Отменить укол"
        onConfirm={() => { setShowUndo(false); onUndo(); }}
        onCancel={() => setShowUndo(false)}
      />

      <ConfirmDialog
        visible={showClear}
        title="Очистить все данные?"
        message="Вся история инъекций будет удалена. Все точки станут белыми. Это действие нельзя отменить."
        confirmLabel="Очистить"
        cancelLabel="Отмена"
        onConfirm={() => { setShowClear(false); onClear(); }}
        onCancel={() => setShowClear(false)}
        destructive
      />

      <LegendModal visible={showLegend} onClose={() => setShowLegend(false)} />
    </>
  );
}

function MenuButton({
  label,
  icon,
  onPress,
  disabled = false,
}: {
  label: string;
  icon: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.btn, disabled && styles.btnDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.icon, disabled && styles.iconDisabled]}>{icon}</Text>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 8,
    paddingBottom: 20, // safe area buffer
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  btnDisabled: {
    opacity: 0.3,
  },
  icon: {
    fontSize: 22,
    color: '#1A56DB',
  },
  iconDisabled: {
    color: '#999999',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1A56DB',
    letterSpacing: 0.2,
  },
  labelDisabled: {
    color: '#999999',
  },
});
