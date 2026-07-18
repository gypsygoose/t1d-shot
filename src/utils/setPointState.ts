import { PointStatesMap, StoredPointState } from "../types";
import { isEmptyPointState } from "./isEmptyPointState";

// Returns a new PointStatesMap (never mutates the input, so React sees a
// fresh reference) with `pointId` set to `state` — or deleted, if `state`
// carries no data (see isEmptyPointState). This keeps the map sparse: e.g.
// unblocking a point that was only ever manually blocked drops its entry
// entirely rather than leaving a meaningless default behind. Shared by
// usePointActions' point mutations.
export function setPointState(
  pointStates: PointStatesMap,
  pointId: string,
  state: StoredPointState,
): PointStatesMap {
  const next = new Map(pointStates);
  if (isEmptyPointState(state)) {
    next.delete(pointId);
  } else {
    next.set(pointId, state);
  }
  return next;
}
