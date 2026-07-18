import { StoredPointState } from './point';
import { EnabledZones, ZoneId, ZonePointCounts } from './zone';
import { Gender } from './gender';
import { LanguageMode } from './language';
import { PointRestoreMode } from './pointRestoreMode';
import { ThemeMode } from './theme';

// Event in undo history. Most user actions touch a single point
// (PointAppEvent); clearing selected data and applying an import file
// replace many points and settings at once (BulkAppEvent).
export enum AppEventType {
  Injection = 'injection',
  Blackout = 'blackout',
  ManualBlock = 'manual-block',
  ManualUnblock = 'manual-unblock',
  ManualClear = 'manual-clear',
  ClearSelected = 'clear-selected',
  Import = 'import',
}

interface AppEventBase {
  id: string;
  timestamp: number;
}

// A single-point action: snapshots that one point's previous state, and
// undo restores just that point.
export interface PointAppEvent extends AppEventBase {
  type:
    | AppEventType.Injection
    | AppEventType.Blackout
    | AppEventType.ManualBlock
    | AppEventType.ManualUnblock
    | AppEventType.ManualClear;
  pointId: string;
  zoneId: ZoneId;
  prevPointState: StoredPointState;
}

// The settings slice a BulkAppEvent snapshots — every setting a clear or an
// import can change, always captured in full (restoring an unchanged value
// is a no-op). autoLockDeadline is deliberately absent: undo recomputes a
// fresh deadline from the restored auto-lock settings instead of reviving a
// stale, possibly already-elapsed one. Ordinary settings edits from
// SettingsSheet never record an event — only ClearOptionsDialog's clear and
// a file import do, via BulkAppEvent below.
export interface BulkAppEventSettings {
  mirrored: boolean;
  autoLockEnabled: boolean;
  autoLockAfterMarkSeconds: number;
  autoLockAfterUnlockSeconds: number;
  daysToWhite: number;
  daysToAvailable: number;
  pointRestoreMode: PointRestoreMode;
  gender: Gender;
  zonePointCounts: ZonePointCounts;
  enabledZones: EnabledZones;
  themeMode: ThemeMode;
  languageMode: LanguageMode;
}

// A bulk action — clearing selected categories (ClearOptionsDialog) or
// applying an import file — snapshots the entire pre-action pointStates map
// plus the settings above, and undo restores both wholesale. themeMode/
// languageMode live above the store (ThemeProvider/LanguageProvider), so
// MainScreen passes their current values into clearSelected/applyImport for
// the snapshot and restores them itself after undoing a bulk event (see its
// onUndo wrapper).
export interface BulkAppEvent extends AppEventBase {
  type: AppEventType.ClearSelected | AppEventType.Import;
  prevPointStates: Record<string, StoredPointState>;
  prevSettings: BulkAppEventSettings;
}

export type AppEvent = PointAppEvent | BulkAppEvent;
