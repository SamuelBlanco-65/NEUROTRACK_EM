export type LegalDocId = 'terminos' | 'privacidad';

export type LegalSection = { heading: string; body: string[] };

export type LegalDocument = {
  id: LegalDocId;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
};

/** Canal de contacto del responsable del tratamiento (consultas, reclamos y soporte). */
export const SUPPORT_EMAIL = 'neurotrackem@gmail.com';

/** Versión de los documentos que se acepta al crear la cuenta. Súbela cada vez que cambie su contenido. */
export const LEGAL_VERSION = '2026-11';

export const LEGAL_DOCUMENTS: Record<LegalDocId, LegalDocument> = {
  terminos: {
    id: 'terminos',
    title: 'Términos de uso',
    updated: 'Noviembre de 2026',
    intro:
      'Estos términos explican cómo puedes usar Neurotrack EM. Al crear tu cuenta aceptas lo que aquí se dice.',
    sections: [
      {
        heading: 'Qué es Neurotrack EM',
        body: [
          'Es una app de acompañamiento para personas con esclerosis múltiple y sus cuidadores: te permite registrar síntomas, hacer actividades de estimulación y compartir, si tú quieres, parte de esa información con alguien de confianza. Es un proyecto académico.',
        ],
      },
      {
        heading: 'No es un servicio médico',
        body: [
          'Neurotrack EM no diagnostica, no trata y no reemplaza a tu equipo médico. Las actividades y los resúmenes son un apoyo para ti y para la consulta, no una evaluación clínica.',
          'Si sientes que algo va mal o es urgente, llama a tu médico o a la línea de emergencias 123. Si necesitas hablar con alguien, la Línea 106 acompaña en crisis emocionales.',
        ],
      },
      {
        heading: 'Tu cuenta',
        body: [
          'Debes ser mayor de 18 años para crear una cuenta.',
          'Eres responsable de guardar tu contraseña y de la información que registras. Puedes cerrar sesión o eliminar tu cuenta y todos tus datos en cualquier momento desde «Mi cuenta».',
          'Al crear tu cuenta guardamos la fecha y la versión de estos documentos que aceptaste, como constancia de tu autorización.',
        ],
      },
      {
        heading: 'Cuidadores y permisos',
        body: [
          'Solo tú decides quién te acompaña. Una persona cuidadora ve únicamente lo que tú autorices (síntomas, progreso, recordatorios) y puedes quitarle el acceso cuando quieras.',
          'Si eres cuidador, usa lo que ves con respeto y solo para acompañar a esa persona.',
        ],
      },
      {
        heading: 'Uso adecuado',
        body: [
          'No uses la app para fines ilegales, para acceder a cuentas ajenas ni para intentar saltarte las medidas de seguridad.',
        ],
      },
      {
        heading: 'Disponibilidad y cambios',
        body: [
          'Hacemos lo posible por que la app funcione siempre, pero puede tener errores o interrupciones. Podemos actualizar estos términos; si el cambio es importante te lo avisaremos en la app.',
        ],
      },
      {
        heading: 'Créditos y licencias',
        body: [
          'Tipografía Atkinson Hyperlegible Next, del Braille Institute (licencia SIL Open Font License). Íconos Material Icons, de Google (licencia Apache 2.0).',
        ],
      },
      {
        heading: 'Contacto',
        body: [`Escríbenos a ${SUPPORT_EMAIL}.`],
      },
    ],
  },
  privacidad: {
    id: 'privacidad',
    title: 'Privacidad y datos de salud',
    updated: 'Noviembre de 2026',
    intro:
      'Aquí te contamos qué datos guardamos, para qué y qué derechos tienes. Aplica la Ley 1581 de 2012 de Colombia (protección de datos personales).',
    sections: [
      {
        heading: 'Quién es el responsable',
        body: [
          `El responsable del tratamiento de tus datos es el equipo de Neurotrack EM. Puedes contactarnos en ${SUPPORT_EMAIL}.`,
        ],
      },
      {
        heading: 'Qué datos guardamos',
        body: [
          'Tu nombre y correo electrónico.',
          'Lo que registras: síntomas con su severidad y notas, resultados y nivel en las actividades, y recordatorios.',
          'Si eres cuidador: tus observaciones privadas y los mensajes de ánimo que envías.',
          'La fecha y la versión de los documentos que aceptaste al crear tu cuenta.',
          'Tus preferencias de accesibilidad se guardan solo en tu teléfono.',
        ],
      },
      {
        heading: 'Son datos sensibles',
        body: [
          'Los datos sobre tu salud son datos sensibles. Por eso solo los tratamos con tu autorización expresa, que das al crear tu cuenta, y no estás obligado a darla: puedes no registrarte.',
        ],
      },
      {
        heading: 'Para qué los usamos',
        body: [
          'Únicamente para que la app funcione: mostrarte tu calendario y tu progreso, sincronizarlos entre tus dispositivos y compartirlos con quien tú autorices. No vendemos tus datos ni los usamos para publicidad.',
        ],
      },
      {
        heading: 'Quién puede verlos',
        body: [
          'Solo tú. Una persona cuidadora ve únicamente lo que habilitaste en «Cuidadores» y solo después de que aceptes su solicitud. Las notas privadas de un cuidador no las ve el paciente.',
        ],
      },
      {
        heading: 'Servicios de terceros',
        body: [
          'Supabase guarda tu cuenta y tus registros. Gmail (Google) envía los correos de confirmación y de recuperación de contraseña. Vercel aloja la página web a la que llega el enlace de esos correos; esa página no guarda tus registros de salud.',
          'Los servidores de estos proveedores pueden estar fuera de Colombia, por lo que tus datos pueden transferirse a otro país. Al crear tu cuenta aceptas esa transferencia.',
        ],
      },
      {
        heading: 'Dónde y cómo se protegen',
        body: [
          'Se guardan en una base de datos de Supabase con reglas de acceso por usuario, y viajan cifrados. La sesión se guarda cifrada en el almacenamiento seguro de tu teléfono.',
          'Ningún sistema es infalible: usa una contraseña única y no la compartas.',
        ],
      },
      {
        heading: 'Cuánto tiempo los guardamos',
        body: [
          'Mientras tengas tu cuenta. Si la eliminas desde «Mi cuenta», tus datos se borran de forma permanente.',
        ],
      },
      {
        heading: 'Tus derechos',
        body: [
          'Puedes conocer, actualizar y corregir tus datos, revocar tu autorización y pedir que se eliminen. Desde «Mi cuenta» puedes eliminar tu cuenta: se borran tu perfil y todos tus registros de forma permanente.',
          `Para consultar, corregir o reclamar escríbenos a ${SUPPORT_EMAIL} desde el correo de tu cuenta. Respondemos las consultas en máximo 10 días hábiles y los reclamos en máximo 15 días hábiles.`,
        ],
      },
      {
        heading: 'Cambios en esta política',
        body: [
          'Si cambia de forma importante, te lo avisaremos en la app y actualizaremos la fecha de arriba.',
        ],
      },
    ],
  },
};

export function isLegalDocId(value: string | undefined): value is LegalDocId {
  return value === 'terminos' || value === 'privacidad';
}
