import { Text, TouchableOpacity, View, Switch, StyleSheet } from "react-native";
import { BottomSheet } from "./common/BottomSheet";
import { useTheme } from "../theme/ThemeContext";
import { ThemeMode } from "../types";
import {
  AFTER_MARK_LABEL,
  AFTER_UNLOCK_LABEL,
  AUTO_LOCK_ROW_LABEL,
  CLEAR_LABEL,
  DAYS_TO_WHITE_ROW_LABEL,
  EXPORT_ROW_LABEL,
  IMPORT_ROW_LABEL,
  MENU_SHEET_TITLE,
  MIRROR_ROW_LABEL,
  THEME_DARK_LABEL,
  THEME_LIGHT_LABEL,
  THEME_ROW_LABEL,
  THEME_SYSTEM_LABEL,
} from "../constants";
import { pad2, pluralDays, splitSeconds } from "../format";

interface Props {
  visible: boolean;
  onClose: () => void;
  mirrored: boolean;
  onToggleMirrored: (value: boolean) => void;
  autoLockEnabled: boolean;
  autoLockAfterMarkSeconds: number;
  autoLockAfterUnlockSeconds: number;
  onToggleAutoLocked: (value: boolean) => void;
  onEditAutoLockSettings: () => void;
  daysToWhite: number;
  onEditDaysToWhite: () => void;
  themeMode: ThemeMode;
  onEditTheme: () => void;
  onImport: () => void;
  onExport: () => void;
  onClear: () => void;
}

// Shared with ThemeDialog.tsx, which offers the same three options.
export const THEME_MODE_LABEL: Record<ThemeMode, string> = {
  [ThemeMode.Light]: THEME_LIGHT_LABEL,
  [ThemeMode.Dark]: THEME_DARK_LABEL,
  [ThemeMode.System]: THEME_SYSTEM_LABEL,
};

function formatDuration(totalSeconds: number): string {
  const { minutes, seconds } = splitSeconds(totalSeconds);
  return `${minutes}:${pad2(seconds)}`;
}

export function MenuSheet({
  visible,
  onClose,
  mirrored,
  onToggleMirrored,
  autoLockEnabled,
  autoLockAfterMarkSeconds,
  autoLockAfterUnlockSeconds,
  onToggleAutoLocked,
  onEditAutoLockSettings,
  daysToWhite,
  onEditDaysToWhite,
  themeMode,
  onEditTheme,
  onImport,
  onExport,
  onClear,
}: Props) {
  const { colors } = useTheme();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={MENU_SHEET_TITLE}>
      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {MIRROR_ROW_LABEL}
        </Text>
        <Switch
          value={mirrored}
          onValueChange={onToggleMirrored}
          trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
          thumbColor={colors.switchThumb}
        />
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={styles.autoLockInfo}
          onPress={onEditAutoLockSettings}
          activeOpacity={0.7}
        >
          <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
            {AUTO_LOCK_ROW_LABEL}
          </Text>
          <Text style={[styles.rowDescription, { color: colors.mutedText }]}>
            {AFTER_MARK_LABEL} — {formatDuration(autoLockAfterMarkSeconds)}
          </Text>
          <Text style={[styles.rowDescription, { color: colors.mutedText }]}>
            {AFTER_UNLOCK_LABEL} — {formatDuration(autoLockAfterUnlockSeconds)}
          </Text>
        </TouchableOpacity>
        <Switch
          value={autoLockEnabled}
          onValueChange={onToggleAutoLocked}
          trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
          thumbColor={colors.switchThumb}
        />
      </View>

      <TouchableOpacity
        style={styles.row}
        onPress={onEditDaysToWhite}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {DAYS_TO_WHITE_ROW_LABEL}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {daysToWhite} {pluralDays(daysToWhite)}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.row} onPress={onEditTheme} activeOpacity={0.7}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {THEME_ROW_LABEL}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {THEME_MODE_LABEL[themeMode]}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onExport}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {EXPORT_ROW_LABEL}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onImport}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {IMPORT_ROW_LABEL}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onClear}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.destructive }]}>
          {CLEAR_LABEL}
        </Text>
      </TouchableOpacity>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  rowValue: {
    fontSize: 15,
  },
  autoLockInfo: {
    flex: 1,
    paddingRight: 12,
  },
  rowDescription: {
    fontSize: 13,
    marginTop: 4,
  },
});
