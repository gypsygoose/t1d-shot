import { PointColor } from "../../types";
import { activeCycleColors } from "./activeCycleColors";

export function injectionCycleColor(
  daysSince: number,
  daysToWhite: number,
): PointColor {
  const active = activeCycleColors(daysToWhite);
  return daysSince < active.length ? active[daysSince] : PointColor.White;
}
