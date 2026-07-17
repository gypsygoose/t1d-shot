import { useState } from "react";
import {
  DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
  DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
} from "../storage";
import { DEFAULT_ZONE_POINT_COUNTS, DEFAULT_ENABLED_ZONES } from "../data";
import {
  DEFAULT_DAYS_TO_WHITE,
  DEFAULT_DAYS_TO_AVAILABLE,
  DEFAULT_POINT_RESTORE_MODE,
  DEFAULT_GENDER,
} from "../constants";
import { lastPressedByGroup } from "../utils";
import { AppActions, AppState, AppStoreState } from "./types";
import { useLoadInitialState } from "./useLoadInitialState";
import { useNowTicker } from "./useNowTicker";
import { useDebouncedSave } from "./useDebouncedSave";
import { useZoneSettings } from "./useZoneSettings";
import { useAutoLock } from "./useAutoLock";
import { usePointActions } from "./usePointActions";
import { useClearSelected } from "./useClearSelected";
import { useSettingsActions } from "./useSettingsActions";
import { useImportExport } from "./useImportExport";

// onAutoLockFired: called when auto-lock engages on its own (countdown
// elapsed while the app was open) — not when the user locks the interface
// manually via the bottom-bar button, which the caller already notifies
// itself. See useAutoLock.ts.
export function useAppStore(onAutoLockFired?: () => void): [AppStoreState, AppActions] {
  const [state, setState] = useState<AppState>({
    pointStates: {},
    events: [],
    now: Date.now(),
    isLoaded: false,
    mirrored: false,
    interfaceLocked: false,
    autoLockEnabled: false,
    autoLockAfterMarkSeconds: DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
    autoLockAfterUnlockSeconds: DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
    autoLockDeadline: null,
    daysToWhite: DEFAULT_DAYS_TO_WHITE,
    daysToAvailable: DEFAULT_DAYS_TO_AVAILABLE,
    pointRestoreMode: DEFAULT_POINT_RESTORE_MODE,
    gender: DEFAULT_GENDER,
    zonePointCounts: DEFAULT_ZONE_POINT_COUNTS,
    enabledZones: DEFAULT_ENABLED_ZONES,
  });

  useLoadInitialState(setState);
  useNowTicker(setState);

  const scheduleSave = useDebouncedSave();

  const { zoneData, zoneDataRef, setZonePointCounts, setEnabledZones } = useZoneSettings({
    zonePointCounts: state.zonePointCounts,
    enabledZones: state.enabledZones,
    setState,
    scheduleSave,
  });

  const { setInterfaceLocked, enableAutoLock, disableAutoLock, updateAutoLockTimes } = useAutoLock({
    state,
    setState,
    onAutoLockFired,
  });

  const { pressPoint, blockPoint, unblockPoint, markPointAt, clearPoint, undo } = usePointActions({
    setState,
    zoneDataRef,
    scheduleSave,
  });

  const clearSelected = useClearSelected(setState);

  const { setMirrored, setDaysToWhite, setDaysToAvailable, setPointRestoreMode, setGender } =
    useSettingsActions(setState);

  const { exportData, pickImportFile, applyImport } = useImportExport({ state, setState, zoneDataRef });

  const lastInGroup = lastPressedByGroup(state.pointStates, zoneData.pointMap);

  return [
    { ...state, lastInGroup, zoneData },
    {
      pressPoint,
      blockPoint,
      unblockPoint,
      markPointAt,
      clearPoint,
      undo,
      clearSelected,
      setMirrored,
      setInterfaceLocked,
      enableAutoLock,
      disableAutoLock,
      updateAutoLockTimes,
      setDaysToWhite,
      setDaysToAvailable,
      setPointRestoreMode,
      setGender,
      setZonePointCounts,
      setEnabledZones,
      exportData,
      pickImportFile,
      applyImport,
    },
  ];
}
