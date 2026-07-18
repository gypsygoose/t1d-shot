import { StoredPointState } from './point';
import { ThemeMode } from './theme';
import { LanguageMode } from './language';
import { EnabledZones, ZonePointCounts, ZoneType } from './zone';
import { PointRestoreMode } from './pointRestoreMode';
import { Gender } from './gender';

// Full app state as written to / read from an export file — includes
// pointStates plus every setting (like mirror mode), each persisted under
// its own AsyncStorage key (see StorageService in src/storage/StorageService.ts).
// All fields are optional: ExportOptionsDialog lets the user pick which
// categories to write, so a file may carry only a subset. On import, a
// missing field means "leave this category untouched" (see
// useImportExport's applyImport), not "reset to default" — so fields must
// never be defaulted away during export/import.
// The AppEvent history deliberately never round-trips through this shape:
// export writes only pointStates for the marks category, and import ignores
// an `events` key in an older file — the history lives under its own
// AsyncStorage key (EVENTS_KEY), which import never writes.
export interface ExportedAppData {
  pointStates?: Record<string, StoredPointState>;
  mirrored?: boolean;
  autoLockEnabled?: boolean;
  autoLockAfterMarkSeconds?: number;
  autoLockAfterUnlockSeconds?: number;
  daysToWhite?: number;
  daysToAvailable?: number;
  themeMode?: ThemeMode;
  languageMode?: LanguageMode;
  zonePointCounts?: ZonePointCounts;
  enabledZones?: EnabledZones;
  pointRestoreMode?: PointRestoreMode;
  gender?: Gender;
}

// Which categories ExportOptionsDialog writes to the export file. The
// "app settings" group is an accordion of individually-toggleable rows,
// mirrored 1:1 by the export/import logic in storage.ts. The same enum (and
// ExportSelection below) is reused by ImportOptionsDialog to pick which of
// the categories present in an imported file to actually apply — there, a
// key not present in the file is forced unchecked and disabled rather than
// user-selectable.
export enum ExportSettingKey {
  Gender = 'gender',
  Mirrored = 'mirrored',
  AutoLock = 'auto-lock',
  EnabledZones = 'enabled-zones',
  ZonePointCounts = 'zone-point-counts',
  PointRestoreMode = 'point-restore-mode',
  DaysToWhite = 'days-to-white',
  DaysToAvailable = 'days-to-available',
  Language = 'language',
  Theme = 'theme',
}

// The marks group, keyed by ZoneType (Shoulder/Belly/Thigh) — the same shape
// is shared by all three AppDataSelector dialogs. ExportOptionsDialog/
// ImportOptionsDialog render it as a single bulk checkbox (AppDataSelector's
// marksExpandable left at its default false), so in practice every zone
// type is always selected together there — export/import always act on all
// marks, regardless of StoredPointState.isManuallyBlocked, or none at all.
// ClearOptionsDialog renders it as an accordion (marksExpandable true),
// letting individual zone types be cleared independently, still regardless
// of block status. See "Selective export / merge import / clear" in
// CLAUDE.md.
export interface ExportSelection {
  marks: Record<ZoneType, boolean>;
  settings: Record<ExportSettingKey, boolean>;
}
