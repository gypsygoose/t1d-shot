import { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import ConfirmDialog from './ConfirmDialog';
import LegendModal from './LegendModal';

interface Props {
  canUndo: boolean;
  onUndo: () => void;
  onClear: () => void;
}

// Icon components matching Figma icon shapes

function UndoIcon({ disabled }: { disabled: boolean }) {
  const c = disabled ? '#4A5568' : '#FFFFFF';
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M4.5 9.5 L4.5 14.5 L9.5 14.5"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M4.5 14.5 A8 8 0 1 1 8 18.5"
        stroke={c}
        strokeWidth={1.8}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

function LegendIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Circle cx="6.5" cy="6.5" r="2.5" fill="#FFFFFF" />
      <Circle cx="6.5" cy="15.5" r="2.5" fill="#FFFFFF" />
      <Line x1="12" y1="6.5" x2="20" y2="6.5" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="12" y1="11" x2="20" y2="11" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
      <Line x1="12" y1="15.5" x2="20" y2="15.5" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function ClearIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22" fill="none">
      <Path
        d="M16.5 7.5 L5.5 7.5 L6.5 18 L15.5 18 Z"
        stroke="#FFFFFF"
        strokeWidth={1.8}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M3.5 7.5 L18.5 7.5"
        stroke="#FFFFFF"
        strokeWidth={1.8}
        strokeLinecap="round"
      />
      <Path
        d="M9 5 L9 3.5 L13 3.5 L13 5"
        stroke="#FFFFFF"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Line x1="9" y1="10" x2="9" y2="15.5" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />
      <Line x1="13" y1="10" x2="13" y2="15.5" stroke="#FFFFFF" strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

export default function BottomMenu({ canUndo, onUndo, onClear }: Props) {
  const [showUndo, setShowUndo] = useState(false);
  const [showClear, setShowClear] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  return (
    <>
      <View style={styles.bar}>
        <TouchableOpacity
          style={[styles.btn, !canUndo && styles.btnDisabled]}
          onPress={() => setShowUndo(true)}
          disabled={!canUndo}
          activeOpacity={0.6}
        >
          <UndoIcon disabled={!canUndo} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => setShowLegend(true)} activeOpacity={0.6}>
          <LegendIcon />
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => setShowClear(true)} activeOpacity={0.6}>
          <ClearIcon />
        </TouchableOpacity>
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

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#080C18',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingBottom: 28,
    paddingTop: 4,
  },
  btn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  btnDisabled: {
    opacity: 0.35,
  },
});
