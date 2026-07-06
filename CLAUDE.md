# T1D Shot — Project Documentation

## Overview

Mobile app for Type 1 Diabetes patients to track insulin injection sites and enforce maximum rotation to prevent lipodystrophy. Users tap a button to log an injection; the button changes colour over 8 days to show when the site is safe to reuse.

**Platform:** iOS / Android — Expo Managed Workflow, TypeScript, React Native.

---

## Running the project

```bash
npm install
npm start          # opens Expo dev tools (scan QR with Expo Go)
npm test           # Jest unit tests (state machine logic)
npx tsc --noEmit   # TypeScript type check
```

---

## Architecture & folder structure

```
src/
├── types/index.ts          — all shared TypeScript types
├── data/zones.ts           — zone + button definitions with (x,y) positions
├── logic/
│   ├── stateMachine.ts     — pure functions: color computation, press handling
│   └── stateMachine.test.ts
├── storage/storage.ts      — AsyncStorage load/save/clear
├── store/useAppStore.ts    — React hook: combines storage + state machine
├── components/
│   ├── BodySilhouette.tsx  — SVG front-view human silhouette (300×580 viewBox)
│   ├── InjectionButton.tsx — single injection point button
│   ├── BottomMenu.tsx      — Undo / Legend / Clear bar
│   ├── ConfirmDialog.tsx   — generic confirmation modal
│   └── LegendModal.tsx     — colour-key + zone descriptions overlay
└── screens/MainScreen.tsx  — root screen composing all components
App.tsx                     — entry point
```

---

## Technical decisions

| Decision | Choice | Rationale |
|---|---|---|
| Local storage | AsyncStorage | Small data volume (4–6 events/day), no SQL queries needed |
| State management | Custom hook (`useAppStore`) | No Redux/MobX — app state is one JSON object |
| ID generation | Timestamp + random string | No uuid lib needed |
| SVG silhouette | react-native-svg inline Path | No external image asset required at MVP |
| Testing | Jest + ts-jest | Pure logic tests; no React Native renderer required |

---

## Coding conventions

- Use named exports for all components, functions, and modules — no `export default`. Import with `import { Foo } from "./Foo"`.
- Types that enumerate string constants must be TypeScript `enum`s, not string-literal unions (e.g. `ButtonColor`, `ZoneGroup`, `ZoneId`, `AppEventType`, `AutoLockDialogMode` in `src/types/index.ts`). Reference values as `EnumName.Member`, never as raw string literals.
- Discriminated-union result types (e.g. `PressResult` in `src/logic/stateMachine.ts`, `ImportResult` in `src/storage/storage.ts`) use `type` as the discriminant field name (not `kind`), backed by its own enum (e.g. `PressResultType`, `ImportResultType`).

---

## Data model

```ts
// StoredButtonState — persisted per button
interface StoredButtonState {
  buttonId: string;
  lastInjectionAt?: number;       // timestamp of last normal injection
  blackoutStartedAt?: number;     // timestamp when system blackout was triggered
  blackoutDurationDays?: number;  // duration of blackout in days
  isManuallyBlocked: boolean;     // gray (user-locked) state
}

// AppEvent — undo history entry
interface AppEvent {
  id: string;
  timestamp: number;
  type: 'injection' | 'blackout' | 'manual-block' | 'manual-unblock';
  buttonId: string;
  zoneId: string;
  prevButtonState: StoredButtonState;  // snapshot for undo
}

// AppStorage — root object in AsyncStorage
interface AppStorage {
  buttonStates: Record<string, StoredButtonState>;
  events: AppEvent[];
}
```

Storage key: `@t1d_shot_v1`

---

## Button colour state machine

### Normal injection cycle (days since `lastInjectionAt`)

| Days | Colour |
|---|---|
| 0 | Maroon `#7B1D1D` |
| 1 | Red `#DC2626` |
| 2 | Dark orange `#C2410C` |
| 3 | Orange `#EA580C` |
| 4 | Dark yellow `#A16207` |
| 5 | Yellow `#EAB308` |
| 6 | Dark green `#166534` |
| 7 | Green `#16A34A` |
| 8+ | White `#EBEBEB` |

### Re-use (blackout) — button pressed while not white/dark-green/green

| Colour at press | Blackout duration |
|---|---|
| Maroon / Red | 4 days |
| Dark orange / Orange | 2 days |
| Dark yellow / Yellow | 1 day |

After blackout: post-blackout cycle starts at **Red** (maroon is skipped), counting from `blackoutStartedAt + blackoutDurationDays * DAY_MS`.

Dark-green / Green re-press → treated as white (restart cycle from maroon, no blackout).

### Manual block (gray)
Long-press (~800 ms) → toggle `isManuallyBlocked`. Gray overrides all colours visually, but the underlying time cycle continues ticking.

### Priority (highest → lowest)
1. Gray (manual block)
2. Black (system blackout, if `blackoutStartedAt > lastInjectionAt` and `now < blackoutEnd`)
3. Post-blackout cycle (if blackout ended)
4. Normal injection cycle
5. White (never used or 8+ days)

---

## Zones and buttons

6 zones, 30 buttons total. All button positions are fractions (0–1) of the body image container (393.46×621.91, matching `body.png`'s aspect ratio), extracted directly from the Figma "with buttons" frame (node `27:744`, file `grYg39698ogy0nEBd88Fup`). Each button renders as a 20 px knob (state colour fill) inside a 30 px radial-gradient glow halo tinted with its zone's `glow` colour (see `ZONE_COLORS` in `src/data/zones.ts`).

### Zone list

| Zone ID | Label | Group | Buttons | Accent | Glow |
|---|---|---|---|---|---|
| `shoulder-right` | Правое плечо | shoulders-and-belly | 3 (vertical column) | `#F5D020` | `#C4A800` |
| `shoulder-left` | Левое плечо | shoulders-and-belly | 3 (vertical column) | `#F5D020` | `#C4A800` |
| `belly-right` | Живот справа | shoulders-and-belly | 9 (3×3 grid) | `#36D97A` | `#22A85E` |
| `belly-left` | Живот слева | shoulders-and-belly | 9 (3×3 grid) | `#36D97A` | `#22A85E` |
| `thigh-right` | Правое бедро | thighs | 6 (2×3 grid) | `#FF8C33` | `#CC6800` |
| `thigh-left` | Левое бедро | thighs | 6 (2×3 grid) | `#FF8C33` | `#CC6800` |

### Group indicators

- **thighs** group: checkmark (✓) shown on the most recently used button across both thigh zones.
- **shoulders-and-belly** group: checkmark shown on the most recently used button across shoulders + belly zones.

Derived by scanning `events[]` from newest to oldest, skipping `manual-block` / `manual-unblock` events.

---

## Known limitations / TODO

- [ ] No safe-area handling for devices with home indicator (bottom padding is hardcoded to 20 px)
- [ ] Haptics do not fire on Android Expo Go (native module not available in managed workflow without dev build)
- [ ] Dark mode not yet implemented
- [ ] English locale not implemented (Russian only)
- [ ] `npm audit` reports 10 moderate vulnerabilities in dev dependencies — not production-critical
