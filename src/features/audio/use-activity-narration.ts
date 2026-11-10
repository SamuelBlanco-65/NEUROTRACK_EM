import { useEffect } from 'react';

import { useAppSelector } from '@/store/hooks';
import { narrationFor } from './scripts';
import { speak, stopSpeaking } from './speech';

type NarrationSession = Parameters<typeof narrationFor>[0];

/**
 * Lectura automática en voz alta de una sesión de actividad (REC-002), solo si la preferencia
 * "Lectura en voz alta" de Accesibilidad está activa. Habla cuando cambia el momento de la
 * sesión (ver `narrationFor`) y se calla al salir de la pantalla.
 */
export function useActivityNarration(session: NarrationSession | null): void {
  const audioGuidance = useAppSelector((state) => state.settings.audioGuidance);
  const narration = session ? narrationFor(session) : null;
  const key = narration?.key;
  const text = narration?.text;

  useEffect(() => {
    if (audioGuidance && key && text) {
      speak(text);
    }
  }, [audioGuidance, key, text]);

  useEffect(() => stopSpeaking, []);
}
