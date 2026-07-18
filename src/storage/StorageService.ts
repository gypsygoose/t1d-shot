import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import {
  AppEvent,
  EnabledZones,
  ExportedAppData,
  Gender,
  LanguageMode,
  PointRestoreMode,
  PointStatesMap,
  StoredPointState,
  ThemeMode,
  ZonePointCounts,
} from "../types";
import {
  DEFAULT_DAYS_TO_AVAILABLE,
  DEFAULT_DAYS_TO_WHITE,
  DEFAULT_GENDER,
  DEFAULT_POINT_RESTORE_MODE,
} from "../constants";
import { DEFAULT_ZONE_POINT_COUNTS, DEFAULT_ENABLED_ZONES } from "../data";
import {
  defaultAutoLock,
  DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS,
  DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS,
  clampDaysToWhite,
  clampDaysToAvailable,
  clampZonePointCounts,
  clampEnabledZones,
  isValidAppStorage,
} from "./utils";
import {
  POINT_STATES_KEY,
  EVENTS_KEY,
  MIRROR_KEY,
  INTERFACE_LOCKED_KEY,
  AUTO_LOCK_KEY,
  DAYS_TO_WHITE_KEY,
  DAYS_TO_AVAILABLE_KEY,
  POINT_RESTORE_MODE_KEY,
  GENDER_KEY,
  THEME_MODE_KEY,
  LANGUAGE_MODE_KEY,
  ZONE_POINT_COUNTS_KEY,
  ENABLED_ZONES_KEY,
  STORED_TRUE,
  STORED_FALSE,
  JSON_MIME_TYPE,
  EXPORT_FILE_PREFIX,
  IOS_JSON_UTI,
  THEME_MODES,
  LANGUAGE_MODES,
  POINT_RESTORE_MODES,
  GENDERS,
} from "./constants";
import { ImportResult, ImportResultType, StoredAutoLock } from "./types";

export { DEFAULT_AUTO_LOCK_AFTER_MARK_SECONDS, DEFAULT_AUTO_LOCK_AFTER_UNLOCK_SECONDS };

// AsyncStorage load/save/clear + export/import — every method is static, so
// callers reach it as StorageService.loadPointStates() etc. without needing to
// create/thread an instance (see CLAUDE.md's "Helper function / hook
// placement" — this stays the module's public API, same role storage.ts's
// standalone functions used to serve).
export class StorageService {
  // Point states are stored as a plain id→state object (Map isn't
  // JSON-serializable) and rehydrated into a PointStatesMap on load. The map
  // is sparse — only points carrying real data are present — so there's no
  // active-points list to backfill against; whatever's stored is loaded
  // as-is (a missing entry is a fresh, untouched point).
  static async loadPointStates(): Promise<PointStatesMap> {
    try {
      const raw = await AsyncStorage.getItem(POINT_STATES_KEY);
      if (!raw) return new Map();
      return new Map(
        Object.entries(JSON.parse(raw) as Record<string, StoredPointState>),
      );
    } catch {
      return new Map();
    }
  }

  static async loadEvents(): Promise<AppEvent[]> {
    try {
      const raw = await AsyncStorage.getItem(EVENTS_KEY);
      return raw ? (JSON.parse(raw) as AppEvent[]) : [];
    } catch {
      return [];
    }
  }

  static async savePointStates(pointStates: PointStatesMap): Promise<void> {
    await AsyncStorage.setItem(
      POINT_STATES_KEY,
      JSON.stringify(Object.fromEntries(pointStates)),
    );
  }

  static async saveEvents(events: AppEvent[]): Promise<void> {
    await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(events));
  }

  static async loadMirrored(): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(MIRROR_KEY)) === STORED_TRUE;
    } catch {
      return false;
    }
  }

  static async saveMirrored(mirrored: boolean): Promise<void> {
    await AsyncStorage.setItem(MIRROR_KEY, mirrored ? STORED_TRUE : STORED_FALSE);
  }

  static async loadInterfaceLocked(): Promise<boolean> {
    try {
      return (await AsyncStorage.getItem(INTERFACE_LOCKED_KEY)) === STORED_TRUE;
    } catch {
      return false;
    }
  }

  static async saveInterfaceLocked(locked: boolean): Promise<void> {
    await AsyncStorage.setItem(INTERFACE_LOCKED_KEY, locked ? STORED_TRUE : STORED_FALSE);
  }

  static async loadAutoLock(): Promise<StoredAutoLock> {
    try {
      const raw = await AsyncStorage.getItem(AUTO_LOCK_KEY);
      if (!raw) return defaultAutoLock();
      const parsed = JSON.parse(raw) as Partial<StoredAutoLock>;
      return { ...defaultAutoLock(), ...parsed };
    } catch {
      return defaultAutoLock();
    }
  }

  static async saveAutoLock(data: StoredAutoLock): Promise<void> {
    await AsyncStorage.setItem(AUTO_LOCK_KEY, JSON.stringify(data));
  }

  static async loadDaysToWhite(): Promise<number> {
    try {
      const raw = await AsyncStorage.getItem(DAYS_TO_WHITE_KEY);
      if (!raw) return DEFAULT_DAYS_TO_WHITE;
      return clampDaysToWhite(Number(raw));
    } catch {
      return DEFAULT_DAYS_TO_WHITE;
    }
  }

  static async saveDaysToWhite(days: number): Promise<void> {
    await AsyncStorage.setItem(DAYS_TO_WHITE_KEY, String(clampDaysToWhite(days)));
  }

  static async loadDaysToAvailable(): Promise<number> {
    try {
      const raw = await AsyncStorage.getItem(DAYS_TO_AVAILABLE_KEY);
      if (!raw) return DEFAULT_DAYS_TO_AVAILABLE;
      return clampDaysToAvailable(Number(raw));
    } catch {
      return DEFAULT_DAYS_TO_AVAILABLE;
    }
  }

  static async saveDaysToAvailable(days: number): Promise<void> {
    await AsyncStorage.setItem(
      DAYS_TO_AVAILABLE_KEY,
      String(clampDaysToAvailable(days)),
    );
  }

  static async loadPointRestoreMode(): Promise<PointRestoreMode> {
    try {
      const raw = await AsyncStorage.getItem(POINT_RESTORE_MODE_KEY);
      if (raw && POINT_RESTORE_MODES.includes(raw as PointRestoreMode))
        return raw as PointRestoreMode;
      return DEFAULT_POINT_RESTORE_MODE;
    } catch {
      return DEFAULT_POINT_RESTORE_MODE;
    }
  }

  static async savePointRestoreMode(mode: PointRestoreMode): Promise<void> {
    await AsyncStorage.setItem(POINT_RESTORE_MODE_KEY, mode);
  }

  static async loadGender(): Promise<Gender> {
    try {
      const raw = await AsyncStorage.getItem(GENDER_KEY);
      if (raw && GENDERS.includes(raw as Gender)) return raw as Gender;
      return DEFAULT_GENDER;
    } catch {
      return DEFAULT_GENDER;
    }
  }

  static async saveGender(gender: Gender): Promise<void> {
    await AsyncStorage.setItem(GENDER_KEY, gender);
  }

  static async loadThemeMode(): Promise<ThemeMode> {
    try {
      const raw = await AsyncStorage.getItem(THEME_MODE_KEY);
      if (raw && THEME_MODES.includes(raw as ThemeMode)) return raw as ThemeMode;
      return ThemeMode.System;
    } catch {
      return ThemeMode.System;
    }
  }

  static async saveThemeMode(mode: ThemeMode): Promise<void> {
    await AsyncStorage.setItem(THEME_MODE_KEY, mode);
  }

  static async loadLanguageMode(): Promise<LanguageMode> {
    try {
      const raw = await AsyncStorage.getItem(LANGUAGE_MODE_KEY);
      if (raw && LANGUAGE_MODES.includes(raw as LanguageMode))
        return raw as LanguageMode;
      return LanguageMode.System;
    } catch {
      return LanguageMode.System;
    }
  }

  static async saveLanguageMode(mode: LanguageMode): Promise<void> {
    await AsyncStorage.setItem(LANGUAGE_MODE_KEY, mode);
  }

  static async loadZonePointCounts(): Promise<ZonePointCounts> {
    try {
      const raw = await AsyncStorage.getItem(ZONE_POINT_COUNTS_KEY);
      if (!raw) return DEFAULT_ZONE_POINT_COUNTS;
      return clampZonePointCounts(JSON.parse(raw));
    } catch {
      return DEFAULT_ZONE_POINT_COUNTS;
    }
  }

  static async saveZonePointCounts(data: ZonePointCounts): Promise<void> {
    await AsyncStorage.setItem(
      ZONE_POINT_COUNTS_KEY,
      JSON.stringify(clampZonePointCounts(data)),
    );
  }

  static async loadEnabledZones(): Promise<EnabledZones> {
    try {
      const raw = await AsyncStorage.getItem(ENABLED_ZONES_KEY);
      if (!raw) return DEFAULT_ENABLED_ZONES;
      return clampEnabledZones(JSON.parse(raw));
    } catch {
      return DEFAULT_ENABLED_ZONES;
    }
  }

  static async saveEnabledZones(data: EnabledZones): Promise<void> {
    await AsyncStorage.setItem(
      ENABLED_ZONES_KEY,
      JSON.stringify(clampEnabledZones(data)),
    );
  }

  // ---------------------------------------------------------------------
  // Export / import full app state to/from a JSON file
  // ---------------------------------------------------------------------

  // Writes the full app state to a JSON file in cache and opens the system
  // share sheet so the user can pick where on the device to save it.
  // `dialogTitle` is pre-formatted by the caller (via t('menu.exportOptionsDialog.shareDialogTitle'))
  // since this module stays free of an i18next dependency, like PointService.ts.
  static async exportStorageToFile(
    data: ExportedAppData,
    dialogTitle: string,
  ): Promise<void> {
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileUri = `${FileSystem.cacheDirectory}${EXPORT_FILE_PREFIX}${dateStamp}.json`;
    await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2));

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: JSON_MIME_TYPE,
        dialogTitle,
        UTI: IOS_JSON_UTI,
      });
    }
  }

  // Lets the user pick a JSON file from the device and parses/validates it.
  // Does not touch AsyncStorage — the caller decides whether/when to apply it.
  // Missing fields are left absent (not defaulted) so the caller can tell a
  // category that was deliberately excluded from the export apart from one
  // that was included with a default value — see ExportedAppData's comment.
  // pointStates is kept as the parsed id→state Record (the export file's
  // shape); applyImport converts it to a PointStatesMap when applying.
  static async pickImportFile(): Promise<ImportResult> {
    const picked = await DocumentPicker.getDocumentAsync({
      type: JSON_MIME_TYPE,
      copyToCacheDirectory: true,
    });
    if (picked.canceled || picked.assets.length === 0)
      return { type: ImportResultType.Cancelled };

    try {
      const raw = await FileSystem.readAsStringAsync(picked.assets[0].uri);
      const parsed = JSON.parse(raw);
      if (!isValidAppStorage(parsed)) return { type: ImportResultType.Invalid };

      const data: ExportedAppData = { ...parsed };
      if (data.daysToWhite !== undefined) {
        data.daysToWhite = clampDaysToWhite(data.daysToWhite);
      }
      if (data.daysToAvailable !== undefined) {
        data.daysToAvailable = clampDaysToAvailable(data.daysToAvailable);
      }
      if (data.zonePointCounts !== undefined) {
        data.zonePointCounts = clampZonePointCounts(data.zonePointCounts);
      }
      if (data.enabledZones !== undefined) {
        data.enabledZones = clampEnabledZones(data.enabledZones);
      }
      return { type: ImportResultType.Success, data };
    } catch {
      return { type: ImportResultType.Invalid };
    }
  }

}
