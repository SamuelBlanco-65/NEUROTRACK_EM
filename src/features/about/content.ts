import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type IconName = keyof typeof MaterialIcons.glyphMap;

export type AboutItem = { id: string; icon: IconName; title: string; text: string };
export type FaqItem = { id: string; question: string; answer: string };

/** Texto de «¿Qué es Neurotrack EM?». Solo afirma lo que la app hace de verdad; sin cifras ni promesas clínicas. */
export const ABOUT_HERO = {
  title: 'Un espacio para acompañarte',
  text: 'Neurotrack EM te ayuda a registrar cómo te sientes, moverte y ejercitar la mente a tu ritmo, y a compartirlo con quien tú elijas.',
  note: 'Pensada para personas con esclerosis múltiple y para quienes las acompañan.',
};

export const ABOUT_AUDIENCES: AboutItem[] = [
  {
    id: 'paciente',
    icon: 'person',
    title: 'Si vives con esclerosis múltiple',
    text: 'Registra tus síntomas, haz actividades suaves y mira cómo van tus semanas.',
  },
  {
    id: 'cuidador',
    icon: 'groups',
    title: 'Si acompañas a alguien',
    text: 'Ve lo que la persona decida compartir contigo, deja recordatorios y mándale ánimo.',
  },
];

export const ABOUT_FEATURES: AboutItem[] = [
  {
    id: 'sintomas',
    icon: 'edit-note',
    title: 'Registrar cómo te sientes',
    text: 'Elige el síntoma y qué tan fuerte es, en pocos toques. Lo ves en tu calendario.',
  },
  {
    id: 'actividades',
    icon: 'psychology',
    title: 'Actividades para mente y cuerpo',
    text: 'Memoria, atención y movimiento guiado. Sin límite de tiempo y sin presión.',
  },
  {
    id: 'progreso',
    icon: 'show-chart',
    title: 'Ver tu evolución',
    text: 'Compara tu semana, tu mes o tus últimos tres meses y prepara un resumen para tu consulta.',
  },
  {
    id: 'recordatorios',
    icon: 'notifications',
    title: 'Recordatorios',
    text: 'Medicación, citas y bienestar. Los marcas como hechos con un toque.',
  },
  {
    id: 'acompanamiento',
    icon: 'favorite-border',
    title: 'Acompañamiento',
    text: 'Invita a quien quieras con un código. Tú eliges qué ve y puedes quitarle el acceso.',
  },
  {
    id: 'apoyo',
    icon: 'volunteer-activism',
    title: 'Apoyo',
    text: 'Guías cortas para leer y líneas de ayuda cuando algo pese más de la cuenta.',
  },
];

export const ABOUT_STEPS: string[] = [
  'Elige tu perfil: paciente o persona que acompaña.',
  'Crea tu cuenta y confirma tu correo.',
  'Registra cómo te sientes hoy. Eso es todo para empezar.',
];

export const ABOUT_PRIVACY: string[] = [
  'Tu cuidador solo ve lo que tú autorices: síntomas, progreso o recordatorios.',
  'Puedes quitarle el acceso cuando quieras.',
  'Las notas personales de tu cuidador son solo suyas.',
  'Tu sesión se guarda cifrada en tu teléfono.',
  'Puedes borrar tu cuenta y todos tus datos desde «Mi cuenta».',
];

export const ABOUT_COMFORT: { id: string; icon: IconName; label: string }[] = [
  { id: 'texto', icon: 'text-fields', label: 'Texto más grande' },
  { id: 'oscuro', icon: 'dark-mode', label: 'Modo oscuro' },
  { id: 'contraste', icon: 'contrast', label: 'Alto contraste' },
  { id: 'voz', icon: 'record-voice-over', label: 'Lectura en voz alta' },
  { id: 'dictado', icon: 'mic', label: 'Dictado por voz' },
  { id: 'animaciones', icon: 'motion-photos-off', label: 'Menos animaciones' },
];

export const ABOUT_FAQ: FaqItem[] = [
  {
    id: 'medico',
    question: '¿Reemplaza a mi médico?',
    answer:
      'No. Neurotrack EM no diagnostica ni cambia tu tratamiento. Si notas algo nuevo o que empeora, habla con tu equipo médico.',
  },
  {
    id: 'frecuencia',
    question: '¿Cada cuánto tengo que usarla?',
    answer: 'Cuando tengas energía. No hay horarios ni cronómetros, y los días de descanso están bien.',
  },
  {
    id: 'cuidador',
    question: '¿Mi cuidador puede verlo todo?',
    answer: 'No. Solo ve lo que tú autorices, y puedes cambiarlo o quitarlo cuando quieras.',
  },
  {
    id: 'internet',
    question: '¿Necesito internet?',
    answer:
      'Para guardar y sincronizar tus registros, sí. Las guías de Apoyo y los números de ayuda se pueden consultar sin conexión.',
  },
  {
    id: 'borrar',
    question: '¿Cómo borro mi cuenta?',
    answer: 'En «Mi cuenta» elige «Eliminar mi cuenta». Se borran tu cuenta y todos tus registros.',
  },
  {
    id: 'edad',
    question: '¿Hay edad mínima?',
    answer: 'Sí: debes ser mayor de 18 años o contar con una persona adulta responsable que te acompañe.',
  },
];

export const ABOUT_NOTICE = 'Neurotrack EM acompaña tu seguimiento, pero no reemplaza a tu equipo médico ni da diagnósticos.';

/** Una sola línea de seguridad; los botones de llamada viven en la pestaña Apoyo (mismos números que CRISIS_CONTACTS). */
export const ABOUT_HELP = 'En una emergencia llama al 123. Si necesitas hablar con alguien, la Línea 106 (Bogotá) te escucha las 24 horas.';
