import { AppEvent, AppEventType } from "../types";

export interface PartitionedEvents {
  active: AppEvent[];
  blocked: AppEvent[];
}

// Splits events into the two ExportMarksKey categories by event type —
// manual-block/manual-unblock go with the "blocked points" category,
// everything else (injection, blackout, manual-clear) with "active points".
export function partitionEventsByBlock(events: AppEvent[]): PartitionedEvents {
  const active: AppEvent[] = [];
  const blocked: AppEvent[] = [];
  for (const event of events) {
    if (
      event.type === AppEventType.ManualBlock ||
      event.type === AppEventType.ManualUnblock
    ) {
      blocked.push(event);
    } else {
      active.push(event);
    }
  }
  return { active, blocked };
}
