import { EnabledZones } from "../../../types";

export function isAllZonesActive(enabledZones: EnabledZones): boolean {
  return Object.values(enabledZones).every(Boolean);
}
