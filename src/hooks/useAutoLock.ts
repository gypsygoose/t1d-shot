import { useCallback, useEffect, useRef } from "react";
import { StorageService, StoredAutoLock } from "../storage";
import { SECOND_MS } from "../constants";
import { AppState, SetAppState } from "./types";

interface UseAutoLockParams {
  state: AppState;
  setState: SetAppState;
  // Called when auto-lock engages on its own (countdown elapsed while the
  // app was open) — not when the user locks the interface manually via
  // setInterfaceLocked, which the caller already notifies itself. Read
  // through a ref so passing a fresh arrow function each render doesn't
  // retrigger the effect that owns the countdown timer below.
  onAutoLockFired?: () => void;
}

interface AutoLockActions {
  setInterfaceLocked(locked: boolean): void;
  enableAutoLock(afterMarkSeconds: number, afterUnlockSeconds: number): void;
  disableAutoLock(): void;
  updateAutoLockTimes(afterMarkSeconds: number, afterUnlockSeconds: number): void;
}

export function useAutoLock({ state, setState, onAutoLockFired }: UseAutoLockParams): AutoLockActions {
  const onAutoLockFiredRef = useRef(onAutoLockFired);
  onAutoLockFiredRef.current = onAutoLockFired;

  // Fires the pending auto-lock deadline (set by an unlock or a mark, see
  // setInterfaceLocked/usePointActions's pressPoint) while the app is
  // running. Reruns whenever the deadline is pushed out, so the latest one
  // always wins.
  useEffect(() => {
    if (!state.isLoaded) return;
    if (!state.autoLockEnabled) return;
    if (state.interfaceLocked) return;
    if (state.autoLockDeadline === null) return;

    const fire = () => {
      setState((prev) => ({ ...prev, interfaceLocked: true, autoLockDeadline: null }));
      StorageService.saveInterfaceLocked(true);
      StorageService.saveAutoLock({
        enabled: state.autoLockEnabled,
        afterMarkSeconds: state.autoLockAfterMarkSeconds,
        afterUnlockSeconds: state.autoLockAfterUnlockSeconds,
        deadline: null,
      });
      onAutoLockFiredRef.current?.();
    };

    const delay = state.autoLockDeadline - Date.now();
    if (delay <= 0) {
      fire();
      return;
    }
    const id = setTimeout(fire, delay);
    return () => clearTimeout(id);
  }, [
    state.isLoaded,
    state.autoLockEnabled,
    state.interfaceLocked,
    state.autoLockDeadline,
    state.autoLockAfterMarkSeconds,
    state.autoLockAfterUnlockSeconds,
    setState,
  ]);

  const setInterfaceLocked = useCallback(
    (locked: boolean) => {
      setState((prev) => {
        // Unlocking (re-)arms the auto-lock countdown; locking cancels it.
        let autoLockDeadline: number | null = locked ? null : prev.autoLockDeadline;
        if (!locked && prev.autoLockEnabled) {
          autoLockDeadline = Date.now() + prev.autoLockAfterUnlockSeconds * SECOND_MS;
        }
        if (autoLockDeadline !== prev.autoLockDeadline) {
          StorageService.saveAutoLock({
            enabled: prev.autoLockEnabled,
            afterMarkSeconds: prev.autoLockAfterMarkSeconds,
            afterUnlockSeconds: prev.autoLockAfterUnlockSeconds,
            deadline: autoLockDeadline,
          });
        }
        return { ...prev, interfaceLocked: locked, autoLockDeadline };
      });
      StorageService.saveInterfaceLocked(locked);
    },
    [setState],
  );

  const enableAutoLock = useCallback(
    (afterMarkSeconds: number, afterUnlockSeconds: number) => {
      setState((prev) => {
        const deadline = prev.interfaceLocked ? null : Date.now() + afterUnlockSeconds * SECOND_MS;
        const stored: StoredAutoLock = {
          enabled: true,
          afterMarkSeconds,
          afterUnlockSeconds,
          deadline,
        };
        StorageService.saveAutoLock(stored);
        return {
          ...prev,
          autoLockEnabled: true,
          autoLockAfterMarkSeconds: afterMarkSeconds,
          autoLockAfterUnlockSeconds: afterUnlockSeconds,
          autoLockDeadline: deadline,
        };
      });
    },
    [setState],
  );

  const disableAutoLock = useCallback(() => {
    setState((prev) => {
      const stored: StoredAutoLock = {
        enabled: false,
        afterMarkSeconds: prev.autoLockAfterMarkSeconds,
        afterUnlockSeconds: prev.autoLockAfterUnlockSeconds,
        deadline: null,
      };
      StorageService.saveAutoLock(stored);
      return { ...prev, autoLockEnabled: false, autoLockDeadline: null };
    });
  }, [setState]);

  // Edits the configured durations without touching whether auto-lock is
  // currently on or any countdown already in flight.
  const updateAutoLockTimes = useCallback(
    (afterMarkSeconds: number, afterUnlockSeconds: number) => {
      setState((prev) => {
        const stored: StoredAutoLock = {
          enabled: prev.autoLockEnabled,
          afterMarkSeconds,
          afterUnlockSeconds,
          deadline: prev.autoLockDeadline,
        };
        StorageService.saveAutoLock(stored);
        return {
          ...prev,
          autoLockAfterMarkSeconds: afterMarkSeconds,
          autoLockAfterUnlockSeconds: afterUnlockSeconds,
        };
      });
    },
    [setState],
  );

  return { setInterfaceLocked, enableAutoLock, disableAutoLock, updateAutoLockTimes };
}
