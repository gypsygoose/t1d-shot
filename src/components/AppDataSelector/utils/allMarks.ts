import { ZoneType } from "../../../types";
import { ZONE_TYPES } from "../../../data";

// Builds a uniform-value marks record — ExportOptionsDialog/ClearOptionsDialog
// both use this for their own default ExportSelection.
export function allMarks(value: boolean): Record<ZoneType, boolean> {
  return Object.fromEntries(
    ZONE_TYPES.map((zoneType) => [zoneType, value]),
  ) as Record<ZoneType, boolean>;
}
