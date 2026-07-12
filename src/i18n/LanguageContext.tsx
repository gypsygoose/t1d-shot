import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import i18next from "i18next";
import { LanguageMode } from "../types";
import { StorageService } from "../storage";
import { LanguageContextValue } from "./types";
import { resolveLanguage } from "./utils";

export const LanguageContext = createContext<LanguageContextValue | null>(
  null,
);

// Owns the persisted LanguageMode setting end to end (its own AsyncStorage
// key, same pattern as ThemeMode — see src/theme/ThemeContext.tsx) and
// resolves it against the device locale, applying the result to the i18next
// singleton so every useTranslation() consumer re-renders. Mounted once in
// App.tsx, above MainScreen. Device-locale resolution is read once per mode
// change rather than subscribed to live OS locale changes — unlike
// light/dark, a locale change mid-session is effectively never observed in
// practice, so the extra plumbing isn't worth it here.
//
// Imports the `i18next` package directly (not the initialized instance
// re-exported from ./index.ts) — the package's default export is already
// the same singleton instance app-wide regardless of which file imports it,
// and importing it directly here (instead of via ./index) avoids a module
// cycle back through hooks/useLanguage.ts, which index.ts's own barrel
// re-exports.
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<LanguageMode>(LanguageMode.System);

  useEffect(() => {
    StorageService.loadLanguageMode().then((loadedMode) => {
      setModeState(loadedMode);
      i18next.changeLanguage(resolveLanguage(loadedMode));
    });
  }, []);

  const setMode = useCallback(async (next: LanguageMode) => {
    setModeState(next);
    StorageService.saveLanguageMode(next);
    await i18next.changeLanguage(resolveLanguage(next));
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ mode, resolvedLanguage: resolveLanguage(mode), setMode }),
    [mode, setMode],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
