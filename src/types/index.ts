export type ZoneGroup = 'thighs' | 'shoulders-and-belly';

export type ButtonColor =
  | 'white'
  | 'maroon'
  | 'red'
  | 'dark-orange'
  | 'orange'
  | 'dark-yellow'
  | 'yellow'
  | 'dark-green'
  | 'green'
  | 'black'
  | 'gray';

export interface Zone {
  id: string;
  label: string;
  group: ZoneGroup;
}

export interface ButtonDefinition {
  id: string;
  zoneId: string;
  // Position as fraction of image dimensions (0..1)
  x: number;
  y: number;
}

// Persisted per-button state
export interface StoredButtonState {
  buttonId: string;
  lastInjectionAt?: number;
  blackoutStartedAt?: number;
  blackoutDurationDays?: number;
  isManuallyBlocked: boolean;
}

// Event in undo history
export type AppEventType = 'injection' | 'blackout' | 'manual-block' | 'manual-unblock';

export interface AppEvent {
  id: string;
  timestamp: number;
  type: AppEventType;
  buttonId: string;
  zoneId: string;
  prevButtonState: StoredButtonState;
}

// Full app storage
export interface AppStorage {
  buttonStates: Record<string, StoredButtonState>;
  events: AppEvent[];
}
