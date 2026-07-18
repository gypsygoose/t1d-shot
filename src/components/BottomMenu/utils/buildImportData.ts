import { ExportedAppData, ExportSelection, ExportSettingKey } from "../../../types";

// Narrows a parsed import file down to just the categories the user kept
// checked in ImportOptionsDialog, mirroring useAppStore's exportData filter
// on the way out.
export function buildImportData(
  data: ExportedAppData,
  selection: ExportSelection,
): ExportedAppData {
  const filtered: ExportedAppData = {};
  if (
    Object.values(selection.marks).some(Boolean) &&
    data.pointStates !== undefined
  ) {
    filtered.pointStates = data.pointStates;
  }
  if (selection.settings[ExportSettingKey.Mirrored]) {
    filtered.mirrored = data.mirrored;
  }
  if (selection.settings[ExportSettingKey.AutoLock]) {
    filtered.autoLockEnabled = data.autoLockEnabled;
    filtered.autoLockAfterMarkSeconds = data.autoLockAfterMarkSeconds;
    filtered.autoLockAfterUnlockSeconds = data.autoLockAfterUnlockSeconds;
  }
  if (selection.settings[ExportSettingKey.EnabledZones]) {
    filtered.enabledZones = data.enabledZones;
  }
  if (selection.settings[ExportSettingKey.ZonePointCounts]) {
    filtered.zonePointCounts = data.zonePointCounts;
  }
  if (selection.settings[ExportSettingKey.PointRestoreMode]) {
    filtered.pointRestoreMode = data.pointRestoreMode;
  }
  if (selection.settings[ExportSettingKey.Gender]) {
    filtered.gender = data.gender;
  }
  if (selection.settings[ExportSettingKey.DaysToWhite]) {
    filtered.daysToWhite = data.daysToWhite;
  }
  if (selection.settings[ExportSettingKey.DaysToAvailable]) {
    filtered.daysToAvailable = data.daysToAvailable;
  }
  if (selection.settings[ExportSettingKey.Language]) {
    filtered.languageMode = data.languageMode;
  }
  if (selection.settings[ExportSettingKey.Theme]) {
    filtered.themeMode = data.themeMode;
  }
  return filtered;
}
