import { useCallback } from "react";
import { AppEvent, AppEventType, ExportSettingKey } from "../types";
import {
  DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
  DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
  StorageService,
} from "../storage";
import {
  DEFAULT_ENABLED_ZONES,
  DEFAULT_ZONE_POINT_COUNTS,
  ZONE_TYPE,
  ZONE_TYPES,
  zoneIdFromPointId,
} from "../data";
import {
  DEFAULT_DAYS_TO_AVAILABLE,
  DEFAULT_DAYS_TO_WHITE,
  DEFAULT_GENDER,
  DEFAULT_POINT_RESTORE_MODE,
} from "../constants";
import {
  appendEvent,
  buildBulkEventSettings,
  computeZoneBackfill,
  resetPointStates,
  uuid,
} from "../utils";
import { AppState, ClearSelectedParams, SetAppState } from "./types";

// Resets exactly the selected marks/settings categories to their defaults,
// leaving every unselected category — and, within marks, every zone type
// not selected — untouched. Mirrors exportData's selection semantics as an
// in-place reset instead of a file write (see ClearOptionsDialog, built on
// AppDataSelector). Doesn't reset themeMode/languageMode: like applyImport,
// the caller resets those via ThemeProvider/LanguageProvider's own setMode
// when selection.settings[ExportSettingKey.Theme/Language] is checked — the
// params' themeMode/languageMode are only the *current* values, captured
// into the undo snapshot below. Every confirmed clear appends one
// BulkAppEvent snapshotting the whole pre-clear pointStates map and
// settings, so undo can revert it wholesale (see src/types/event.ts).
export function useClearSelected(setState: SetAppState): (params: ClearSelectedParams) => void {
  return useCallback(
    ({ selection, themeMode, languageMode }: ClearSelectedParams) => {
      setState((prev) => {
        const next: AppState = { ...prev };

        const clearEvent: AppEvent = {
          id: uuid(),
          timestamp: Date.now(),
          type: AppEventType.ClearSelected,
          prevPointStates: prev.pointStates,
          prevSettings: buildBulkEventSettings({
            state: prev,
            themeMode,
            languageMode,
          }),
        };
        next.events = appendEvent(prev.events, clearEvent);

        const selectedZoneTypes = ZONE_TYPES.filter(
          (zoneType) => selection.marks[zoneType],
        );
        if (selectedZoneTypes.length > 0) {
          const pointIdsToReset = Object.keys(prev.pointStates).filter(
            (pointId) =>
              selectedZoneTypes.includes(ZONE_TYPE[zoneIdFromPointId(pointId)]),
          );
          next.pointStates = {
            ...prev.pointStates,
            ...resetPointStates(pointIdsToReset),
          };
          StorageService.savePointStates(next.pointStates);
        }

        if (selection.settings[ExportSettingKey.Mirrored]) {
          next.mirrored = false;
          StorageService.saveMirrored(false);
        }

        if (selection.settings[ExportSettingKey.AutoLock]) {
          next.autoLockEnabled = false;
          next.autoLockAfterMarkSeconds = DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS;
          next.autoLockAfterUnlockSeconds = DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS;
          next.autoLockDeadline = null;
          StorageService.saveAutoLock({
            enabled: false,
            afterMarkSeconds: DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
            afterUnlockSeconds: DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
            deadline: null,
          });
        }

        // Same combined-backfill treatment as applyImport/setZonePointCounts/
        // setEnabledZones, since resetting either the grid or the zone
        // selection may bring previously out-of-range/disabled slots into
        // range — handled together so resetting only one still recomputes
        // active points against the other's current value instead of stale
        // data.
        if (
          selection.settings[ExportSettingKey.ZonePointCounts] ||
          selection.settings[ExportSettingKey.EnabledZones]
        ) {
          const nextZonePointCounts = selection.settings[
            ExportSettingKey.ZonePointCounts
          ]
            ? DEFAULT_ZONE_POINT_COUNTS
            : prev.zonePointCounts;
          const nextEnabledZones = selection.settings[
            ExportSettingKey.EnabledZones
          ]
            ? DEFAULT_ENABLED_ZONES
            : prev.enabledZones;
          next.pointStates = computeZoneBackfill({
            zonePointCounts: nextZonePointCounts,
            enabledZones: nextEnabledZones,
            pointStates: next.pointStates,
          });
          if (selection.settings[ExportSettingKey.ZonePointCounts]) {
            next.zonePointCounts = DEFAULT_ZONE_POINT_COUNTS;
            StorageService.saveZonePointCounts(DEFAULT_ZONE_POINT_COUNTS);
          }
          if (selection.settings[ExportSettingKey.EnabledZones]) {
            next.enabledZones = DEFAULT_ENABLED_ZONES;
            StorageService.saveEnabledZones(DEFAULT_ENABLED_ZONES);
          }
        }

        if (selection.settings[ExportSettingKey.PointRestoreMode]) {
          next.pointRestoreMode = DEFAULT_POINT_RESTORE_MODE;
          StorageService.savePointRestoreMode(DEFAULT_POINT_RESTORE_MODE);
        }

        if (selection.settings[ExportSettingKey.Gender]) {
          next.gender = DEFAULT_GENDER;
          StorageService.saveGender(DEFAULT_GENDER);
        }

        if (selection.settings[ExportSettingKey.DaysToWhite]) {
          next.daysToWhite = DEFAULT_DAYS_TO_WHITE;
          StorageService.saveDaysToWhite(DEFAULT_DAYS_TO_WHITE);
        }

        if (selection.settings[ExportSettingKey.DaysToAvailable]) {
          next.daysToAvailable = DEFAULT_DAYS_TO_AVAILABLE;
          StorageService.saveDaysToAvailable(DEFAULT_DAYS_TO_AVAILABLE);
        }

        StorageService.saveEvents(next.events);
        return next;
      });
    },
    [setState],
  );
}
