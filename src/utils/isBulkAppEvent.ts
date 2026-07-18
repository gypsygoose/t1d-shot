import { AppEvent, AppEventType, BulkAppEvent } from "../types";

// Narrows an undo-history entry to the bulk clear/import variant — used by
// usePointActions's undo (restore the whole snapshot vs. a single point) and
// MainScreen's onUndo wrapper (restore provider-owned themeMode/languageMode
// after a bulk undo).
export function isBulkAppEvent(event: AppEvent): event is BulkAppEvent {
  return (
    event.type === AppEventType.ClearSelected ||
    event.type === AppEventType.Import
  );
}
