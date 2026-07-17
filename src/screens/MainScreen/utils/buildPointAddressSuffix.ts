import { ZONE_LABEL_KEY, ZONE_MAP } from "../../../data";
import { BuildPointAddressSuffixParams } from "../types";

// Shared "<zone label>, ряд <row>, место <column> от центра тела" suffix used
// by every point-specific toast (mark/block/clear) to name which point it's
// about via its body-relative address. `pointMap`/`pointAddress` are the
// current ZonePointCounts-derived values (see data/zones.ts's buildZoneData),
// passed in since they're no longer static constants.
export function buildPointAddressSuffix({
  t,
  pointId,
  pointMap,
  pointAddress,
}: BuildPointAddressSuffixParams): string | null {
  const point = pointMap[pointId];
  const zone = point ? ZONE_MAP[point.zoneId] : undefined;
  const address = pointAddress[pointId];
  if (!zone || !address) return null;
  return t("toast.pointAddressSuffix", {
    zoneLabel: t(ZONE_LABEL_KEY[zone.id]),
    row: address.row,
    column: address.column,
  });
}
