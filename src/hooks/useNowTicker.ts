import { useEffect } from "react";
import { SetAppState } from "./types";

// How often to refresh `now` so day-based color transitions show up without
// the user having to interact with the app.
const NOW_TICK_INTERVAL_MS = 60_000;

export function useNowTicker(setState: SetAppState): void {
  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => ({ ...prev, now: Date.now() }));
    }, NOW_TICK_INTERVAL_MS);
    return () => clearInterval(id);
  }, [setState]);
}
