export type VoiceLike = { identifier: string; language: string };

// Preferencia: español colombiano primero (RNF-011, contexto Colombia/Latinoamérica), luego
// español latinoamericano genérico, de EE. UU. y de México, y por último cualquier otro español.
const PREFERRED_LANGUAGES = ['es-co', 'es-419', 'es-us', 'es-mx'];

function normalize(language: string): string {
  return language.toLowerCase().replace('_', '-');
}

/** Elige el identificador de la mejor voz en español instalada, o `undefined` si no hay ninguna. */
export function chooseSpanishVoice(voices: VoiceLike[]): string | undefined {
  const spanish = voices.filter((voice) => normalize(voice.language).startsWith('es'));
  for (const preferred of PREFERRED_LANGUAGES) {
    const match = spanish.find((voice) => normalize(voice.language).startsWith(preferred));
    if (match) return match.identifier;
  }
  return spanish[0]?.identifier;
}

/**
 * Parte un texto largo en trozos de como máximo `maxLength` caracteres, cortando en el final
 * de una frase cuando se puede (y en un espacio si una frase sola es demasiado larga). El
 * motor de voz rechaza textos por encima de `Speech.maxSpeechInputLength` (~4000 en Android).
 */
export function splitForSpeech(text: string, maxLength: number): string[] {
  const sentences = text
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  const chunks: string[] = [];
  let current = '';
  const flush = () => {
    if (current) chunks.push(current);
    current = '';
  };

  for (const sentence of sentences) {
    if (sentence.length > maxLength) {
      flush();
      let rest = sentence;
      while (rest.length > maxLength) {
        const cut = rest.lastIndexOf(' ', maxLength);
        const at = cut > 0 ? cut : maxLength;
        chunks.push(rest.slice(0, at).trim());
        rest = rest.slice(at).trim();
      }
      current = rest;
      continue;
    }
    if (current && current.length + 1 + sentence.length > maxLength) flush();
    current = current ? `${current} ${sentence}` : sentence;
  }
  flush();
  return chunks;
}
