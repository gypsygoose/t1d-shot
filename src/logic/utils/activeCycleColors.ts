import { PointColor } from "../../types";
import { FULL_CYCLE_COLORS, COLOR_REMOVAL_ORDER } from "../constants";

// Colors used for the normal injection cycle at a given daysToWhite
// setting, in day order (index === days since injection). White is
// reached once daysSince >= this list's length, i.e. on day `daysToWhite`.
// Standalone (not a PointService method) so injectionCycleColor.ts/
// postBlackoutColor.ts can call it without importing PointService.ts,
// which would otherwise cycle back here through logic/utils/index.ts.
// PointService.activeCycleColors delegates to this for its public surface.
export function activeCycleColors(daysToWhite: number): PointColor[] {
  const removeCount = FULL_CYCLE_COLORS.length - daysToWhite;
  const removed = new Set(COLOR_REMOVAL_ORDER.slice(0, removeCount));
  return FULL_CYCLE_COLORS.filter((color) => !removed.has(color));
}
