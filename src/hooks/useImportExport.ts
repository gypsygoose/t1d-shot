import { MutableRefObject, useCallback } from "react";
import {
  AppEvent,
  AppEventType,
  ExportedAppData,
  ExportSettingKey,
  ZoneRuntimeData,
} from "../types";
import { ImportResult, StorageService } from "../storage";
import { SECOND_MS } from "../constants";
import {
  appendEvent,
  buildBulkEventSettings,
  computeZoneBackfill,
  uuid,
} from "../utils";
import {
  AppState,
  ApplyImportParams,
  ExportDataParams,
  SetAppState,
} from "./types";

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
  applyImport(params: ApplyImportParams): void;
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
      if (Object.values(selection.marks).some(Boolean)) {
        data.pointStates = state.pointStates;
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
  // (because ImportOptionsDialog excluded it) leaves that category's
  // current state/storage untouched instead of resetting it. Doesn't
  // persist data.themeMode/languageMode — the caller applies those via
  // ThemeProvider/LanguageProvider's setMode, which own their storage keys;
  // the params' themeMode/languageMode are only the *current* values,
  // captured into the undo snapshot. Every confirmed import appends one
  // BulkAppEvent snapshotting the whole pre-import pointStates map and
  // settings, so undo can revert it wholesale (see src/types/event.ts).
  const applyImport = useCallback(
    ({ data, themeMode, languageMode }: ApplyImportParams) => {
      setState((prev) => {
        const next: AppState = { ...prev };

        const importEvent: AppEvent = {
          id: uuid(),
          timestamp: Date.now(),
          type: AppEventType.Import,
          prevPointStates: prev.pointStates,
          prevSettings: buildBulkEventSettings({
            state: prev,
            themeMode,
            languageMode,
          }),
        };
        next.events = appendEvent(prev.events, importEvent);
        StorageService.saveEvents(next.events);

        if (data.pointStates !== undefined) {
          next.pointStates = data.pointStates;
          StorageService.savePointStates(data.pointStates);
        }
        if (data.mirrored !== undefined) {
          next.mirrored = data.mirrored;
          StorageService.saveMirrored(data.mirrored);
        }

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
          next.pointStates = computeZoneBackfill({
            zonePointCounts: nextZonePointCounts,
            enabledZones: nextEnabledZones,
            pointStates: next.pointStates,
          });
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
    },
    [setState],
  );

  return { exportData, pickImportFile, applyImport };
}
