import { Zone, ButtonDefinition } from '../types';

// Zones from Figma design (grYg39698ogy0nEBd88Fup, node 26:3)
// Group label follows patient perspective: "правое" = patient's right = screen LEFT

export const ZONES: Zone[] = [
  { id: 'shoulder-right', label: 'Правое плечо',  group: 'shoulders-and-belly' },
  { id: 'shoulder-left',  label: 'Левое плечо',   group: 'shoulders-and-belly' },
  { id: 'belly-right',    label: 'Живот справа',  group: 'shoulders-and-belly' },
  { id: 'belly-left',     label: 'Живот слева',   group: 'shoulders-and-belly' },
  { id: 'thigh-right',    label: 'Правое бедро',  group: 'thighs' },
  { id: 'thigh-left',     label: 'Левое бедро',   group: 'thighs' },
];

export const ZONE_MAP: Record<string, Zone> = Object.fromEntries(
  ZONES.map((z) => [z.id, z])
);

// ---------------------------------------------------------------------------
// Button positions extracted from Figma frame 393×852.
// Body image container: starts at y=99.258 in screen coords, size 393×621.91.
// All (x, y) are fractions (0–1) of the image container dimensions.
// Button center is at (x * containerW, y * containerH).
// ---------------------------------------------------------------------------

// Right shoulder — patient's right = screen LEFT (3 buttons vertical)
const shoulderRight: ButtonDefinition[] = [
  { id: 'sr-0', zoneId: 'shoulder-right', x: 0.160, y: 0.179 },
  { id: 'sr-1', zoneId: 'shoulder-right', x: 0.160, y: 0.244 },
  { id: 'sr-2', zoneId: 'shoulder-right', x: 0.160, y: 0.309 },
];

// Left shoulder — patient's left = screen RIGHT (3 buttons vertical)
const shoulderLeft: ButtonDefinition[] = [
  { id: 'sl-0', zoneId: 'shoulder-left', x: 0.858, y: 0.179 },
  { id: 'sl-1', zoneId: 'shoulder-left', x: 0.858, y: 0.244 },
  { id: 'sl-2', zoneId: 'shoulder-left', x: 0.858, y: 0.309 },
];

// Belly right — patient's right = screen LEFT (3×3 grid)
const bellyRight: ButtonDefinition[] = [
  { id: 'br-0', zoneId: 'belly-right', x: 0.309, y: 0.316 },
  { id: 'br-1', zoneId: 'belly-right', x: 0.379, y: 0.316 },
  { id: 'br-2', zoneId: 'belly-right', x: 0.449, y: 0.316 },
  { id: 'br-3', zoneId: 'belly-right', x: 0.309, y: 0.384 },
  { id: 'br-4', zoneId: 'belly-right', x: 0.379, y: 0.384 },
  { id: 'br-5', zoneId: 'belly-right', x: 0.449, y: 0.384 },
  { id: 'br-6', zoneId: 'belly-right', x: 0.309, y: 0.452 },
  { id: 'br-7', zoneId: 'belly-right', x: 0.379, y: 0.452 },
  { id: 'br-8', zoneId: 'belly-right', x: 0.449, y: 0.452 },
];

// Belly left — patient's left = screen RIGHT (3×3 grid)
const bellyLeft: ButtonDefinition[] = [
  { id: 'bl-0', zoneId: 'belly-left', x: 0.566, y: 0.316 },
  { id: 'bl-1', zoneId: 'belly-left', x: 0.636, y: 0.316 },
  { id: 'bl-2', zoneId: 'belly-left', x: 0.706, y: 0.316 },
  { id: 'bl-3', zoneId: 'belly-left', x: 0.566, y: 0.384 },
  { id: 'bl-4', zoneId: 'belly-left', x: 0.636, y: 0.384 },
  { id: 'bl-5', zoneId: 'belly-left', x: 0.706, y: 0.384 },
  { id: 'bl-6', zoneId: 'belly-left', x: 0.566, y: 0.452 },
  { id: 'bl-7', zoneId: 'belly-left', x: 0.636, y: 0.452 },
  { id: 'bl-8', zoneId: 'belly-left', x: 0.706, y: 0.452 },
];

// Right thigh — patient's right = screen LEFT (2×3 grid)
const thighRight: ButtonDefinition[] = [
  { id: 'tr-0', zoneId: 'thigh-right', x: 0.274, y: 0.732 },
  { id: 'tr-1', zoneId: 'thigh-right', x: 0.347, y: 0.732 },
  { id: 'tr-2', zoneId: 'thigh-right', x: 0.274, y: 0.800 },
  { id: 'tr-3', zoneId: 'thigh-right', x: 0.347, y: 0.800 },
  { id: 'tr-4', zoneId: 'thigh-right', x: 0.274, y: 0.868 },
  { id: 'tr-5', zoneId: 'thigh-right', x: 0.347, y: 0.868 },
];

// Left thigh — patient's left = screen RIGHT (2×3 grid)
const thighLeft: ButtonDefinition[] = [
  { id: 'tl-0', zoneId: 'thigh-left', x: 0.671, y: 0.732 },
  { id: 'tl-1', zoneId: 'thigh-left', x: 0.744, y: 0.732 },
  { id: 'tl-2', zoneId: 'thigh-left', x: 0.671, y: 0.800 },
  { id: 'tl-3', zoneId: 'thigh-left', x: 0.744, y: 0.800 },
  { id: 'tl-4', zoneId: 'thigh-left', x: 0.671, y: 0.868 },
  { id: 'tl-5', zoneId: 'thigh-left', x: 0.744, y: 0.868 },
];

export const BUTTONS: ButtonDefinition[] = [
  ...shoulderRight,
  ...shoulderLeft,
  ...bellyRight,
  ...bellyLeft,
  ...thighRight,
  ...thighLeft,
];

export const BUTTON_MAP: Record<string, ButtonDefinition> = Object.fromEntries(
  BUTTONS.map((b) => [b.id, b])
);
