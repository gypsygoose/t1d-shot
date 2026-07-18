import { StoredPointState } from "../types";

// True when a point's state carries no meaningful data — not manually
// blocked, never injected, no system blackout — i.e. it's indistinguishable
// from a fresh, untouched point. Such a state is never stored: the point's
// map entry is deleted instead (see setPointState), keeping PointStatesMap
// sparse. Used only by setPointState, so it stays out of the utils/ barrel.
export function isEmptyPointState(state: StoredPointState): boolean {
  return (
    !state.isManuallyBlocked &&
    state.lastInjectionAt === undefined &&
    state.blackoutStartedAt === undefined
  );
}
