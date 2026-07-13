import { StoredPointState } from "../../types";
import { DAY_MS } from "../constants";
import { daysBetween } from "./daysBetween";

// Days elapsed since the start of the point's current color cycle (normal
// injection cycle, or the post-blackout cycle once blackout has ended) — the
// same reference PointService.computePointColor uses to pick a color.
// Returns undefined when there's no cycle in progress: the point has never
// been used, or it's still in an active system blackout (black) — callers
// (PointService.daysUntilAvailable) only reach here once computePointColor
// has already ruled out gray/black/white.
export function daysSinceCycleStart(
  state: StoredPointState,
  now: number,
): number | undefined {
  const hasBlackout =
    state.blackoutStartedAt !== undefined &&
    state.blackoutDurationDays !== undefined;

  if (hasBlackout) {
    const blackoutEnd =
      state.blackoutStartedAt! + state.blackoutDurationDays! * DAY_MS;
    const injectionAfterBlackout =
      state.lastInjectionAt !== undefined &&
      state.lastInjectionAt > state.blackoutStartedAt!;

    if (!injectionAfterBlackout) {
      if (now < blackoutEnd) return undefined;
      return daysBetween(blackoutEnd, now);
    }
  }

  if (state.lastInjectionAt === undefined) return undefined;
  return daysBetween(state.lastInjectionAt, now);
}
