import { MutableRefObject, useCallback } from "react";
import { AppEvent, AppEventType, StoredPointState, ZoneRuntimeData } from "../types";
import { StorageService } from "../storage";
import { PointService, PressResultType } from "../logic";
import { SECOND_MS } from "../constants";
import { appendEvent, isBulkAppEvent, uuid } from "../utils";
import { ScheduleSave } from "./useDebouncedSave";
import { SetAppState } from "./types";

interface UsePointActionsParams {
  setState: SetAppState;
  zoneDataRef: MutableRefObject<ZoneRuntimeData>;
  scheduleSave: ScheduleSave;
}

interface PointActions {
  pressPoint(pointId: string): void;
  blockPoint(pointId: string): void;
  unblockPoint(pointId: string): void;
  markPointAt(pointId: string, timestamp: number): void;
  clearPoint(pointId: string): void;
  undo(): void;
}

export function usePointActions({ setState, zoneDataRef, scheduleSave }: UsePointActionsParams): PointActions {
  const pressPoint = useCallback(
    (pointId: string) => {
      setState((prev) => {
        const now = Date.now();
        const point = zoneDataRef.current.pointMap[pointId];
        if (!point) return prev;

        const currentPointState = prev.pointStates[pointId];
        const result = PointService.onPress({
          state: currentPointState,
          now,
          daysToWhite: prev.daysToWhite,
          daysToAvailable: prev.daysToAvailable,
          pointRestoreMode: prev.pointRestoreMode,
        });
        if (
          result.type === PressResultType.Blocked ||
          result.type === PressResultType.Unavailable
        )
          return prev;

        const event: AppEvent = {
          id: uuid(),
          timestamp: now,
          type:
            result.type === PressResultType.Injection
              ? AppEventType.Injection
              : AppEventType.Blackout,
          pointId,
          zoneId: point.zoneId,
          prevPointState: { ...currentPointState },
        };

        const nextPointStates = {
          ...prev.pointStates,
          [pointId]: result.newState,
        };
        const nextEvents = appendEvent(prev.events, event);
        scheduleSave(nextPointStates, nextEvents);

        // Marking a zone re-arms the auto-lock countdown.
        let autoLockDeadline = prev.autoLockDeadline;
        if (prev.autoLockEnabled) {
          autoLockDeadline = now + prev.autoLockAfterMarkSeconds * SECOND_MS;
          StorageService.saveAutoLock({
            enabled: prev.autoLockEnabled,
            afterMarkSeconds: prev.autoLockAfterMarkSeconds,
            afterUnlockSeconds: prev.autoLockAfterUnlockSeconds,
            deadline: autoLockDeadline,
          });
        }

        return { ...prev, pointStates: nextPointStates, events: nextEvents, now, autoLockDeadline };
      });
    },
    [setState, zoneDataRef, scheduleSave],
  );

  const blockPoint = useCallback(
    (pointId: string) => {
      setState((prev) => {
        const now = Date.now();
        const point = zoneDataRef.current.pointMap[pointId];
        if (!point) return prev;

        const currentPointState = prev.pointStates[pointId];
        const newPointState: StoredPointState = {
          ...currentPointState,
          pointId,
          isManuallyBlocked: true,
          manuallyBlockedAt: now,
        };

        const event: AppEvent = {
          id: uuid(),
          timestamp: now,
          type: AppEventType.ManualBlock,
          pointId,
          zoneId: point.zoneId,
          prevPointState: currentPointState
            ? { ...currentPointState }
            : { pointId, isManuallyBlocked: false },
        };

        const nextPointStates = { ...prev.pointStates, [pointId]: newPointState };
        const nextEvents = appendEvent(prev.events, event);
        scheduleSave(nextPointStates, nextEvents);
        return { ...prev, pointStates: nextPointStates, events: nextEvents, now };
      });
    },
    [setState, zoneDataRef, scheduleSave],
  );

  const unblockPoint = useCallback(
    (pointId: string) => {
      setState((prev) => {
        const now = Date.now();
        const point = zoneDataRef.current.pointMap[pointId];
        if (!point) return prev;

        const currentPointState = prev.pointStates[pointId];
        if (!currentPointState) return prev;
        const newPointState: StoredPointState = {
          ...currentPointState,
          isManuallyBlocked: false,
          manuallyBlockedAt: undefined,
        };

        const event: AppEvent = {
          id: uuid(),
          timestamp: now,
          type: AppEventType.ManualUnblock,
          pointId,
          zoneId: point.zoneId,
          prevPointState: { ...currentPointState },
        };

        const nextPointStates = { ...prev.pointStates, [pointId]: newPointState };
        const nextEvents = appendEvent(prev.events, event);
        scheduleSave(nextPointStates, nextEvents);
        return { ...prev, pointStates: nextPointStates, events: nextEvents, now };
      });
    },
    [setState, zoneDataRef, scheduleSave],
  );

  // Records the point as if it had been pressed at the given timestamp
  // instead of now, reusing the normal press state machine.
  const markPointAt = useCallback(
    (pointId: string, timestamp: number) => {
      setState((prev) => {
        const now = Date.now();
        const point = zoneDataRef.current.pointMap[pointId];
        if (!point) return prev;

        const currentPointState = prev.pointStates[pointId];
        const result = PointService.onPress({
          state: currentPointState,
          now: timestamp,
          daysToWhite: prev.daysToWhite,
          daysToAvailable: prev.daysToAvailable,
          pointRestoreMode: prev.pointRestoreMode,
        });
        if (
          result.type === PressResultType.Blocked ||
          result.type === PressResultType.Unavailable
        )
          return prev;

        const event: AppEvent = {
          id: uuid(),
          timestamp,
          type:
            result.type === PressResultType.Injection
              ? AppEventType.Injection
              : AppEventType.Blackout,
          pointId,
          zoneId: point.zoneId,
          prevPointState: currentPointState
            ? { ...currentPointState }
            : { pointId, isManuallyBlocked: false },
        };

        const nextPointStates = { ...prev.pointStates, [pointId]: result.newState };
        const nextEvents = appendEvent(prev.events, event);
        scheduleSave(nextPointStates, nextEvents);
        return { ...prev, pointStates: nextPointStates, events: nextEvents, now };
      });
    },
    [setState, zoneDataRef, scheduleSave],
  );

  const clearPoint = useCallback(
    (pointId: string) => {
      setState((prev) => {
        const now = Date.now();
        const point = zoneDataRef.current.pointMap[pointId];
        if (!point) return prev;

        const currentPointState = prev.pointStates[pointId];
        const newPointState: StoredPointState = { pointId, isManuallyBlocked: false };

        const event: AppEvent = {
          id: uuid(),
          timestamp: now,
          type: AppEventType.ManualClear,
          pointId,
          zoneId: point.zoneId,
          prevPointState: currentPointState
            ? { ...currentPointState }
            : { pointId, isManuallyBlocked: false },
        };

        const nextPointStates = { ...prev.pointStates, [pointId]: newPointState };
        const nextEvents = appendEvent(prev.events, event);
        scheduleSave(nextPointStates, nextEvents);
        return { ...prev, pointStates: nextPointStates, events: nextEvents, now };
      });
    },
    [setState, zoneDataRef, scheduleSave],
  );

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.events.length === 0) return prev;
      const last = prev.events[prev.events.length - 1];
      const nextEvents = prev.events.slice(0, -1);

      // A bulk clear/import event restores the entire snapshot it carries —
      // the whole pointStates map plus every setting (see BulkAppEvent).
      // themeMode/languageMode are provider-owned and restored by
      // MainScreen's onUndo wrapper instead. The auto-lock deadline is
      // recomputed rather than restored, so undo can't revive an
      // already-elapsed deadline and instantly lock the interface.
      if (isBulkAppEvent(last)) {
        const settings = last.prevSettings;
        const autoLockDeadline =
          settings.autoLockEnabled && !prev.interfaceLocked
            ? Date.now() + settings.autoLockAfterUnlockSeconds * SECOND_MS
            : null;
        StorageService.saveMirrored(settings.mirrored);
        StorageService.saveAutoLock({
          enabled: settings.autoLockEnabled,
          afterMarkSeconds: settings.autoLockAfterMarkSeconds,
          afterUnlockSeconds: settings.autoLockAfterUnlockSeconds,
          deadline: autoLockDeadline,
        });
        StorageService.saveDaysToWhite(settings.daysToWhite);
        StorageService.saveDaysToAvailable(settings.daysToAvailable);
        StorageService.savePointRestoreMode(settings.pointRestoreMode);
        StorageService.saveGender(settings.gender);
        StorageService.saveZonePointCounts(settings.zonePointCounts);
        StorageService.saveEnabledZones(settings.enabledZones);
        scheduleSave(last.prevPointStates, nextEvents);
        return {
          ...prev,
          pointStates: last.prevPointStates,
          events: nextEvents,
          mirrored: settings.mirrored,
          autoLockEnabled: settings.autoLockEnabled,
          autoLockAfterMarkSeconds: settings.autoLockAfterMarkSeconds,
          autoLockAfterUnlockSeconds: settings.autoLockAfterUnlockSeconds,
          autoLockDeadline,
          daysToWhite: settings.daysToWhite,
          daysToAvailable: settings.daysToAvailable,
          pointRestoreMode: settings.pointRestoreMode,
          gender: settings.gender,
          zonePointCounts: settings.zonePointCounts,
          enabledZones: settings.enabledZones,
        };
      }

      const nextPointStates = {
        ...prev.pointStates,
        [last.pointId]: last.prevPointState,
      };
      scheduleSave(nextPointStates, nextEvents);
      return { ...prev, pointStates: nextPointStates, events: nextEvents };
    });
  }, [setState, scheduleSave]);

  return { pressPoint, blockPoint, unblockPoint, markPointAt, clearPoint, undo };
}
