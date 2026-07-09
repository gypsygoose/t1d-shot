import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { ColorSchemeName, useColorScheme } from "react-native";
import { ThemeMode } from "../types";
import { loadThemeMode, saveThemeMode } from "../storage/storage";
import { DARK_COLORS, LIGHT_COLORS, ThemeColors } from "./palette";

export type ResolvedScheme = ThemeMode.Light | ThemeMode.Dark;

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedScheme: ResolvedScheme;
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveScheme(
  mode: ThemeMode,
  systemScheme: ColorSchemeName,
): ResolvedScheme {
  if (mode !== ThemeMode.System) return mode;
  return systemScheme === "light" ? ThemeMode.Light : ThemeMode.Dark;
}

// Owns the persisted ThemeMode setting end to end (its own AsyncStorage key,
// same pattern as mirrored/autoLock*/daysToWhite) and resolves it against
// the live OS appearance. Mounted once in App.tsx, above MainScreen, so
// every screen — including MainScreen's own loading state — reads colors
// through useTheme() instead of each caller re-resolving the theme itself.
export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(ThemeMode.System);

  useEffect(() => {
    loadThemeMode().then(setModeState);
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    saveThemeMode(next);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const resolvedScheme = resolveScheme(mode, systemScheme);
    return {
      mode,
      resolvedScheme,
      colors: resolvedScheme === ThemeMode.Light ? LIGHT_COLORS : DARK_COLORS,
      setMode,
    };
  }, [mode, systemScheme, setMode]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme() must be used within a ThemeProvider");
  return ctx;
}
