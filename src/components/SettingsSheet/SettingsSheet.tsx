import { Text, TouchableOpacity, View, Switch, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { BottomSheet } from "../common";
import { useTheme } from "../../theme";
import {
  EnabledZones,
  Gender,
  LanguageMode,
  PointRestoreMode,
  ThemeMode,
  ZonePointCounts,
} from "../../types";
import {
  buildActiveZonesSummary,
  buildZonePointsSummary,
  countActivePoints,
  countActiveZones,
  formatDuration,
  isAllZonesActive,
} from "./utils";
import {
  GENDER_KEY,
  LANGUAGE_MODE_KEY,
  POINT_RESTORE_MODE_KEY,
  THEME_MODE_KEY,
} from "./constants";

interface Props {
  visible: boolean;
  onClose: () => void;
  gender: Gender;
  onEditGender: () => void;
  mirrored: boolean;
  onToggleMirrored: (value: boolean) => void;
  autoLockEnabled: boolean;
  autoLockAfterMarkSeconds: number;
  autoLockAfterUnlockSeconds: number;
  onToggleAutoLocked: (value: boolean) => void;
  onEditAutoLockSettings: () => void;
  pointRestoreMode: PointRestoreMode;
  onEditPointRestoreMode: () => void;
  daysToWhite: number;
  onEditDaysToWhite: () => void;
  daysToAvailable: number;
  onEditDaysToAvailable: () => void;
  zonePointCounts: ZonePointCounts;
  onEditZonePointCounts: () => void;
  enabledZones: EnabledZones;
  onEditZones: () => void;
  themeMode: ThemeMode;
  onEditTheme: () => void;
  languageMode: LanguageMode;
  onEditLanguage: () => void;
}

export function SettingsSheet({
  visible,
  onClose,
  gender,
  onEditGender,
  mirrored,
  onToggleMirrored,
  autoLockEnabled,
  autoLockAfterMarkSeconds,
  autoLockAfterUnlockSeconds,
  onToggleAutoLocked,
  onEditAutoLockSettings,
  pointRestoreMode,
  onEditPointRestoreMode,
  daysToWhite,
  onEditDaysToWhite,
  daysToAvailable,
  onEditDaysToAvailable,
  zonePointCounts,
  onEditZonePointCounts,
  enabledZones,
  onEditZones,
  themeMode,
  onEditTheme,
  languageMode,
  onEditLanguage,
}: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isManualRestoreMode = pointRestoreMode === PointRestoreMode.Manual;
  const activeZonesSummary = buildActiveZonesSummary(t, enabledZones);
  const zonePointsSummary = buildZonePointsSummary({
    t,
    zonePointCounts,
    enabledZones,
  });

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={t("menu.settingsRow")}
    >
      <TouchableOpacity
        style={styles.row}
        onPress={onEditGender}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.genderRow")}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {t(GENDER_KEY[gender])}
        </Text>
      </TouchableOpacity>

      <View style={styles.row}>
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.mirrorRow")}
        </Text>
        <Switch
          value={mirrored}
          onValueChange={onToggleMirrored}
          trackColor={{
            false: colors.switchTrackOff,
            true: colors.switchTrackOn,
          }}
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
            {t("menu.autoLockRow")}
          </Text>
          <Text style={[styles.rowDescription, { color: colors.mutedText }]}>
            {t("menu.autoLockDialog.afterMark")} —{" "}
            {formatDuration(autoLockAfterMarkSeconds)}
          </Text>
          <Text style={[styles.rowDescription, { color: colors.mutedText }]}>
            {t("menu.autoLockDialog.afterUnlock")} —{" "}
            {formatDuration(autoLockAfterUnlockSeconds)}
          </Text>
        </TouchableOpacity>
        <Switch
          value={autoLockEnabled}
          onValueChange={onToggleAutoLocked}
          trackColor={{
            false: colors.switchTrackOff,
            true: colors.switchTrackOn,
          }}
          thumbColor={colors.switchThumb}
        />
      </View>

      <TouchableOpacity
        style={styles.rowWithSummary}
        onPress={onEditZones}
        activeOpacity={0.7}
      >
        <View style={styles.rowHeader}>
          <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
            {t("menu.zonesRow")}
          </Text>
          <Text style={[styles.rowValue, { color: colors.mutedText }]}>
            {isAllZonesActive(enabledZones)
              ? t("menu.allZonesActiveValue")
              : countActiveZones(enabledZones)}
          </Text>
        </View>
        {activeZonesSummary.map((line) => (
          <Text
            key={line}
            style={[styles.rowDescription, { color: colors.mutedText }]}
          >
            {line}
          </Text>
        ))}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.rowWithSummary}
        onPress={onEditZonePointCounts}
        activeOpacity={0.7}
      >
        <View style={styles.rowHeader}>
          <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
            {t("menu.zonePointsRow")}
          </Text>
          <Text style={[styles.rowValue, { color: colors.mutedText }]}>
            {countActivePoints(zonePointCounts, enabledZones)}
          </Text>
        </View>
        {zonePointsSummary.map((line) => (
          <Text
            key={line}
            style={[styles.rowDescription, { color: colors.mutedText }]}
          >
            {line}
          </Text>
        ))}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onEditPointRestoreMode}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.pointRestoreModeRow")}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {t(POINT_RESTORE_MODE_KEY[pointRestoreMode])}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, isManualRestoreMode && styles.rowDisabled]}
        onPress={isManualRestoreMode ? undefined : onEditDaysToWhite}
        disabled={isManualRestoreMode}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.daysToWhiteRow")}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {t("common.daysCount", { count: daysToWhite })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, isManualRestoreMode && styles.rowDisabled]}
        onPress={isManualRestoreMode ? undefined : onEditDaysToAvailable}
        disabled={isManualRestoreMode}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.daysToAvailableRow")}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {t("common.daysCount", { count: daysToAvailable })}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onEditLanguage}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.languageRow")}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {t(LANGUAGE_MODE_KEY[languageMode])}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={onEditTheme}
        activeOpacity={0.7}
      >
        <Text style={[styles.rowLabel, { color: colors.primaryText }]}>
          {t("menu.themeRow")}
        </Text>
        <Text style={[styles.rowValue, { color: colors.mutedText }]}>
          {t(THEME_MODE_KEY[themeMode])}
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
  rowWithSummary: {
    paddingVertical: 14,
    paddingHorizontal: 4,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  rowDisabled: {
    opacity: 0.4,
  },
  rowDescription: {
    fontSize: 13,
    marginTop: 4,
  },
});
