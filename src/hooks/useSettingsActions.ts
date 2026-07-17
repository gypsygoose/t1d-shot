import { useCallback } from "react";
import { Gender, PointRestoreMode } from "../types";
import { StorageService } from "../storage";
import { MAX_DAYS_TO_WHITE, MIN_DAYS_TO_AVAILABLE, MIN_DAYS_TO_WHITE } from "../constants";
import { SetAppState } from "./types";

interface SettingsActions {
  setMirrored(mirrored: boolean): void;
  setDaysToWhite(days: number): void;
  setDaysToAvailable(days: number): void;
  setPointRestoreMode(mode: PointRestoreMode): void;
  setGender(gender: Gender): void;
}

// The remaining plain scalar menu settings — each a self-contained
// setState + StorageService.saveXxx pair, with no cross-setting coupling
// (unlike auto-lock/zone settings, see useAutoLock.ts/useZoneSettings.ts).
export function useSettingsActions(setState: SetAppState): SettingsActions {
  const setMirrored = useCallback(
    (mirrored: boolean) => {
      setState((prev) => ({ ...prev, mirrored }));
      StorageService.saveMirrored(mirrored);
    },
    [setState],
  );

  const setDaysToWhite = useCallback(
    (days: number) => {
      const clamped = Math.min(MAX_DAYS_TO_WHITE, Math.max(MIN_DAYS_TO_WHITE, days));
      setState((prev) => ({ ...prev, daysToWhite: clamped }));
      StorageService.saveDaysToWhite(clamped);
    },
    [setState],
  );

  // Raw value is clamped only to its own absolute bounds here — its
  // effective cap against the current daysToWhite is applied at the point
  // of use (see PointService.daysUntilAvailable), not by mutating this
  // setting.
  const setDaysToAvailable = useCallback(
    (days: number) => {
      const clamped = Math.min(MAX_DAYS_TO_WHITE, Math.max(MIN_DAYS_TO_AVAILABLE, days));
      setState((prev) => ({ ...prev, daysToAvailable: clamped }));
      StorageService.saveDaysToAvailable(clamped);
    },
    [setState],
  );

  const setPointRestoreMode = useCallback(
    (mode: PointRestoreMode) => {
      setState((prev) => ({ ...prev, pointRestoreMode: mode }));
      StorageService.savePointRestoreMode(mode);
    },
    [setState],
  );

  const setGender = useCallback(
    (gender: Gender) => {
      setState((prev) => ({ ...prev, gender }));
      StorageService.saveGender(gender);
    },
    [setState],
  );

  return { setMirrored, setDaysToWhite, setDaysToAvailable, setPointRestoreMode, setGender };
}
