import { useState, useEffect, useCallback, useRef } from 'react';
import { AppStorage, AppEvent, ZoneGroup } from '../types';
import { loadStorage, saveStorage, clearStorage } from '../storage/storage';
import { onPress, toggleManualBlock, computeButtonColor } from '../logic/stateMachine';
import { BUTTON_MAP, ZONE_MAP } from '../data/zones';
function uuid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

export interface AppState extends AppStorage {
  now: number;
  isLoaded: boolean;
}

export interface AppActions {
  pressButton(buttonId: string): void;
  longPressButton(buttonId: string): void;
  undo(): void;
  clearAll(): void;
}

// Derive last-pressed buttonId per group from event log
function lastPressedByGroup(events: AppEvent[]): Record<ZoneGroup, string | null> {
  const result: Record<ZoneGroup, string | null> = {
    thighs: null,
    'shoulders-and-belly': null,
  };
  // events are appended newest-last, walk from end
  for (let i = events.length - 1; i >= 0; i--) {
    const ev = events[i];
    if (ev.type !== 'injection' && ev.type !== 'blackout') continue;
    const zone = ZONE_MAP[ev.zoneId];
    if (!zone) continue;
    if (result[zone.group] === null) {
      result[zone.group] = ev.buttonId;
    }
    if (result.thighs !== null && result['shoulders-and-belly'] !== null) break;
  }
  return result;
}

export function useAppStore(): [AppState & { lastInGroup: Record<ZoneGroup, string | null> }, AppActions] {
  const [state, setState] = useState<AppState>({
    buttonStates: {},
    events: [],
    now: Date.now(),
    isLoaded: false,
  });
  const saveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load from storage on mount
  useEffect(() => {
    loadStorage().then((stored) => {
      setState((prev) => ({ ...prev, ...stored, isLoaded: true }));
    });
  }, []);

  // Tick now every 60 s
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => ({ ...prev, now: Date.now() }));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Debounced persist to AsyncStorage
  function scheduleSave(nextState: AppStorage) {
    if (saveRef.current) clearTimeout(saveRef.current);
    saveRef.current = setTimeout(() => saveStorage(nextState), 300);
  }

  const pressButton = useCallback((buttonId: string) => {
    setState((prev) => {
      const now = Date.now();
      const btn = BUTTON_MAP[buttonId];
      if (!btn) return prev;

      const currentBtnState = prev.buttonStates[buttonId];
      const result = onPress(currentBtnState, now);
      if (result.kind === 'blocked') return prev;

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type: result.kind,
        buttonId,
        zoneId: btn.zoneId,
        prevButtonState: { ...currentBtnState },
      };

      const nextButtonStates = {
        ...prev.buttonStates,
        [buttonId]: result.newState,
      };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { buttonStates: nextButtonStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const longPressButton = useCallback((buttonId: string) => {
    setState((prev) => {
      const now = Date.now();
      const btn = BUTTON_MAP[buttonId];
      if (!btn) return prev;

      const currentBtnState = prev.buttonStates[buttonId];
      // Can't long-press a black (system blocked) button
      const color = computeButtonColor(currentBtnState, now);
      if (color === 'black') return prev;

      const newBtnState = toggleManualBlock(currentBtnState);
      const eventType = newBtnState.isManuallyBlocked ? 'manual-block' : 'manual-unblock';

      const event: AppEvent = {
        id: uuid(),
        timestamp: now,
        type: eventType,
        buttonId,
        zoneId: btn.zoneId,
        prevButtonState: { ...currentBtnState },
      };

      const nextButtonStates = { ...prev.buttonStates, [buttonId]: newBtnState };
      const nextEvents = [...prev.events, event];
      const next: AppStorage = { buttonStates: nextButtonStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next, now };
    });
  }, []);

  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.events.length === 0) return prev;
      const last = prev.events[prev.events.length - 1];
      const nextButtonStates = {
        ...prev.buttonStates,
        [last.buttonId]: last.prevButtonState,
      };
      const nextEvents = prev.events.slice(0, -1);
      const next: AppStorage = { buttonStates: nextButtonStates, events: nextEvents };
      scheduleSave(next);
      return { ...prev, ...next };
    });
  }, []);

  const clearAll = useCallback(() => {
    clearStorage().then((fresh) => {
      setState((prev) => ({ ...prev, ...fresh }));
    });
  }, []);

  const lastInGroup = lastPressedByGroup(state.events);

  return [{ ...state, lastInGroup }, { pressButton, longPressButton, undo, clearAll }];
}
