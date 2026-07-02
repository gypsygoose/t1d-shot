import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ButtonColor } from '../types';
import { COLOR_HEX, COLOR_LABEL } from '../logic/stateMachine';
import { ZONES } from '../data/zones';

const COLOR_ORDER: ButtonColor[] = [
  'white',
  'maroon',
  'red',
  'dark-orange',
  'orange',
  'dark-yellow',
  'yellow',
  'dark-green',
  'green',
  'black',
  'gray',
];

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function LegendModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Легенда</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeLabel}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Зоны введения</Text>
            {ZONES.map((z) => (
              <View key={z.id} style={styles.zoneRow}>
                <Text style={styles.zoneName}>{z.label}</Text>
                <Text style={styles.zoneGroup}>
                  {z.group === 'thighs' ? 'Группа: бёдра' : 'Группа: плечи и живот'}
                </Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Цветовая схема</Text>
            {COLOR_ORDER.map((c) => (
              <View key={c} style={styles.colorRow}>
                <View
                  style={[
                    styles.swatch,
                    {
                      backgroundColor: COLOR_HEX[c],
                      borderColor: c === 'white' ? 'rgba(255,255,255,0.3)' : COLOR_HEX[c],
                    },
                  ]}
                />
                <Text style={styles.colorLabel}>{COLOR_LABEL[c]}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Управление</Text>
            <Text style={styles.hint}>
              <Text style={styles.bold}>Нажатие</Text> — зафиксировать укол.
            </Text>
            <Text style={styles.hint}>
              <Text style={styles.bold}>Долгое нажатие</Text> (~1 с) — заблокировать / разблокировать вручную (травма, синяк).
            </Text>
            <Text style={styles.hint}>
              <Text style={styles.bold}>✓ Галочка</Text> — последняя использованная точка в группе.
            </Text>
            <View style={styles.bottomPad} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#141824',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '88%',
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    padding: 8,
  },
  closeLabel: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.5)',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 20,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  zoneRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  zoneName: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  zoneGroup: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.45)',
    marginTop: 2,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 14,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    flexShrink: 0,
  },
  colorLabel: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 19,
  },
  hint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 21,
    marginBottom: 10,
  },
  bold: {
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomPad: {
    height: 36,
  },
});
