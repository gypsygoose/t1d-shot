import { useCallback, useRef } from "react";
import { AppStorage } from "../types";
import { StorageService } from "../storage";

// Debounce delay before persisting a pointStates/events change to
// AsyncStorage.
const SAVE_DEBOUNCE_MS = 300;

// Returns a stable function that debounces persisting pointStates/events
// edits, so rapid successive point actions (or a zone-grid resize) collapse
// into a single AsyncStorage write. Shared by usePointActions and
// useZoneSettings via one saveRef, so their writes debounce against each
// other too, not just within themselves.
export function useDebouncedSave(): (nextState: AppStorage) => void {
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  return useCallback((nextState: AppStorage) => {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => StorageService.saveStorage(nextState), SAVE_DEBOUNCE_MS);
  }, []);
}
