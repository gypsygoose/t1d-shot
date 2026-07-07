import { ButtonColor, StoredButtonState } from "../types";

export const DAY_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Calendar-day helpers (local timezone)
// ---------------------------------------------------------------------------

// Index of the local calendar day containing `ts`, counted from the epoch.
// Built from local Y/M/D via Date.UTC so it stays an exact integer regardless
// of DST shifts in the device's timezone.
function localDayIndex(ts: number): number {
  const d = new Date(ts);

  d.setHours(0, 0, 0, 0);

  return Number(d) / DAY_MS;
}

// Number of local-calendar-day boundaries crossed between `from` and `to`.
// A press at 15:30 counts as day 0 until local midnight, then becomes day 1,
// regardless of how many hours have actually elapsed.
function daysBetween(from: number, to: number): number {
  return localDayIndex(to) - localDayIndex(from);
}

// ---------------------------------------------------------------------------
// Color computation
// ---------------------------------------------------------------------------

function injectionCycleColor(daysSince: number): ButtonColor {
  switch (daysSince) {
    case 0:
      return ButtonColor.Maroon;
    case 1:
      return ButtonColor.Red;
    case 2:
      return ButtonColor.DarkOrange;
    case 3:
      return ButtonColor.Orange;
    case 4:
      return ButtonColor.DarkYellow;
    case 5:
      return ButtonColor.Yellow;
    case 6:
      return ButtonColor.DarkGreen;
    case 7:
      return ButtonColor.Green;
    default:
      return ButtonColor.White;
  }
}

// After blackout ends: cycle starts at red (maroon is skipped)
function postBlackoutColor(daysSinceEnd: number): ButtonColor {
  switch (daysSinceEnd) {
    case 0:
      return ButtonColor.Red;
    case 1:
      return ButtonColor.DarkOrange;
    case 2:
      return ButtonColor.Orange;
    case 3:
      return ButtonColor.DarkYellow;
    case 4:
      return ButtonColor.Yellow;
    case 5:
      return ButtonColor.DarkGreen;
    case 6:
      return ButtonColor.Green;
    default:
      return ButtonColor.White;
  }
}

export function computeButtonColor(
  state: StoredButtonState,
  now: number,
): ButtonColor {
  if (state.isManuallyBlocked) return ButtonColor.Gray;

  const hasBlackout =
    state.blackoutStartedAt !== undefined &&
    state.blackoutDurationDays !== undefined;

  if (hasBlackout) {
    const blackoutEnd =
      state.blackoutStartedAt! + state.blackoutDurationDays! * DAY_MS;
    const injectionAfterBlackout =
      state.lastInjectionAt !== undefined &&
      state.lastInjectionAt > state.blackoutStartedAt!;

    if (!injectionAfterBlackout) {
      if (now < blackoutEnd) return ButtonColor.Black;
      const days = daysBetween(blackoutEnd, now);
      return postBlackoutColor(days);
    }
  }

  if (state.lastInjectionAt === undefined) return ButtonColor.White;
  const days = daysBetween(state.lastInjectionAt, now);
  return injectionCycleColor(days);
}

// Timestamp when the current system blackout (black state) will end, if any.
export function getBlackoutEndAt(state: StoredButtonState): number | undefined {
  if (
    state.blackoutStartedAt === undefined ||
    state.blackoutDurationDays === undefined
  ) {
    return undefined;
  }
  return state.blackoutStartedAt + state.blackoutDurationDays * DAY_MS;
}

// ---------------------------------------------------------------------------
// Blackout duration by current color (days)
// ---------------------------------------------------------------------------

export function blackoutDurationFor(color: ButtonColor): number | null {
  switch (color) {
    case ButtonColor.Maroon:
    case ButtonColor.Red:
      return 4;
    case ButtonColor.DarkOrange:
    case ButtonColor.Orange:
      return 2;
    case ButtonColor.DarkYellow:
    case ButtonColor.Yellow:
      return 1;
    default:
      return null; // not a blockable color
  }
}

// ---------------------------------------------------------------------------
// State transitions
// ---------------------------------------------------------------------------

export enum PressResultType {
  Injection = "injection",
  Blackout = "blackout",
  Blocked = "blocked",
}

export type PressResult =
  | { type: PressResultType.Injection; newState: StoredButtonState }
  | { type: PressResultType.Blackout; newState: StoredButtonState }
  | { type: PressResultType.Blocked };

export function onPress(state: StoredButtonState, now: number): PressResult {
  const color = computeButtonColor(state, now);

  if (color === ButtonColor.Gray || color === ButtonColor.Black)
    return { type: PressResultType.Blocked };

  // White, dark-green, green → fresh injection
  if (
    color === ButtonColor.White ||
    color === ButtonColor.DarkGreen ||
    color === ButtonColor.Green
  ) {
    return {
      type: PressResultType.Injection,
      newState: {
        ...state,
        lastInjectionAt: now,
        blackoutStartedAt: undefined,
        blackoutDurationDays: undefined,
      },
    };
  }

  // Non-white, non-green → trigger blackout
  const days = blackoutDurationFor(color)!;
  return {
    type: PressResultType.Blackout,
    newState: {
      ...state,
      blackoutStartedAt: now,
      blackoutDurationDays: days,
    },
  };
}

export function toggleManualBlock(state: StoredButtonState): StoredButtonState {
  return { ...state, isManuallyBlocked: !state.isManuallyBlocked };
}

// ---------------------------------------------------------------------------
// Hex values for each color
// ---------------------------------------------------------------------------

export const COLOR_HEX: Record<ButtonColor, string> = {
  [ButtonColor.White]: "#EBEBEB",
  [ButtonColor.Maroon]: "#7B1D1D",
  [ButtonColor.Red]: "#DC2626",
  [ButtonColor.DarkOrange]: "#C2410C",
  [ButtonColor.Orange]: "#EA580C",
  [ButtonColor.DarkYellow]: "#A16207",
  [ButtonColor.Yellow]: "#EAB308",
  [ButtonColor.DarkGreen]: "#166534",
  [ButtonColor.Green]: "#16A34A",
  [ButtonColor.Black]: "#111111",
  [ButtonColor.Gray]: "#6B7280",
};

export const COLOR_LABEL: Record<ButtonColor, string> = {
  [ButtonColor.White]: "Свободно (не использовалось 8+ дней)",
  [ButtonColor.Maroon]: "Только что (день 0)",
  [ButtonColor.Red]: "1 день",
  [ButtonColor.DarkOrange]: "2 дня",
  [ButtonColor.Orange]: "3 дня",
  [ButtonColor.DarkYellow]: "4 дня",
  [ButtonColor.Yellow]: "5 дней",
  [ButtonColor.DarkGreen]: "6 дней",
  [ButtonColor.Green]: "7 дней",
  [ButtonColor.Black]: "Заблокировано системой из-за частого использования",
  [ButtonColor.Gray]: "Заблокировано вручную (травма/синяк)",
};

// Contrast text color for checkmark/text on each background
export function checkmarkColor(bg: ButtonColor): string {
  switch (bg) {
    case ButtonColor.White:
    case ButtonColor.Yellow:
    case ButtonColor.Orange:
      return "#111111";
    default:
      return "#FFFFFF";
  }
}
