import { Dispatch, SetStateAction } from "react";
import {
  AppStorage,
  EnabledZones,
  ExportedAppData,
  ExportSelection,
  Gender,
  LanguageMode,
  PointRestoreMode,
  ThemeMode,
  ZoneGroup,
  ZonePointCounts,
  ZoneRuntimeData,
} from "../types";
import { ImportResult } from "../storage";

export interface AppState extends AppStorage {
  now: number;
  isLoaded: boolean;
  mirrored: boolean;
  interfaceLocked: boolean;
  autoLockEnabled: boolean;
  autoLockAfterMarkSeconds: number;
  autoLockAfterUnlockSeconds: number;
  // Timestamp at which the interface should auto-lock next, or null if no
  // auto-lock is currently pending (e.g. already locked, or disabled).
  autoLockDeadline: number | null;
  daysToWhite: number;
  daysToAvailable: number;
  pointRestoreMode: PointRestoreMode;
  gender: Gender;
  zonePointCounts: ZonePointCounts;
  enabledZones: EnabledZones;
}

// Shared across every useAppStore.ts sub-hook (useLoadInitialState,
// useNowTicker, useAutoLock, usePointActions, useClearSelected,
// useSettingsActions, useZoneSettings, useImportExport) — they all mutate
// the one AppState atom useAppStore.ts owns via this same setter.
export type SetAppState = Dispatch<SetStateAction<AppState>>;

// AppState plus the two fields useAppStore.ts derives fresh on every call
// (lastInGroup from lastPressedByGroup, zoneData from useZoneSettings) —
// the actual first half of useAppStore's returned tuple.
export interface AppStoreState extends AppState {
  lastInGroup: Record<ZoneGroup, string | null>;
  zoneData: ZoneRuntimeData;
}

// See CLAUDE.md's "more than 2 parameters" coding-convention bullet. Used by
// both useAppStore.ts's AppActions and useImportExport.ts's exportData.
export interface ExportDataParams {
  themeMode: ThemeMode;
  languageMode: LanguageMode;
  dialogTitle: string;
  selection: ExportSelection;
}

export interface AppActions {
  pressPoint(pointId: string): void;
  blockPoint(pointId: string): void;
  unblockPoint(pointId: string): void;
  markPointAt(pointId: string, timestamp: number): void;
  clearPoint(pointId: string): void;
  undo(): void;
  clearSelected(selection: ExportSelection): void;
  setMirrored(mirrored: boolean): void;
  setInterfaceLocked(locked: boolean): void;
  enableAutoLock(afterMarkSeconds: number, afterUnlockSeconds: number): void;
  disableAutoLock(): void;
  updateAutoLockTimes(afterMarkSeconds: number, afterUnlockSeconds: number): void;
  setDaysToWhite(days: number): void;
  setDaysToAvailable(days: number): void;
  setPointRestoreMode(mode: PointRestoreMode): void;
  setGender(gender: Gender): void;
  setZonePointCounts(next: ZonePointCounts): void;
  setEnabledZones(next: EnabledZones): void;
  exportData(params: ExportDataParams): Promise<void>;
  pickImportFile(): Promise<ImportResult>;
  applyImport(data: ExportedAppData): void;
}
