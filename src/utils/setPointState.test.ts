import { setPointState } from './setPointState';
import { PointStatesMap, StoredPointState } from '../types';

const NOW = 1000000000000;

const marked: StoredPointState = { isManuallyBlocked: false, lastInjectionAt: NOW };
const blocked: StoredPointState = { isManuallyBlocked: true, manuallyBlockedAt: NOW };
const empty: StoredPointState = { isManuallyBlocked: false };

describe('setPointState', () => {
  test('sets an entry carrying data', () => {
    const next = setPointState(new Map(), 'br-r1c1', marked);
    expect(next.get('br-r1c1')).toEqual(marked);
  });

  test('deletes the entry when the new state is empty', () => {
    const before: PointStatesMap = new Map([['br-r1c1', blocked]]);
    const next = setPointState(before, 'br-r1c1', empty);
    expect(next.has('br-r1c1')).toBe(false);
    expect(next.size).toBe(0);
  });

  test('never stores an empty state for a point that had none', () => {
    const next = setPointState(new Map(), 'br-r1c1', empty);
    expect(next.size).toBe(0);
  });

  test('keeps an entry that still carries an injection after unblocking', () => {
    const before: PointStatesMap = new Map([
      ['br-r1c1', { isManuallyBlocked: true, manuallyBlockedAt: NOW, lastInjectionAt: NOW }],
    ]);
    const next = setPointState(before, 'br-r1c1', {
      isManuallyBlocked: false,
      lastInjectionAt: NOW,
    });
    expect(next.get('br-r1c1')).toEqual({ isManuallyBlocked: false, lastInjectionAt: NOW });
  });

  test('does not mutate the input map (React needs a fresh reference)', () => {
    const before: PointStatesMap = new Map([['br-r1c1', marked]]);
    const next = setPointState(before, 'tl-r2c1', blocked);
    expect(next).not.toBe(before);
    expect(before.size).toBe(1);
    expect(next.size).toBe(2);
    expect(before.has('tl-r2c1')).toBe(false);
  });

  test('leaves other points untouched', () => {
    const before: PointStatesMap = new Map([['br-r1c1', marked], ['tl-r2c1', blocked]]);
    const next = setPointState(before, 'br-r1c1', empty);
    expect(next.get('tl-r2c1')).toEqual(blocked);
  });
});

// The map is converted to/from a plain Record at every persistence boundary
// (StorageService.savePointStates/loadPointStates, exportData/applyImport,
// BulkAppEvent snapshots). JSON.stringify on a raw Map silently yields "{}",
// so these assertions guard the conversion itself, not just its types.
describe('Map <-> Record persistence round-trip', () => {
  const states: PointStatesMap = new Map([
    ['br-r1c1', marked],
    ['tl-r2c1', blocked],
  ]);

  test('a raw Map does NOT serialize — hence the conversion', () => {
    expect(JSON.stringify(states)).toBe('{}');
  });

  test('Object.fromEntries round-trips through JSON back into an equal Map', () => {
    const serialized = JSON.stringify(Object.fromEntries(states));
    const restored: PointStatesMap = new Map(Object.entries(JSON.parse(serialized)));
    expect(restored).toEqual(states);
    expect(restored.get('br-r1c1')).toEqual(marked);
    expect(restored.get('tl-r2c1')).toEqual(blocked);
  });

  test('an empty map round-trips to an empty map, not undefined', () => {
    const serialized = JSON.stringify(Object.fromEntries(new Map()));
    const restored: PointStatesMap = new Map(Object.entries(JSON.parse(serialized)));
    expect(restored.size).toBe(0);
  });

  test('a point with no entry stays absent across a round-trip', () => {
    const serialized = JSON.stringify(Object.fromEntries(states));
    const restored: PointStatesMap = new Map(Object.entries(JSON.parse(serialized)));
    expect(restored.get('sr-r1c1')).toBeUndefined();
  });
});
