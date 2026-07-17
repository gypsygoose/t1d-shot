import { EnabledZones } from "../../../types";

export function countActiveZones(enabledZones: EnabledZones): number {
  return Object.values(enabledZones).filter(Boolean).length;
}
