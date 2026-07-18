import { TFunction } from "i18next";
import {
  EnabledZones,
  Gender,
  LanguageMode,
  PointRestoreMode,
  ThemeMode,
  ZonePointCounts,
} from "../../types";

// Params object for utils/buildZonePointsSummary.ts — see CLAUDE.md's "more
// than 2 parameters" coding-convention bullet.
export interface BuildZonePointsSummaryParams {
  t: TFunction;
  zonePointCounts: ZonePointCounts;
  enabledZones: EnabledZones;
}

// SettingsSheet's own props — named here rather than declared inline in
// SettingsSheet.tsx since MenuSheet.tsx, which embeds SettingsSheet as the
// BottomSheet's secondary page, needs to name this type for its own
// `settings` prop (see CLAUDE.md's "no inline object types" rule: a type
// used outside its own file moves to types.ts).
export interface SettingsSheetProps {
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
