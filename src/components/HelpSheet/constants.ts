import { ZoneType } from "../../types";
import { HelpZoneKeys } from "./types";

// Injection zone descriptions, taken from the Figma "help" frame (node
// 26:239, file grYg39698ogy0nEBd88Fup). `type` looks up the accent directly
// from `colors.zoneColors`, which already resolves to the theme's darker
// shade in light mode — the plain dark-theme accent reads too faint as
// text/a badge border on the light theme's white sheet surface (same issue
// as ZoneContainer's block — see CLAUDE.md's "Zones and points").
export const HELP_ZONE_TYPES: ZoneType[] = [
  ZoneType.Shoulder,
  ZoneType.Belly,
  ZoneType.Thigh,
];

export const HELP_ZONE_KEY: Record<ZoneType, HelpZoneKeys> = {
  [ZoneType.Shoulder]: {
    label: "help.zones.shoulder.label",
    location: "help.zones.shoulder.location",
    description: "help.zones.shoulder.description",
  },
  [ZoneType.Belly]: {
    label: "help.zones.belly.label",
    location: "help.zones.belly.location",
    description: "help.zones.belly.description",
  },
  [ZoneType.Thigh]: {
    label: "help.zones.thigh.label",
    location: "help.zones.thigh.location",
    description: "help.zones.thigh.description",
  },
};

// Size of the color-scheme legend's swatches — both the plain colored circles
// (styles.swatch) and the SVG one demonstrating the unavailable overlay.
export const COLOR_SWATCH_SIZE = 26;
