import { Zone, ButtonDefinition } from '../types';

// All six injection zones. Positions (x, y) are fractions of the body image size.
// Body image reference: 300 × 580 px (front view silhouette).
// "Screen left" = patient's right side; "screen right" = patient's left side.

export const ZONES: Zone[] = [
  { id: 'shoulder-right', label: 'Правое плечо',   group: 'shoulders-and-belly' },
  { id: 'shoulder-left',  label: 'Левое плечо',    group: 'shoulders-and-belly' },
  { id: 'belly-right',    label: 'Живот справа',   group: 'shoulders-and-belly' },
  { id: 'belly-left',     label: 'Живот слева',    group: 'shoulders-and-belly' },
  { id: 'thigh-right',    label: 'Правое бедро',   group: 'thighs' },
  { id: 'thigh-left',     label: 'Левое бедро',    group: 'thighs' },
];

export const ZONE_MAP: Record<string, Zone> = Object.fromEntries(
  ZONES.map((z) => [z.id, z])
);

// ---------------------------------------------------------------------------
// Button grid positions (x, y) as fractions of image size.
// Spacing: buttons are ~0.09 wide/tall relative to image.
// ---------------------------------------------------------------------------

function grid(
  zoneId: string,
  prefix: string,
  topLeftX: number,
  topLeftY: number,
  cols: number,
  rows: number,
  dx: number,
  dy: number,
): ButtonDefinition[] {
  const buttons: ButtonDefinition[] = [];
  let idx = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      buttons.push({
        id: `${prefix}-${idx++}`,
        zoneId,
        x: topLeftX + c * dx,
        y: topLeftY + r * dy,
      });
    }
  }
  return buttons;
}

// Right shoulder (screen left outer upper arm) — 3 buttons vertical
const shoulderRight = grid('shoulder-right', 'sr', 0.09, 0.20, 1, 3, 0.09, 0.07);

// Left shoulder (screen right outer upper arm) — 3 buttons vertical
const shoulderLeft = grid('shoulder-left', 'sl', 0.82, 0.20, 1, 3, 0.09, 0.07);

// Belly right (patient's right = screen left) — 3×3 grid
const bellyRight = grid('belly-right', 'br', 0.24, 0.43, 3, 3, 0.075, 0.07);

// Belly left (patient's left = screen right) — 3×3 grid
const bellyLeft = grid('belly-left', 'bl', 0.51, 0.43, 3, 3, 0.075, 0.07);

// Right thigh (screen left outer upper thigh) — 2×3 grid
const thighRight = grid('thigh-right', 'tr', 0.20, 0.63, 2, 3, 0.09, 0.065);

// Left thigh (screen right outer upper thigh) — 2×3 grid
const thighLeft = grid('thigh-left', 'tl', 0.59, 0.63, 2, 3, 0.09, 0.065);

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
