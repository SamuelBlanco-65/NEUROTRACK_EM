import * as Speech from 'expo-speech';
import { AccessibilityInfo } from 'react-native';

import { chooseSpanishVoice, splitForSpeech } from './voice';

// Voz del sistema (texto a voz del teléfono): funciona sin conexión y sin enviar nada a ningún
// servicio, importante porque lo que se lee son instrucciones de actividades (RNF-012).

// Margen bajo el límite de Android (~4000) para no rozar el borde.
const MAX_CHUNK_LENGTH = 3500;

let resolvedVoice: string | undefined | null = null; // null = aún no consultada
// Cada llamada a `speak`/`stopSpeaking` incrementa el contador; una lectura pendiente que ya
// no es la más reciente se descarta, para que dos toques seguidos no se pisen.
let latestRequest = 0;

async function resolveVoice(): Promise<string | undefined> {
  if (resolvedVoice !== null) return resolvedVoice;
  try {
    resolvedVoice = chooseSpanishVoice(await Speech.getAvailableVoicesAsync());
  } catch {
    resolvedVoice = undefined;
  }
  return resolvedVoice;
}

/** Lee `text` en voz alta, cortando cualquier lectura anterior. Nunca lanza: si falla, calla. */
export async function speak(text: string): Promise<void> {
  const request = ++latestRequest;
  try {
    await Speech.stop();
    const voice = await resolveVoice();
    if (request !== latestRequest) return;
    // Los textos largos (guías de Apoyo) se parten por frases; `Speech.speak` encola los trozos.
    const maxLength = Math.min(Speech.maxSpeechInputLength, MAX_CHUNK_LENGTH);
    for (const chunk of splitForSpeech(text, maxLength)) {
      Speech.speak(chunk, {
        voice,
        language: voice ? undefined : 'es-US',
        rate: 0.9, // un poco más lento que lo normal: baja fatiga cognitiva
      });
    }
  } catch {
    // Sin voz disponible no se bloquea nada: la actividad se puede hacer leyendo.
  }
}

/**
 * Lectura para la versión auditiva de las actividades (V-D5). Con un lector de pantalla activo Android silencia
 * `expo-speech` (TalkBack manda), pero aquí la voz ES el contenido (la secuencia no se ve): por eso, si hay
 * TalkBack, el texto se entrega como un anuncio de accesibilidad y lo lee el propio lector; si no, con la voz
 * del sistema como siempre. Nunca lanza.
 */
export async function speakForAudioMode(text: string): Promise<void> {
  try {
    if (await AccessibilityInfo.isScreenReaderEnabled()) {
      latestRequest += 1; // descarta lecturas propias pendientes
      AccessibilityInfo.announceForAccessibility(text);
      return;
    }
  } catch {
    // Si no se puede saber, se usa la voz del sistema.
  }
  await speak(text);
}

export function stopSpeaking(): void {
  latestRequest += 1;
  Speech.stop().catch(() => {});
}
