import { MAX_DAYS_TO_WHITE, MIN_DAYS_TO_AVAILABLE } from "../../constants";

// Clamps the raw stored value to its absolute bounds only — the setting's
// effective cap against the *current* daysToWhite is applied at the point of
// use (see PointService.daysUntilAvailable), not here.
export function clampDaysToAvailable(days: number): number {
  return Math.min(MAX_DAYS_TO_WHITE, Math.max(MIN_DAYS_TO_AVAILABLE, days));
}
