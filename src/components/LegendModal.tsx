import React from 'react';
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
                <View style={[styles.swatch, { backgroundColor: COLOR_HEX[c], borderColor: c === 'white' ? '#BDBDBD' : COLOR_HEX[c] }]} />
                <Text style={styles.colorLabel}>{COLOR_LABEL[c]}</Text>
              </View>
            ))}

            <Text style={styles.sectionTitle}>Управление</Text>
            <Text style={styles.hint}>
              <Text style={styles.bold}>Нажатие</Text> — зафиксировать укол в этой точке.
            </Text>
            <Text style={styles.hint}>
              <Text style={styles.bold}>Долгое нажатие</Text> (~1 сек) — заблокировать/разблокировать точку вручную (травма, синяк).
            </Text>
            <Text style={styles.hint}>
              <Text style={styles.bold}>✓ Галочка</Text> — точка, в которую был сделан последний укол в своей группе.
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111111',
  },
  closeBtn: {
    padding: 8,
  },
  closeLabel: {
    fontSize: 18,
    color: '#666666',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  zoneRow: {
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
  },
  zoneName: {
    fontSize: 15,
    color: '#111111',
    fontWeight: '600',
  },
  zoneGroup: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: 12,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
  },
  colorLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  hint: {
    fontSize: 14,
    color: '#444444',
    lineHeight: 22,
    marginBottom: 8,
  },
  bold: {
    fontWeight: '700',
  },
  bottomPad: {
    height: 32,
  },
});
