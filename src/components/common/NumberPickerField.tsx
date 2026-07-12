import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../../theme";

interface Props {
  label: string;
  value: number;
  options: number[];
  formatOption?: (value: number) => string;
  onChange: (value: number) => void;
}

export function NumberPickerField({
  label,
  value,
  options,
  formatOption = (value) => `${value}`,
  onChange,
}: Props) {
  const { colors } = useTheme();
  const index = options.indexOf(value);
  const canDecrement = index > 0;
  const canIncrement = index >= 0 && index < options.length - 1;

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.mutedText }]}>
        {label}
      </Text>
      <View style={styles.stepper}>
        <TouchableOpacity
          style={[styles.stepButton, { borderColor: colors.cardBorder }]}
          onPress={() => onChange(options[index - 1])}
          disabled={!canDecrement}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.stepButtonLabel,
              { color: colors.primaryText },
              !canDecrement && styles.stepButtonLabelDisabled,
            ]}
          >
            −
          </Text>
        </TouchableOpacity>
        <Text style={[styles.value, { color: colors.primaryText }]}>
          {formatOption(value)}
        </Text>
        <TouchableOpacity
          style={[styles.stepButton, { borderColor: colors.cardBorder }]}
          onPress={() => onChange(options[index + 1])}
          disabled={!canIncrement}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.stepButtonLabel,
              { color: colors.primaryText },
              !canIncrement && styles.stepButtonLabelDisabled,
            ]}
          >
            +
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    width: "100%",
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  fieldLabel: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  stepper: {
    flexShrink: 0,
    marginLeft: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  stepButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  stepButtonLabel: {
    fontSize: 18,
    fontWeight: "600",
  },
  stepButtonLabelDisabled: {
    opacity: 0.3,
  },
  value: {
    minWidth: 32,
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
