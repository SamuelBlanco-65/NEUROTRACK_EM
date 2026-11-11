import * as Brightness from 'expo-brightness';
import { Platform } from 'react-native';

import { BRIGHTNESS_LEVEL, type BrightnessPreference } from '@/store/slices/settings-slice';

/**
 * Aplica el brillo propio de la app (V-D4: control de brillo disociado del brillo general del teléfono).
 * En Android `setBrightnessAsync` solo afecta a esta pantalla mientras la app está en primer plano, no cambia
 * el ajuste del sistema y no pide permisos. Con `sistema` se devuelve el control al teléfono. Si algo falla
 * (p. ej. el dispositivo no lo permite) se ignora: nunca debe romper la app.
 */
export async function applyBrightness(preference: BrightnessPreference): Promise<void> {
  try {
    const level = BRIGHTNESS_LEVEL[preference];
    if (level === null) {
      if (Platform.OS === 'android') await Brightness.restoreSystemBrightnessAsync();
      return;
    }
    await Brightness.setBrightnessAsync(level);
  } catch {
    // Sin brillo propio disponible: la app sigue con el brillo del sistema.
  }
}
