import { AppEvent } from "../types";
import { MAX_STORED_EVENTS } from "../constants";

// Appends a new event to the history, dropping the oldest once the list
// would exceed MAX_STORED_EVENTS — used by every useAppStore action that
// grows the undo log (pressPoint/blockPoint/unblockPoint/markPointAt/
// clearPoint).
export function appendEvent(events: AppEvent[], event: AppEvent): AppEvent[] {
  const nextEvents = [...events, event];
  if (nextEvents.length > MAX_STORED_EVENTS) {
    return nextEvents.slice(nextEvents.length - MAX_STORED_EVENTS);
  }
  return nextEvents;
}
