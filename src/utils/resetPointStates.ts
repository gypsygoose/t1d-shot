import { StoredPointState } from "../types";

// Builds a fresh, unblocked StoredPointState for each given point id — used
// by useAppStore's clearSelected to reset every point in a selected zone
// type back to its default value.
export function resetPointStates(
  pointIds: string[],
): Record<string, StoredPointState> {
  const reset: Record<string, StoredPointState> = {};
  for (const pointId of pointIds) {
    reset[pointId] = { pointId, isManuallyBlocked: false };
  }
  return reset;
}
