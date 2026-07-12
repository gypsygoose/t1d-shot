import { LanguageMode } from "../types";
import { ResolvedLanguage } from "./utils";
import type { AppLocale } from "./locales";

export interface LanguageContextValue {
  mode: LanguageMode;
  resolvedLanguage: ResolvedLanguage;
  setMode: (mode: LanguageMode) => Promise<void>;
}

// Dot-path union of every leaf key in en.ts (e.g. "menu.themeRow") — used to
// type Record<SomeEnum, TranslationKey> lookup maps (ZONE_LABEL_KEY,
// THEME_MODE_KEY, ...) so a value pulled from one and handed to t() stays
// checked against the real key set, the same as a literal t('...') call.
// Lives here (not computed inline in index.ts) so data/zones.ts can import
// it directly from this file instead of index.ts's barrel — index.ts's own
// barrel re-exports ./hooks, which reaches LanguageContext.tsx ->
// StorageService -> data/, so a data/ -> index.ts edge would cycle back.
type LeafPaths<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? `${Prefix}${K}`
    : LeafPaths<T[K], `${Prefix}${K}.`>;
}[keyof T & string];

export type TranslationKey = LeafPaths<AppLocale>;
