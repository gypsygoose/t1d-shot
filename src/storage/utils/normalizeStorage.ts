import { PointDefinition, StoredPointState } from "../../types";

// Merge any active points not yet present (e.g. loading data saved by an
// older app version, a file imported from a different point in time, or a
// zone grid that just grew to include a previously out-of-range slot).
// `activePoints` is the current ZonePointCounts-derived point list (see
// data/zones.ts's buildZoneData) — a stored point outside that list (either
// truly stale, or just currently hidden by a smaller grid) is left
// untouched rather than dropped, so its history survives a future resize.
export function normalizeStorage(
  pointStates: Record<string, StoredPointState> | undefined,
  activePoints: PointDefinition[],
): Record<string, StoredPointState> {
  const states = { ...(pointStates ?? {}) };
  for (const point of activePoints) {
    if (!states[point.id]) {
      states[point.id] = { pointId: point.id, isManuallyBlocked: false };
    }
  }
  return states;
}
