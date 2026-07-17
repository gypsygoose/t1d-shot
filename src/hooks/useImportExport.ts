import { MutableRefObject, useCallback } from "react";
import { ExportedAppData, ExportMarksKey, ExportSettingKey, ZoneRuntimeData } from "../types";
import { ImportResult, StorageService } from "../storage";
import { SECOND_MS } from "../constants";
import { computeZoneBackfill, partitionEventsByBlock, partitionPointStatesByBlock } from "../utils";
import { AppState, ExportDataParams, SetAppState } from "./types";

interface UseImportExportParams {
  state: AppState;
  setState: SetAppState;
  // Read by pickImportFile so it always sees the live active-points list —
  // see useZoneSettings.ts's zoneDataRef.
  zoneDataRef: MutableRefObject<ZoneRuntimeData>;
}

interface ImportExportActions {
  exportData(params: ExportDataParams): Promise<void>;
  pickImportFile(): Promise<ImportResult>;
  applyImport(data: ExportedAppData): void;
}

export function useImportExport({ state, setState, zoneDataRef }: UseImportExportParams): ImportExportActions {
  // themeMode/languageMode are passed in rather than read from state —
  // they're owned by ThemeProvider/LanguageProvider (mounted in App.tsx,
  // above this hook's caller), not by this store. See
  // src/theme/ThemeContext.tsx and src/i18n/LanguageContext.tsx.
  // `dialogTitle` is pre-formatted by the caller (via
  // t('menu.exportOptionsDialog.shareDialogTitle')) so this hook stays free
  // of an i18next dependency, like StorageService.exportStorageToFile.
  // `selection` (from ExportOptionsDialog) picks which categories actually
  // make it into the file — omitted categories are left out of the object
  // entirely, not written with a default, so a partial file round-trips
  // correctly through the merge-import logic in applyImport below.
  const exportData = useCallback(
    async ({ themeMode, languageMode, dialogTitle, selection }: ExportDataParams) => {
      const data: ExportedAppData = {};
      const activePointsSelected = selection.marks[ExportMarksKey.ActivePoints];
      const blockedPointsSelected = selection.marks[ExportMarksKey.BlockedPoints];
      if (activePointsSelected && blockedPointsSelected) {
        data.pointStates = state.pointStates;
        data.events = state.events;
      } else if (activePointsSelected || blockedPointsSelected) {
        const { active: activePointStates, blocked: blockedPointStates } =
          partitionPointStatesByBlock(state.pointStates);
        const { active: activeEvents, blocked: blockedEvents } =
          partitionEventsByBlock(state.events);
        data.pointStates = activePointsSelected ? activePointStates : blockedPointStates;
        data.events = activePointsSelected ? activeEvents : blockedEvents;
      }
      if (selection.settings[ExportSettingKey.Mirrored]) {
        data.mirrored = state.mirrored;
      }
      if (selection.settings[ExportSettingKey.AutoLock]) {
        data.autoLockEnabled = state.autoLockEnabled;
        data.autoLockAfterMarkSeconds = state.autoLockAfterMarkSeconds;
        data.autoLockAfterUnlockSeconds = state.autoLockAfterUnlockSeconds;
      }
      if (selection.settings[ExportSettingKey.EnabledZones]) {
        data.enabledZones = state.enabledZones;
      }
      if (selection.settings[ExportSettingKey.ZonePointCounts]) {
        data.zonePointCounts = state.zonePointCounts;
      }
      if (selection.settings[ExportSettingKey.PointRestoreMode]) {
        data.pointRestoreMode = state.pointRestoreMode;
      }
      if (selection.settings[ExportSettingKey.Gender]) {
        data.gender = state.gender;
      }
      if (selection.settings[ExportSettingKey.DaysToWhite]) {
        data.daysToWhite = state.daysToWhite;
      }
      if (selection.settings[ExportSettingKey.DaysToAvailable]) {
        data.daysToAvailable = state.daysToAvailable;
      }
      if (selection.settings[ExportSettingKey.Language]) {
        data.languageMode = languageMode;
      }
      if (selection.settings[ExportSettingKey.Theme]) {
        data.themeMode = themeMode;
      }
      await StorageService.exportStorageToFile(data, dialogTitle);
    },
    [
      state.pointStates,
      state.events,
      state.mirrored,
      state.autoLockEnabled,
      state.autoLockAfterMarkSeconds,
      state.autoLockAfterUnlockSeconds,
      state.daysToWhite,
      state.daysToAvailable,
      state.pointRestoreMode,
      state.gender,
      state.zonePointCounts,
      state.enabledZones,
    ],
  );

  const pickImportFile = useCallback(
    () => StorageService.pickImportFile(zoneDataRef.current.points),
    [zoneDataRef],
  );

  // Merge-imports whatever categories `data` carries — a field left absent
  // (because ExportOptionsDialog excluded it) leaves that category's
  // current state/storage untouched instead of resetting it. Doesn't
  // persist data.themeMode — the caller applies it via ThemeProvider's
  // setMode, which owns that setting's storage key.
  const applyImport = useCallback(
    (data: ExportedAppData) => {
      setState((prev) => {
        const next: AppState = { ...prev };

        if (data.pointStates !== undefined) next.pointStates = data.pointStates;
        if (data.events !== undefined) next.events = data.events;
        if (data.mirrored !== undefined) next.mirrored = data.mirrored;

        if (data.autoLockEnabled !== undefined) {
          const afterMarkSeconds =
            data.autoLockAfterMarkSeconds ?? prev.autoLockAfterMarkSeconds;
          const afterUnlockSeconds =
            data.autoLockAfterUnlockSeconds ?? prev.autoLockAfterUnlockSeconds;
          const deadline =
            data.autoLockEnabled && !prev.interfaceLocked
              ? Date.now() + afterUnlockSeconds * SECOND_MS
              : null;
          StorageService.saveAutoLock({
            enabled: data.autoLockEnabled,
            afterMarkSeconds,
            afterUnlockSeconds,
            deadline,
          });
          next.autoLockEnabled = data.autoLockEnabled;
          next.autoLockAfterMarkSeconds = afterMarkSeconds;
          next.autoLockAfterUnlockSeconds = afterUnlockSeconds;
          next.autoLockDeadline = deadline;
        }

        // Same backfill-defaults treatment as setZonePointCounts/
        // setEnabledZones, since an imported grid or zone selection may
        // bring previously out-of-range/disabled slots into range. Handled
        // together (rather than as two independent ifs) so a file carrying
        // only one of the two still recomputes active points against the
        // other's current value instead of stale data.
        if (data.zonePointCounts !== undefined || data.enabledZones !== undefined) {
          const nextZonePointCounts = data.zonePointCounts ?? prev.zonePointCounts;
          const nextEnabledZones = data.enabledZones ?? prev.enabledZones;
          const normalized = computeZoneBackfill({
            zonePointCounts: nextZonePointCounts,
            enabledZones: nextEnabledZones,
            storage: { pointStates: next.pointStates, events: next.events },
          });
          next.pointStates = normalized.pointStates;
          next.events = normalized.events;
          if (data.zonePointCounts !== undefined) {
            next.zonePointCounts = data.zonePointCounts;
            StorageService.saveZonePointCounts(data.zonePointCounts);
          }
          if (data.enabledZones !== undefined) {
            next.enabledZones = data.enabledZones;
            StorageService.saveEnabledZones(data.enabledZones);
          }
        }

        if (data.pointRestoreMode !== undefined) {
          StorageService.savePointRestoreMode(data.pointRestoreMode);
          next.pointRestoreMode = data.pointRestoreMode;
        }

        if (data.gender !== undefined) {
          StorageService.saveGender(data.gender);
          next.gender = data.gender;
        }

        if (data.daysToWhite !== undefined) {
          StorageService.saveDaysToWhite(data.daysToWhite);
          next.daysToWhite = data.daysToWhite;
        }

        if (data.daysToAvailable !== undefined) {
          StorageService.saveDaysToAvailable(data.daysToAvailable);
          next.daysToAvailable = data.daysToAvailable;
        }

        return next;
      });
      StorageService.importStorage(data);
    },
    [setState],
  );

  return { exportData, pickImportFile, applyImport };
}
