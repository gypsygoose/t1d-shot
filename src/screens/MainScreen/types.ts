import { TFunction } from "i18next";
import {
  PointAddress,
  PointDefinition,
  PointRestoreMode,
  StoredPointState,
} from "../../types";

// Params objects for MainScreen/utils/'s helpers — see CLAUDE.md's "more than
// 2 parameters" coding-convention bullet.
export interface BuildPointAddressSuffixParams {
  t: TFunction;
  pointId: string;
  pointMap: Record<string, PointDefinition>;
  pointAddress: Record<string, PointAddress>;
}

export interface BuildMarkToastMessageParams {
  t: TFunction;
  locale: string;
  pointId: string;
  // Undefined when the point has no stored entry — a fresh, untouched point;
  // PointService.onPress resolves undefined to a fresh default (see
  // PointStatesMap).
  pointState: StoredPointState | undefined;
  timestamp: number;
  daysToWhite: number;
  daysToAvailable: number;
  pointMap: Record<string, PointDefinition>;
  pointAddress: Record<string, PointAddress>;
  pointRestoreMode: PointRestoreMode;
}
