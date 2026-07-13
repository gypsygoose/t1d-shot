import { PointColor, StoredPointState } from "../types";
import { DEFAULT_DAYS_TO_AVAILABLE, DEFAULT_DAYS_TO_WHITE } from "../constants";
import {
  activeCycleColors,
  daysBetween,
  daysSinceCycleStart,
  injectionCycleColor,
  postBlackoutColor,
} from "./utils";
import { DAY_MS } from "./constants";
import {
  PressResultType,
  PressResult,
  ColorLabelType,
  ColorLabelDescriptor,
} from "./types";

// Injection-site color computation and press handling — every method is
// static, so callers reach it as PointService.computePointColor() etc.
// without needing to create/thread an instance (see CLAUDE.md's "Helper
// function / hook placement" — same role StorageService plays for AsyncStorage).
export class PointService {
  // ---------------------------------------------------------------------
  // Color computation
  // ---------------------------------------------------------------------

  // Colors used for the normal injection cycle at a given daysToWhite
  // setting, in day order (index === days since injection). White is
  // reached once daysSince >= this list's length, i.e. on day `daysToWhite`.
  // Delegates to logic/utils/activeCycleColors.ts, which also backs
  // injectionCycleColor/postBlackoutColor directly (calling back into this
  // class from there would cycle through logic/utils/index.ts).
  static activeCycleColors(daysToWhite: number): PointColor[] {
    return activeCycleColors(daysToWhite);
  }

  static computePointColor(
    state: StoredPointState,
    now: number,
    daysToWhite: number = DEFAULT_DAYS_TO_WHITE,
  ): PointColor {
    if (state.isManuallyBlocked) return PointColor.Gray;

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
        if (now < blackoutEnd) return PointColor.Black;
        const days = daysBetween(blackoutEnd, now);
        return postBlackoutColor(days, daysToWhite);
      }
    }

    if (state.lastInjectionAt === undefined) return PointColor.White;
    const days = daysBetween(state.lastInjectionAt, now);
    return injectionCycleColor(days, daysToWhite);
  }

  // Timestamp when the current system blackout (black state) will end, if any.
  static getBlackoutEndAt(state: StoredPointState): number | undefined {
    if (
      state.blackoutStartedAt === undefined ||
      state.blackoutDurationDays === undefined
    ) {
      return undefined;
    }
    return state.blackoutStartedAt + state.blackoutDurationDays * DAY_MS;
  }

  // Days remaining until re-marking is allowed under the "days to available"
  // setting, or undefined if the point can already be marked (setting
  // disabled at 0, point never used, or already fully white/gray/black —
  // those are gated by their own, unrelated rules). The setting's effective
  // cap is the *current* daysToWhite value, not daysToAvailable's own raw
  // stored value — see CLAUDE.md's "Point colour state machine": lowering
  // daysToWhite below a previously-set daysToAvailable shortens the wait
  // instead of leaving it stuck at the old, now out-of-range value.
  static daysUntilAvailable(
    state: StoredPointState,
    now: number,
    daysToWhite: number = DEFAULT_DAYS_TO_WHITE,
    daysToAvailable: number = DEFAULT_DAYS_TO_AVAILABLE,
  ): number | undefined {
    if (daysToAvailable <= 0) return undefined;

    const color = PointService.computePointColor(state, now, daysToWhite);
    if (
      color === PointColor.White ||
      color === PointColor.Gray ||
      color === PointColor.Black
    ) {
      return undefined;
    }

    const daysSince = daysSinceCycleStart(state, now)!;
    const effectiveDaysToAvailable = Math.min(daysToAvailable, daysToWhite);
    const remaining = effectiveDaysToAvailable - daysSince;
    return remaining > 0 ? remaining : undefined;
  }

  // ---------------------------------------------------------------------
  // Blackout duration by current color (days)
  // ---------------------------------------------------------------------

  private static blackoutDurationFor(color: PointColor): number | null {
    switch (color) {
      case PointColor.Maroon:
      case PointColor.Red:
        return 4;
      case PointColor.DarkOrange:
      case PointColor.Orange:
        return 2;
      case PointColor.DarkYellow:
      case PointColor.Yellow:
        return 1;
      default:
        return null; // not a blockable color
    }
  }

  // ---------------------------------------------------------------------
  // State transitions
  // ---------------------------------------------------------------------

  static onPress(
    state: StoredPointState,
    now: number,
    daysToWhite: number = DEFAULT_DAYS_TO_WHITE,
    daysToAvailable: number = DEFAULT_DAYS_TO_AVAILABLE,
  ): PressResult {
    const color = PointService.computePointColor(state, now, daysToWhite);

    if (color === PointColor.Gray || color === PointColor.Black)
      return { type: PressResultType.Blocked };

    const daysRemaining = PointService.daysUntilAvailable(
      state,
      now,
      daysToWhite,
      daysToAvailable,
    );
    if (daysRemaining !== undefined)
      return { type: PressResultType.Unavailable, daysRemaining };

    // White, dark-green, green → fresh injection
    if (
      color === PointColor.White ||
      color === PointColor.DarkGreen ||
      color === PointColor.Green
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
    const days = PointService.blackoutDurationFor(color)!;
    return {
      type: PressResultType.Blackout,
      newState: {
        ...state,
        blackoutStartedAt: now,
        blackoutDurationDays: days,
      },
    };
  }

  // Descriptor for when a color is reached, dependent on the daysToWhite
  // setting for colors that are part of the injection cycle.
  static colorLabel(
    color: PointColor,
    daysToWhite: number = DEFAULT_DAYS_TO_WHITE,
  ): ColorLabelDescriptor {
    switch (color) {
      case PointColor.White:
        return { type: ColorLabelType.White, count: daysToWhite };
      case PointColor.Maroon:
        return { type: ColorLabelType.Maroon };
      case PointColor.Black:
        return { type: ColorLabelType.Black };
      case PointColor.Gray:
        return { type: ColorLabelType.Gray };
      default: {
        const days = PointService.activeCycleColors(daysToWhite).indexOf(color);
        return { type: ColorLabelType.Days, count: days };
      }
    }
  }

  // Contrast text color for checkmark/text on each background
  static checkmarkColor(bg: PointColor): string {
    switch (bg) {
      case PointColor.White:
      case PointColor.Yellow:
      case PointColor.Orange:
        return "#111111";
      default:
        return "#FFFFFF";
    }
  }
}
