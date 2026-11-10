import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SettingsState } from '@/store/slices/settings-slice';

const STORAGE_KEY = 'neurotrack:settings';

/** Preferencias de accesibilidad/apariencia: no son datos de salud, se guardan sin cifrar. */
export async function loadSettings(): Promise<Partial<SettingsState> | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<SettingsState>) : null;
  } catch {
    return null;
  }
}

export async function saveSettings(settings: SettingsState): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Si falla el guardado local, la preferencia solo vive en memoria por esta sesión.
  }
}
