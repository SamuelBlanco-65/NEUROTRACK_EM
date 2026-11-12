import { useEffect } from 'react';

import { useAppSelector } from '@/store/hooks';
import { narrationFor } from './scripts';
import { speak, speakForAudioMode, stopSpeaking } from './speech';

type NarrationSession = Parameters<typeof narrationFor>[0];

/**
 * Lectura automática en voz alta de una sesión de actividad (REC-002), solo si la preferencia
 * "Lectura en voz alta" de Accesibilidad está activa. Habla cuando cambia el momento de la
 * sesión (ver `narrationFor`) y se calla al salir de la pantalla.
 *
 * Con «Actividades solo con audio» (V-D5) la voz es el contenido: se usa `speakForAudioMode`, que con TalkBack
 * activo entrega el texto como anuncio de accesibilidad en vez de dejar que el lector silencie la voz.
 */
export function useActivityNarration(session: NarrationSession | null): void {
  const audioGuidance = useAppSelector((state) => state.settings.audioGuidance);
  const audioOnly = useAppSelector((state) => state.settings.audioOnly);
  const narration = session ? narrationFor(session, { audioOnly }) : null;
  const key = narration?.key;
  const text = narration?.text;

  useEffect(() => {
    if (audioGuidance && key && text) {
      if (audioOnly) speakForAudioMode(text);
      else speak(text);
    }
  }, [audioGuidance, audioOnly, key, text]);

  useEffect(() => stopSpeaking, []);
}
