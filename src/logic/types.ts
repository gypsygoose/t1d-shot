import { PointColor, PointRestoreMode, StoredPointState } from "../types";

// Params objects for PointService.ts's public methods — see CLAUDE.md's
// "more than 2 parameters" coding-convention bullet. daysUntilAvailable and
// onPress need the exact same context computePointColor does, plus
// daysToAvailable, so their params extend/alias it rather than repeating it.
// `state` may be undefined — a point with no stored entry is a fresh,
// untouched point (see PointStatesMap); each method resolves undefined to a
// fresh default internally.
export interface ComputePointColorParams {
  state: StoredPointState | undefined;
  now: number;
  daysToWhite: number;
  pointRestoreMode: PointRestoreMode;
}

export interface DaysUntilAvailableParams extends ComputePointColorParams {
  daysToAvailable: number;
}

export type OnPressParams = DaysUntilAvailableParams;

export interface ColorLabelParams {
  color: PointColor;
  daysToWhite: number;
  pointRestoreMode: PointRestoreMode;
}

export enum PressResultType {
  Injection = "injection",
  Blackout = "blackout",
  Blocked = "blocked",
  Unavailable = "unavailable",
}

export type PressResult =
  | { type: PressResultType.Injection; newState: StoredPointState }
  | { type: PressResultType.Blackout; newState: StoredPointState }
  | { type: PressResultType.Blocked }
  | { type: PressResultType.Unavailable; daysRemaining: number };

// Which sentence PointService.colorLabel() (PointService.ts) describes —
// kept as a descriptor rather than a formatted string so that file (tested
// without an RN renderer) stays free of an i18next dependency; the UI layer
// (HelpSheet.tsx) formats it via t('stateMachine.colorLabel.*', { count }).
export enum ColorLabelType {
  White = "white",
  WhiteManual = "whiteManual",
  Maroon = "maroon",
  Black = "black",
  Gray = "gray",
  Days = "days",
  Marked = "marked",
}

export interface ColorLabelDescriptor {
  type: ColorLabelType;
  count?: number;
}
