import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../theme";

interface Props {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export function RadioButton({ label, selected, onPress }: Props) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.option,
        { borderColor: colors.cardBorder },
        selected && {
          borderColor: colors.primaryAction,
          backgroundColor: `${colors.primaryAction}1A`,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.label, { color: colors.primaryText }]}>{label}</Text>
      {selected ? (
        <Text style={[styles.checkmark, { color: colors.primaryAction }]}>
          ✓
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 15,
    fontWeight: "700",
  },
});
