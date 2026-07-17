import { View, StyleSheet } from "react-native";
import { RadioButton } from "./RadioButton";

interface RadioOption {
  value: string;
  label: string;
}

interface Props {
  options: RadioOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

export function RadioGroup({ options, selectedValue, onSelect }: Props) {
  return (
    <View style={styles.options}>
      {options.map((option) => (
        <RadioButton
          key={option.value}
          label={option.label}
          selected={option.value === selectedValue}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: 10,
    marginBottom: 4,
  },
});
