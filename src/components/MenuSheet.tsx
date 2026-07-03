import { Text, TouchableOpacity, StyleSheet } from "react-native";
import BottomSheet from "./BottomSheet";

interface Props {
  visible: boolean;
  onClose: () => void;
  onClear: () => void;
}

export default function MenuSheet({ visible, onClose, onClear }: Props) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="Меню">
      <TouchableOpacity
        style={styles.row}
        onPress={onClear}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, styles.destructiveLabel]}>Очистить</Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  destructiveLabel: {
    color: "#DC2626",
  },
});
