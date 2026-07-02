import {
  computeButtonColor,
  onPress,
  toggleManualBlock,
  blackoutDurationFor,
} from './stateMachine';
import { StoredButtonState } from '../types';

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1000000000000; // fixed reference timestamp

const fresh: StoredButtonState = { buttonId: 'x', isManuallyBlocked: false };

// ---------------------------------------------------------------------------
// computeButtonColor — normal injection cycle
// ---------------------------------------------------------------------------

describe('computeButtonColor — normal cycle', () => {
  test('white when never used', () => {
    expect(computeButtonColor(fresh, NOW)).toBe('white');
  });

  test('maroon on day 0', () => {
    const s = { ...fresh, lastInjectionAt: NOW };
    expect(computeButtonColor(s, NOW)).toBe('maroon');
  });

  test('maroon within day 0 (same day, 23 h later)', () => {
    const s = { ...fresh, lastInjectionAt: NOW };
    expect(computeButtonColor(s, NOW + 23 * 60 * 60 * 1000)).toBe('maroon');
  });

  test('red on day 1', () => {
    const s = { ...fresh, lastInjectionAt: NOW - DAY };
    expect(computeButtonColor(s, NOW)).toBe('red');
  });

  test('dark-orange on day 2', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 2 * DAY };
    expect(computeButtonColor(s, NOW)).toBe('dark-orange');
  });

  test('orange on day 3', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 3 * DAY };
    expect(computeButtonColor(s, NOW)).toBe('orange');
  });

  test('dark-yellow on day 4', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 4 * DAY };
    expect(computeButtonColor(s, NOW)).toBe('dark-yellow');
  });

  test('yellow on day 5', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 5 * DAY };
    expect(computeButtonColor(s, NOW)).toBe('yellow');
  });

  test('dark-green on day 6', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 6 * DAY };
    expect(computeButtonColor(s, NOW)).toBe('dark-green');
  });

  test('green on day 7', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 7 * DAY };
    expect(computeButtonColor(s, NOW)).toBe('green');
  });

  test('white on day 8', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 8 * DAY };
    expect(computeButtonColor(s, NOW)).toBe('white');
  });

  test('white on day 30', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 30 * DAY };
    expect(computeButtonColor(s, NOW)).toBe('white');
  });
});

// ---------------------------------------------------------------------------
// computeButtonColor — manual block
// ---------------------------------------------------------------------------

describe('computeButtonColor — gray (manual block)', () => {
  test('gray overrides normal cycle', () => {
    const s = { ...fresh, lastInjectionAt: NOW - DAY, isManuallyBlocked: true };
    expect(computeButtonColor(s, NOW)).toBe('gray');
  });

  test('gray overrides blackout', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW - DAY,
      blackoutDurationDays: 4,
      isManuallyBlocked: true,
    };
    expect(computeButtonColor(s, NOW)).toBe('gray');
  });
});

// ---------------------------------------------------------------------------
// computeButtonColor — blackout cycle
// ---------------------------------------------------------------------------

describe('computeButtonColor — blackout state', () => {
  test('black during blackout period', () => {
    const s: StoredButtonState = {
      ...fresh,
      lastInjectionAt: NOW,
      blackoutStartedAt: NOW,
      blackoutDurationDays: 4,
    };
    expect(computeButtonColor(s, NOW + DAY)).toBe('black');
    expect(computeButtonColor(s, NOW + 3 * DAY)).toBe('black');
  });

  test('red on day 0 after blackout ends', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY,
      blackoutDurationDays: 4,
    };
    expect(computeButtonColor(s, NOW)).toBe('red');
  });

  test('post-blackout cycle skips maroon (starts at red)', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW - 4 * DAY,
      blackoutDurationDays: 4,
    };
    // day 0 after blackout end = red
    expect(computeButtonColor(s, NOW)).toBe('red');
    // day 1 after end = dark-orange
    expect(computeButtonColor(s, NOW + DAY)).toBe('dark-orange');
    // day 6 after end = green
    expect(computeButtonColor(s, NOW + 6 * DAY)).toBe('green');
    // day 7 after end = white
    expect(computeButtonColor(s, NOW + 7 * DAY)).toBe('white');
  });

  test('new injection after blackout overrides post-blackout cycle', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW - 5 * DAY,  // blackout started 5 days ago
      blackoutDurationDays: 4,             // ended 1 day ago
      lastInjectionAt: NOW,               // new injection just now (> blackoutStartedAt)
    };
    expect(computeButtonColor(s, NOW)).toBe('maroon');
  });
});

// ---------------------------------------------------------------------------
// blackoutDurationFor
// ---------------------------------------------------------------------------

describe('blackoutDurationFor', () => {
  test('4 days for maroon', () => expect(blackoutDurationFor('maroon')).toBe(4));
  test('4 days for red', () => expect(blackoutDurationFor('red')).toBe(4));
  test('2 days for dark-orange', () => expect(blackoutDurationFor('dark-orange')).toBe(2));
  test('2 days for orange', () => expect(blackoutDurationFor('orange')).toBe(2));
  test('1 day for dark-yellow', () => expect(blackoutDurationFor('dark-yellow')).toBe(1));
  test('1 day for yellow', () => expect(blackoutDurationFor('yellow')).toBe(1));
  test('null for white', () => expect(blackoutDurationFor('white')).toBeNull());
  test('null for green', () => expect(blackoutDurationFor('green')).toBeNull());
  test('null for dark-green', () => expect(blackoutDurationFor('dark-green')).toBeNull());
});

// ---------------------------------------------------------------------------
// onPress
// ---------------------------------------------------------------------------

describe('onPress', () => {
  test('injection on white button', () => {
    const result = onPress(fresh, NOW);
    expect(result.kind).toBe('injection');
    if (result.kind === 'injection') {
      expect(result.newState.lastInjectionAt).toBe(NOW);
      expect(result.newState.blackoutStartedAt).toBeUndefined();
    }
  });

  test('injection on dark-green button (day 6)', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 6 * DAY };
    const result = onPress(s, NOW);
    expect(result.kind).toBe('injection');
  });

  test('injection on green button (day 7)', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 7 * DAY };
    const result = onPress(s, NOW);
    expect(result.kind).toBe('injection');
  });

  test('blackout on maroon button — 4 days', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 0 * DAY };
    const result = onPress(s, NOW);
    expect(result.kind).toBe('blackout');
    if (result.kind === 'blackout') {
      expect(result.newState.blackoutDurationDays).toBe(4);
    }
  });

  test('blackout on red button — 4 days', () => {
    const s = { ...fresh, lastInjectionAt: NOW - DAY };
    const result = onPress(s, NOW);
    expect(result.kind).toBe('blackout');
    if (result.kind === 'blackout') {
      expect(result.newState.blackoutDurationDays).toBe(4);
    }
  });

  test('blackout on orange button — 2 days', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 3 * DAY };
    const result = onPress(s, NOW);
    expect(result.kind).toBe('blackout');
    if (result.kind === 'blackout') {
      expect(result.newState.blackoutDurationDays).toBe(2);
    }
  });

  test('blackout on yellow button — 1 day', () => {
    const s = { ...fresh, lastInjectionAt: NOW - 5 * DAY };
    const result = onPress(s, NOW);
    expect(result.kind).toBe('blackout');
    if (result.kind === 'blackout') {
      expect(result.newState.blackoutDurationDays).toBe(1);
    }
  });

  test('blocked on gray (manually blocked) button', () => {
    const s = { ...fresh, isManuallyBlocked: true };
    expect(onPress(s, NOW).kind).toBe('blocked');
  });

  test('blocked on black (blackout active) button', () => {
    const s: StoredButtonState = {
      ...fresh,
      blackoutStartedAt: NOW,
      blackoutDurationDays: 4,
    };
    expect(onPress(s, NOW + DAY).kind).toBe('blocked');
  });
});

// ---------------------------------------------------------------------------
// toggleManualBlock
// ---------------------------------------------------------------------------

describe('toggleManualBlock', () => {
  test('blocks active button', () => {
    const result = toggleManualBlock(fresh);
    expect(result.isManuallyBlocked).toBe(true);
  });

  test('unblocks gray button, keeps cycle running', () => {
    const s: StoredButtonState = {
      ...fresh,
      isManuallyBlocked: true,
      lastInjectionAt: NOW - 2 * DAY,
    };
    const result = toggleManualBlock(s);
    expect(result.isManuallyBlocked).toBe(false);
    // cycle is intact
    expect(computeButtonColor(result, NOW)).toBe('dark-orange');
  });
});
