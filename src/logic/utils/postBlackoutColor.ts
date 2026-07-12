import { PointColor } from "../../types";
import { activeCycleColors } from "./activeCycleColors";

// After blackout ends: cycle starts at red (maroon is skipped)
export function postBlackoutColor(
  daysSinceEnd: number,
  daysToWhite: number,
): PointColor {
  const active = activeCycleColors(daysToWhite).filter(
    (color) => color !== PointColor.Maroon,
  );
  return daysSinceEnd < active.length
    ? active[daysSinceEnd]
    : PointColor.White;
}
