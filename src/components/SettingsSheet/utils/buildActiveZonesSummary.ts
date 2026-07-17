import { TFunction } from "i18next";
import {
  ZONE_SIDE_LABEL_KEY,
  ZONE_TYPE_LABEL_KEY,
  ZONE_TYPE_ZONE_IDS,
  ZONE_TYPES,
} from "../../../data";
import { EnabledZones } from "../../../types";
import { countActiveZones } from "./countActiveZones";
import { isAllZonesActive } from "./isAllZonesActive";

// One line per ZoneType with at least one enabled side, e.g. "Плечи: левое,
// правое" / "Живот: слева" — a type with neither side enabled is left out
// entirely. Omitted (empty array) once every zone is enabled — the right-side
// value already reads "Все" at that point, and a full "every side enabled"
// summary adds nothing. Falls back to a single "all zones disabled" sentence
// in the (normally unreachable, since ZonesDialog/clampEnabledZones both
// guard against it) case that every zone is off.
export function buildActiveZonesSummary(
  t: TFunction,
  enabledZones: EnabledZones,
): string[] {
  if (isAllZonesActive(enabledZones)) return [];

  if (countActiveZones(enabledZones) === 0) {
    return [t("menu.allZonesDisabledSummary")];
  }

  const lines: string[] = [];
  for (const type of ZONE_TYPES) {
    const enabledZoneIds = ZONE_TYPE_ZONE_IDS[type].filter(
      (zoneId) => enabledZones[zoneId],
    );
    if (enabledZoneIds.length === 0) continue;

    const sideLabels = enabledZoneIds.map((zoneId) =>
      t(ZONE_SIDE_LABEL_KEY[zoneId]),
    );
    lines.push(
      t("toast.labeledValue", {
        label: t(ZONE_TYPE_LABEL_KEY[type]),
        value: sideLabels.join(", "),
      }),
    );
  }
  return lines;
}
