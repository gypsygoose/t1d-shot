import {
  ZONE_TYPE_LABEL_KEY,
  ZONE_TYPE_ZONE_IDS,
  ZONE_TYPES,
} from "../../../data";
import { BuildZonePointsSummaryParams } from "../types";
import { countActiveZones } from "./countActiveZones";

// One line per ZoneType with at least one enabled side, describing that
// type's current row/column grid as a plain "rows x cols" figure (e.g.
// "Плечи: 2x1") — deliberately not pluralized prose (no "ряда"/"колонки"
// wording), since a grid dimension reads the same in every locale — a type
// with neither side enabled is left out entirely, since it renders no
// points regardless of its configured grid. Falls back to the same "all
// zones disabled" sentence buildActiveZonesSummary.ts uses when every zone
// is off.
export function buildZonePointsSummary({
  t,
  zonePointCounts,
  enabledZones,
}: BuildZonePointsSummaryParams): string[] {
  if (countActiveZones(enabledZones) === 0) {
    return [t("menu.allZonesDisabledSummary")];
  }

  const lines: string[] = [];
  for (const type of ZONE_TYPES) {
    const hasEnabledZone = ZONE_TYPE_ZONE_IDS[type].some(
      (zoneId) => enabledZones[zoneId],
    );
    if (!hasEnabledZone) continue;

    const { rows, cols } = zonePointCounts[type];
    lines.push(
      t("toast.labeledValue", {
        label: t(ZONE_TYPE_LABEL_KEY[type]),
        value: `${rows}x${cols}`,
      }),
    );
  }
  return lines;
}
