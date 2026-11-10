import type { CrisisContact, SupportGuide } from './types';

// RF-009: líneas de ayuda inmediata. Fijas en Bogotá — si se expande a otras ciudades,
// este es el lugar para añadir más contactos.
export const CRISIS_CONTACTS: CrisisContact[] = [
  {
    id: 'linea-106',
    title: 'Línea 106 · Bogotá',
    description: 'Escucha y orientación psicológica, confidencial · 24 horas · gratuita.',
    phone: '106',
    badge: '24h · Gratuita',
    variant: 'primary',
  },
  {
    id: 'emergencias-123',
    title: 'Emergencias',
    description: 'Si estás en peligro inmediato o necesitas auxilio de salud, llama ya.',
    phone: '123',
    badge: 'Urgente',
    variant: 'error',
  },
];

// RF-010: no hay audio/video grabado todavía — "Escuchar" y "Ver" se entregan como
// transcripción/texto completo desde el inicio (no como una pista aparte), así el
// requisito de subtítulos/transcripción queda cubierto sin depender de media real.
export const PATIENT_GUIDES: SupportGuide[] = [
  {
    id: 'fatiga-em',
    type: 'leer',
    title: 'Entender la fatiga en la EM',
    duration: 'Leer · 3 min',
    summary: 'Por qué la fatiga de la esclerosis múltiple no es "estar cansado" y cómo explicarla.',
    body: [
      'La fatiga en la esclerosis múltiple no se parece al cansancio normal: puede aparecer sin aviso, no siempre mejora durmiendo, y empeora con el calor o el estrés.',
      'No es falta de voluntad ni pereza. Es un síntoma más de la enfermedad, tan real como cualquier otro.',
      'Escuchar a tu cuerpo y repartir las tareas del día en bloques cortos, con pausas, suele ayudar más que "aguantar" hasta terminar todo de una vez.',
      'Si la fatiga cambia de golpe o se vuelve mucho más intensa, coméntaselo a tu neurólogo en la próxima consulta.',
    ],
  },
  {
    id: 'respiracion-momentos-dificiles',
    type: 'escuchar',
    title: 'Respiración para momentos difíciles',
    duration: 'Escuchar · 5 min',
    badge: 'Con transcripción',
    summary: 'Un ejercicio corto de respiración guiada para cuando el día se siente pesado.',
    body: [
      'Transcripción completa del audio guiado:',
      'Busca una posición cómoda, sentado o acostado. No hace falta que cierres los ojos si no quieres.',
      'Inhala contando hasta cuatro, despacio, por la nariz.',
      'Sostén el aire contando hasta cuatro.',
      'Exhala contando hasta seis, soltando los hombros.',
      'Repite este ciclo cinco veces, a tu ritmo. Si en algún punto necesitas parar, está bien parar.',
      'Este ejercicio no reemplaza ninguna indicación médica; es solo un momento de pausa para ti.',
    ],
  },
  {
    id: 'moverte-energia-limitada',
    type: 'ver',
    title: 'Moverte con energía limitada',
    duration: 'Ver · 6 min',
    badge: 'Con subtítulos',
    summary: 'Ideas de movimiento suave para días de poca energía, sin necesidad de levantarte mucho.',
    body: [
      'Subtítulos completos del video:',
      'Paso 1. Sentado, estira los brazos hacia arriba y sostén cinco segundos.',
      'Paso 2. Gira el cuello despacio hacia un lado y hacia el otro, sin forzar.',
      'Paso 3. Levanta una pierna a la vez, sostenla unos segundos y bájala con control.',
      'Paso 4. Mueve los tobillos en círculos, primero hacia un lado y después hacia el otro.',
      'Si algún movimiento te genera dolor o mareo, detente y descansa. No busques repetir muchas veces, busca moverte con calma.',
    ],
  },
  {
    id: 'contarle-a-tu-familia',
    type: 'leer',
    title: 'Cómo contarle a tu familia lo que sientes',
    duration: 'Leer · 4 min',
    summary: 'Ideas para hablar de la EM con las personas cercanas sin sentir que es una carga.',
    body: [
      'No tienes que explicarlo todo de una sola vez. Puedes empezar por lo que más te está costando hoy.',
      'Es útil ser concreto: en vez de "estoy mal", probar con "hoy la fatiga no me deja hacer mandados, ¿me ayudas con esto?".',
      'Las personas cercanas no siempre saben cómo ayudar hasta que se los dices directamente. Pedir ayuda específica suele funcionar mejor que esperar a que la adivinen.',
      'Si sientes que te cuesta hablar de esto, no estás solo: la línea 106 también puede ayudarte a ordenar lo que quieres decir.',
    ],
  },
];

export const CAREGIVER_GUIDES: SupportGuide[] = [
  {
    id: 'cuidar-sin-agotarte',
    type: 'leer',
    title: 'Cuidar sin agotarte',
    duration: 'Leer · 4 min',
    badge: 'Esencial',
    summary: 'Pautas para identificar el desgaste físico y mental, y sostener tu propio cuidado.',
    body: [
      'Cuidar a alguien con EM es un trabajo real, aunque no siempre se sienta así. El cansancio, la irritabilidad o la sensación de "no doy más" son señales, no debilidades.',
      'Dedicar tiempo a tu propio descanso no le quita tiempo a la persona que cuidas: es lo que te permite seguir acompañando de forma sostenible.',
      'Pide ayuda cuando la necesites, sin esperar a estar al límite. No tienes que cargar todo solo.',
    ],
  },
  {
    id: 'contarle-al-medico',
    type: 'leer',
    title: 'Cómo contarle al médico lo que ves',
    duration: 'Leer · 3 min',
    summary: 'Guía práctica para llevar notas cotidianas a la consulta neurológica.',
    body: [
      'Tus observaciones diarias son información valiosa: cambios de ánimo, de movilidad o de energía que el paciente mismo no siempre nota.',
      'Antes de la cita, revisa tus notas y elige 2 o 3 patrones que te parezcan más importantes, en vez de llevar todo suelto.',
      'Describe lo que observaste con hechos concretos ("tropezó dos veces esta semana al subir escaleras") en vez de conclusiones ("está peor").',
    ],
  },
  {
    id: 'pausa-de-5-minutos',
    type: 'escuchar',
    title: 'Pausa de 5 minutos para ti',
    duration: 'Escuchar · 5 min',
    badge: 'Con transcripción',
    summary: 'Ejercicio de respiración y descanso guiado para recargar serenidad en medio del día.',
    body: [
      'Transcripción completa del audio guiado:',
      'Detente un momento, aunque sea de pie. No necesitas un espacio especial.',
      'Respira profundo tres veces, sin apurarte.',
      'Piensa en una sola cosa que hayas hecho bien hoy como cuidador. Solo una.',
      'Suelta los hombros y el ceño. Vuelve a tu día cuando estés listo.',
    ],
  },
  {
    id: 'redes-de-apoyo',
    type: 'leer',
    title: 'Redes de apoyo y cuidadores',
    duration: 'Leer · 5 min',
    badge: 'Comunidad',
    summary: 'Asociaciones y grupos comunitarios de acompañamiento en EM en Colombia.',
    body: [
      'Existen asociaciones de pacientes con esclerosis múltiple en varias ciudades de Colombia que también acompañan a cuidadores, con grupos de conversación y orientación.',
      'Hablar con otros cuidadores que viven algo parecido ayuda a sentir menos soledad en el proceso.',
      'Pregunta en la EPS o IPS que atiende a tu familiar si tienen contacto con alguna asociación local; muchas veces el neurólogo tratante también las conoce.',
    ],
  },
];

export function findGuide(id: string): SupportGuide | undefined {
  return [...PATIENT_GUIDES, ...CAREGIVER_GUIDES].find((guide) => guide.id === id);
}
