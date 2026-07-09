import { View, Text, StyleSheet, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { MUTED_TEXT_COLOR, PRIMARY_TEXT_COLOR } from "../../constants";

const PICKER_ITEM_COLOR =
  Platform.OS === "android" ? PRIMARY_TEXT_COLOR : undefined;

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
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Picker
        style={styles.picker}
        itemStyle={styles.pickerItem}
        selectedValue={value}
        onValueChange={(v) => onChange(Number(v))}
        dropdownIconColor={PRIMARY_TEXT_COLOR}
      >
        {options.map((n) => (
          <Picker.Item
            key={n}
            label={formatOption(n)}
            value={n}
            color={PICKER_ITEM_COLOR}
          />
        ))}
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: MUTED_TEXT_COLOR,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  picker: {
    color: PRIMARY_TEXT_COLOR,
  },
  pickerItem: {
    color: PRIMARY_TEXT_COLOR,
    fontSize: 18,
    height: 120,
  },
});
