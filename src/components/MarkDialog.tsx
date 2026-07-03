import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  visible: boolean;
  onConfirm: (timestamp: number) => void;
  onCancel: () => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function formatDate(d: Date): string {
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function formatTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// Parses "ДД.ММ.ГГГГ" + "ЧЧ:ММ" into a timestamp, rejecting invalid dates
// like 31.02 (Date would otherwise silently roll them into March).
function parseDateTime(dateText: string, timeText: string): number | null {
  const dm = dateText.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  const tm = timeText.trim().match(/^(\d{1,2}):(\d{1,2})$/);
  if (!dm || !tm) return null;

  const day = Number(dm[1]);
  const month = Number(dm[2]);
  const year = Number(dm[3]);
  const hours = Number(tm[1]);
  const minutes = Number(tm[2]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (hours > 23 || minutes > 59) return null;

  const d = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) {
    return null;
  }
  return d.getTime();
}

export default function MarkDialog({ visible, onConfirm, onCancel }: Props) {
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    if (visible) {
      const now = new Date();
      setDateText(formatDate(now));
      setTimeText(formatTime(now));
      setError(false);
    }
  }, [visible]);

  const handleConfirm = () => {
    const ts = parseDateTime(dateText, timeText);
    if (ts === null) {
      setError(true);
      return;
    }
    onConfirm(ts);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.title}>Отметить укол</Text>
          <Text style={styles.message}>
            Укажите дату и время, когда была сделана инъекция.
          </Text>

          <Text style={styles.label}>Дата (ДД.ММ.ГГГГ)</Text>
          <TextInput
            style={styles.input}
            value={dateText}
            onChangeText={(t) => {
              setDateText(t);
              setError(false);
            }}
            placeholder="ДД.ММ.ГГГГ"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="number-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Время (ЧЧ:ММ)</Text>
          <TextInput
            style={styles.input}
            value={timeText}
            onChangeText={(t) => {
              setTimeText(t);
              setError(false);
            }}
            placeholder="ЧЧ:ММ"
            placeholderTextColor="rgba(255,255,255,0.3)"
            keyboardType="number-pad"
            maxLength={5}
          />

          {error ? (
            <Text style={styles.error}>
              Проверьте формат даты и времени.
            </Text>
          ) : null}

          <View style={styles.row}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} activeOpacity={0.8}>
              <Text style={styles.cancelLabel}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmLabel}>Отметить</Text>
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  box: {
    backgroundColor: '#141824',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 21,
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  error: {
    fontSize: 13,
    color: '#DC2626',
    marginTop: -8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
