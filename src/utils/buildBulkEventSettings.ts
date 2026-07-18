import { BulkAppEventSettings, LanguageMode, ThemeMode } from "../types";

// `state` is typed structurally (rather than as hooks/types.ts's AppState)
// so this util doesn't import from hooks/ — that would cycle back through
// the hooks barrel into utils/.
interface BuildBulkEventSettingsParams {
  state: Omit<BulkAppEventSettings, "themeMode" | "languageMode">;
  themeMode: ThemeMode;
  languageMode: LanguageMode;
}

// Captures the full settings slice a BulkAppEvent snapshots (see
// src/types/event.ts) from the pre-action state, plus the provider-owned
// themeMode/languageMode the caller passes alongside it. Shared by
// useClearSelected and useImportExport's applyImport.
export function buildBulkEventSettings({
  state,
  themeMode,
  languageMode,
}: BuildBulkEventSettingsParams): BulkAppEventSettings {
  return {
    mirrored: state.mirrored,
    autoLockEnabled: state.autoLockEnabled,
    autoLockAfterMarkSeconds: state.autoLockAfterMarkSeconds,
    autoLockAfterUnlockSeconds: state.autoLockAfterUnlockSeconds,
    daysToWhite: state.daysToWhite,
    daysToAvailable: state.daysToAvailable,
    pointRestoreMode: state.pointRestoreMode,
    gender: state.gender,
    zonePointCounts: state.zonePointCounts,
    enabledZones: state.enabledZones,
    themeMode,
    languageMode,
  };
}
