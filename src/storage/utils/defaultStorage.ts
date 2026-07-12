import { AppStorage, PointDefinition, StoredPointState } from "../../types";

export function defaultStorage(activePoints: PointDefinition[]): AppStorage {
  const pointStates: Record<string, StoredPointState> = {};
  for (const point of activePoints) {
    pointStates[point.id] = { pointId: point.id, isManuallyBlocked: false };
  }
  return { pointStates, events: [] };
}
