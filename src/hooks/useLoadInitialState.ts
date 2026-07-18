import { useEffect } from "react";
import { StorageService } from "../storage";
import { buildZoneData } from "../data";
import { SetAppState } from "./types";

// Loads every persisted setting + point data on mount. zonePointCounts/
// enabledZones load first since loadPointStates needs the resulting
// active-points list to know which point ids to backfill defaults for; the
// rest loads together (rather than each in its own .then()) so the
// just-reopened-the-app auto-lock catch-up check below always sees the real
// persisted interfaceLocked value instead of racing against it.
export function useLoadInitialState(setState: SetAppState): void {
  useEffect(() => {
    Promise.all([
      StorageService.loadZonePointCounts(),
      StorageService.loadEnabledZones(),
    ]).then(([zonePointCounts, enabledZones]) => {
      const activePoints = buildZoneData(zonePointCounts, enabledZones).points;
      Promise.all([
        StorageService.loadPointStates(activePoints),
        StorageService.loadEvents(),
        StorageService.loadMirrored(),
        StorageService.loadInterfaceLocked(),
        StorageService.loadAutoLock(),
        StorageService.loadDaysToWhite(),
        StorageService.loadDaysToAvailable(),
        StorageService.loadPointRestoreMode(),
        StorageService.loadGender(),
      ]).then(([pointStates, events, mirrored, storedInterfaceLocked, autoLock, daysToWhite, daysToAvailable, pointRestoreMode, gender]) => {
        const now = Date.now();
        let interfaceLocked = storedInterfaceLocked;
        let deadline = autoLock.deadline;
        // App may have been closed past the deadline — lock immediately
        // instead of waiting for a timer that already should have fired.
        if (
          autoLock.enabled &&
          !interfaceLocked &&
          deadline !== null &&
          now >= deadline
        ) {
          interfaceLocked = true;
          deadline = null;
        }
        if (interfaceLocked !== storedInterfaceLocked) {
          StorageService.saveInterfaceLocked(interfaceLocked);
        }
        if (deadline !== autoLock.deadline) {
          StorageService.saveAutoLock({ ...autoLock, deadline });
        }
        setState((prev) => ({
          ...prev,
          pointStates,
          events,
          mirrored,
          interfaceLocked,
          autoLockEnabled: autoLock.enabled,
          autoLockAfterMarkSeconds: autoLock.afterMarkSeconds,
          autoLockAfterUnlockSeconds: autoLock.afterUnlockSeconds,
          autoLockDeadline: deadline,
          daysToWhite,
          daysToAvailable,
          pointRestoreMode,
          gender,
          zonePointCounts,
          enabledZones,
          isLoaded: true,
        }));
      });
    });
  }, [setState]);
}
