import { ZoneId } from './zone';

export enum PointColor {
  White = 'white',
  Maroon = 'maroon',
  Red = 'red',
  DarkOrange = 'dark-orange',
  Orange = 'orange',
  DarkYellow = 'dark-yellow',
  Yellow = 'yellow',
  DarkGreen = 'dark-green',
  Green = 'green',
  Black = 'black',
  Gray = 'gray',
  // Point restore mode: Manual — a point's own permanent "used" color, once
  // it's ever been marked. Deliberately distinct from Black (system
  // blackout, only ever set in Auto mode) even though both render as the
  // same near-black hex — see PointService.computePointColor/onPress and
  // CLAUDE.md's "Point restore mode" section.
  Marked = 'marked',
}

export interface PointDefinition {
  id: string;
  zoneId: ZoneId;
}

// Body-relative "address" of a point — see POINT_ADDRESS in data/zones.ts.
export interface PointAddress {
  row: number;
  column: number;
}

// Persisted per-point state. No `pointId` field — the point's id is the key
// its state is stored under (in PointStatesMap / the exported Record), never
// duplicated inside the value.
export interface StoredPointState {
  lastInjectionAt?: number;
  blackoutStartedAt?: number;
  blackoutDurationDays?: number;
  isManuallyBlocked: boolean;
  manuallyBlockedAt?: number;
}

// In-memory point states, keyed by point id. Sparse: a point with no data
// (never marked, not manually blocked) simply has no entry — its absence is
// exactly a fresh, White, available point. Only points carrying real data
// are ever stored, so there's no backfill/normalize step and clearing a
// point just deletes its entry. Persisted to AsyncStorage / written to an
// export file as a plain Record (Map isn't JSON-serializable) — see
// StorageService and ExportedAppData.
export type PointStatesMap = Map<string, StoredPointState>;
