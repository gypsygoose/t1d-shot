import { TFunction } from "i18next";
import { EnabledZones, ZonePointCounts } from "../../types";

// Params object for utils/buildZonePointsSummary.ts — see CLAUDE.md's "more
// than 2 parameters" coding-convention bullet.
export interface BuildZonePointsSummaryParams {
  t: TFunction;
  zonePointCounts: ZonePointCounts;
  enabledZones: EnabledZones;
}
