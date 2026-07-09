import { useEffect, useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet } from "react-native";
import { Dialog } from "./common/Dialog";
import { useTheme } from "../theme/ThemeContext";
import { ThemeMode } from "../types";
import { SAVE_LABEL, THEME_ROW_LABEL } from "../constants";
import { THEME_MODE_LABEL } from "./MenuSheet";

const THEME_MODE_OPTIONS: ThemeMode[] = [
  ThemeMode.Light,
  ThemeMode.Dark,
  ThemeMode.System,
];

const DIALOG_MESSAGE =
  "Системная тема следует за настройкой оформления устройства.";

interface Props {
  visible: boolean;
  initialThemeMode: ThemeMode;
  onConfirm: (mode: ThemeMode) => void;
  onCancel: () => void;
}

export function ThemeDialog({
  visible,
  initialThemeMode,
  onConfirm,
  onCancel,
}: Props) {
  const { colors } = useTheme();
  const [mode, setMode] = useState(initialThemeMode);

  useEffect(() => {
    if (!visible) return;
    setMode(initialThemeMode);
  }, [visible, initialThemeMode]);

  return (
    <Dialog
      visible={visible}
      title={THEME_ROW_LABEL}
      message={DIALOG_MESSAGE}
      confirmLabel={SAVE_LABEL}
      onConfirm={() => onConfirm(mode)}
      onCancel={onCancel}
    >
      <View style={styles.options}>
        {THEME_MODE_OPTIONS.map((option) => {
          const selected = option === mode;
          return (
            <TouchableOpacity
              key={option}
              style={[
                styles.option,
                { borderColor: colors.cardBorder },
                selected && {
                  borderColor: colors.primaryAction,
                  backgroundColor: `${colors.primaryAction}1A`,
                },
              ]}
              onPress={() => setMode(option)}
              activeOpacity={0.7}
            >
              <Text style={[styles.optionLabel, { color: colors.primaryText }]}>
                {THEME_MODE_LABEL[option]}
              </Text>
              {selected ? (
                <Text style={[styles.checkmark, { color: colors.primaryAction }]}>
                  ✓
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  options: {
    gap: 10,
    marginBottom: 4,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 15,
    fontWeight: "700",
  },
});
