import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppStorage, StoredButtonState } from '../types';
import { BUTTONS } from '../data/zones';

const STORAGE_KEY = '@t1d_shot_v1';

function defaultStorage(): AppStorage {
  const buttonStates: Record<string, StoredButtonState> = {};
  for (const btn of BUTTONS) {
    buttonStates[btn.id] = { buttonId: btn.id, isManuallyBlocked: false };
  }
  return { buttonStates, events: [] };
}

export async function loadStorage(): Promise<AppStorage> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStorage();
    const parsed = JSON.parse(raw) as AppStorage;
    // Merge any buttons not yet in stored state (app updates)
    const states = parsed.buttonStates ?? {};
    for (const btn of BUTTONS) {
      if (!states[btn.id]) {
        states[btn.id] = { buttonId: btn.id, isManuallyBlocked: false };
      }
    }
    return { buttonStates: states, events: parsed.events ?? [] };
  } catch {
    return defaultStorage();
  }
}

export async function saveStorage(data: AppStorage): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function clearStorage(): Promise<AppStorage> {
  const fresh = defaultStorage();
  await saveStorage(fresh);
  return fresh;
}
