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

// RF-010: no hay audio ni video grabado. Las guías «Escuchar» y «Paso a paso» se escriben completas como
// texto (siempre visible) y se pueden oír con la voz del teléfono con el botón «Escuchar la guía», que en
// estas guías aparece siempre. Son contenido informativo y de acompañamiento: no diagnostican ni sustituyen
// la indicación de tu equipo de salud (RT-004). Frases cortas y un solo tema por párrafo (RNF-010).
export const PATIENT_GUIDES: SupportGuide[] = [
  {
    id: 'fatiga-em',
    type: 'leer',
    title: 'Entender la fatiga en la EM',
    duration: 'Leer · 4 min',
    summary: 'Por qué la fatiga de la esclerosis múltiple no es «estar cansado» y qué suele ayudar.',
    body: [
      'La fatiga en la esclerosis múltiple no se parece al cansancio de después de un día largo. Puede llegar sin aviso, no siempre mejora durmiendo y suele empeorar con el calor, el estrés, las infecciones o el mal sueño.',
      'No es pereza ni falta de voluntad. Es un síntoma más de la enfermedad, tan real como cualquier otro.',
      'Primero, cuida tu energía como si fuera un presupuesto. Haz lo más importante del día en el momento en que sueles sentirte mejor, y deja lo demás para después o para otra persona.',
      'Segundo, descansa antes de quedarte sin fuerzas. Varias pausas cortas rinden más que una pausa larga cuando ya no puedes más.',
      'Tercero, reparte las tareas en bloques pequeños. Siéntate para las que se puedan hacer sentado, como cocinar o doblar ropa.',
      'Cuarto, ten cuidado con el calor. Una ducha tibia, ropa ligera, un ventilador y bebidas frescas pueden marcar la diferencia.',
      'Quinto, intenta mantener horarios de sueño regulares y moverte con suavidad, sin llegar al agotamiento.',
      'Avisa a tu equipo de salud si la fatiga cambia de golpe, aparece junto a síntomas nuevos, o si notas tristeza que no se va, ronquidos fuertes o pausas al respirar mientras duermes. Algunos medicamentos y otras condiciones también cansan, y tu equipo puede revisarlos. No suspendas ningún medicamento por tu cuenta.',
      'Registrar tu fatiga en el calendario de esta app te ayuda a ver patrones y a llevar datos concretos a tu próxima consulta.',
    ],
  },
  {
    id: 'respiracion-momentos-dificiles',
    type: 'escuchar',
    title: 'Respiración para momentos difíciles',
    duration: 'Escuchar · 3 min',
    badge: 'Se lee en voz alta',
    summary: 'Un ejercicio corto de respiración para cuando el día se siente pesado o la ansiedad sube.',
    body: [
      'Guía del ejercicio. Puedes leerla o pulsar «Escuchar la guía» y seguirla con los ojos cerrados. Hazla a tu ritmo.',
      'Preparación. Busca una postura cómoda, sentado o acostado. Apoya bien la espalda y deja caer los hombros. No hace falta cerrar los ojos si no quieres.',
      'Respira normal un momento, solo para notar cómo estás. No intentes cambiar nada todavía.',
      'Ciclo de respiración. Inhala por la nariz, despacio, contando hasta cuatro. Exhala por la boca, como si soplaras una vela, contando hasta seis. Alargar la exhalación ayuda al cuerpo a calmarse.',
      'Repite este ciclo cinco veces. Si prefieres, cuenta hasta tres y hasta cuatro. Lo importante es que sea cómodo, sin forzar.',
      'Si te mareas o sientes incomodidad, vuelve a respirar normal. No pasa nada por parar.',
      'Cierre. Nota si algo cambió, aunque sea poco: los hombros, la mandíbula, el ritmo del corazón. Vuelve a tu día cuando estés listo.',
      'Este ejercicio es un momento de pausa y no reemplaza ninguna indicación médica. Si la angustia es muy fuerte o no baja, llama a la línea 106. Si estás en peligro, llama al 123.',
    ],
  },
  {
    id: 'moverte-energia-limitada',
    type: 'ver',
    title: 'Moverte con energía limitada',
    duration: 'Paso a paso · 6 min',
    badge: 'Se lee en voz alta',
    summary: 'Cinco movimientos suaves para hacer sentado, en días de poca energía.',
    body: [
      'Guía paso a paso. No hay video: cada movimiento está escrito, y puedes escucharlo con el botón «Escuchar la guía».',
      'Antes de empezar. Siéntate en una silla firme, con los pies apoyados en el suelo. Ten cerca algo de agua y no te expongas al calor. Si estás muy cansado hoy, haz solo uno o dos movimientos: también cuenta.',
      'Paso uno. Sube y baja los hombros despacio, cinco veces.',
      'Paso dos. Gira el cuello suavemente hacia un lado y hacia el otro, sin forzar.',
      'Paso tres. Abre y cierra las manos cinco veces, con calma.',
      'Paso cuatro. Mueve los tobillos en círculos, primero hacia un lado y luego hacia el otro.',
      'Paso cinco. Estira los brazos hacia arriba y sostén cinco segundos, respirando normal.',
      'Detente de inmediato si sientes dolor, mareo, hormigueo nuevo o debilidad que no es la de siempre. Descansa, y cuéntaselo a tu equipo de salud si se repite.',
      'No busques cansarte. El objetivo es moverte con calma y parar antes de agotarte. Si quieres empezar una rutina de ejercicio, consúltalo antes con tu neurólogo o con un fisioterapeuta.',
    ],
  },
  {
    id: 'contarle-a-tu-familia',
    type: 'leer',
    title: 'Cómo contarle a tu familia lo que sientes',
    duration: 'Leer · 4 min',
    summary: 'Ideas para hablar de la EM con las personas cercanas sin sentir que eres una carga.',
    body: [
      'No tienes que explicarlo todo de una sola vez. Puedes empezar por lo que más te está costando hoy.',
      'Elige un momento tranquilo, sin prisa. Una conversación corta y honesta suele funcionar mejor que una larga.',
      'Sé concreto. En vez de «estoy mal», prueba con «hoy la fatiga no me deja hacer los mandados, ¿me ayudas con esto?».',
      'Las personas cercanas no siempre saben cómo ayudar hasta que se lo dices. Pedir algo específico funciona mejor que esperar a que lo adivinen.',
      'También puedes decir lo que no te ayuda: que te sobreprotejan, que minimicen lo que sientes o que decidan por ti.',
      'Tú decides cuánto compartir. En esta app, desde «Mis cuidadores» en tu perfil, eliges qué puede ver cada persona y puedes quitarle el acceso cuando quieras.',
      'Si te cuesta hablar de esto, no estás solo. La línea 106 también puede ayudarte a ordenar lo que quieres decir.',
    ],
  },
];

export const CAREGIVER_GUIDES: SupportGuide[] = [
  {
    id: 'cuidar-sin-agotarte',
    type: 'leer',
    title: 'Cuidar sin agotarte',
    duration: 'Leer · 5 min',
    badge: 'Esencial',
    summary: 'Señales de desgaste y cosas concretas que puedes hacer hoy para sostener tu propio cuidado.',
    body: [
      'Cuidar a alguien con esclerosis múltiple es un trabajo real, aunque no siempre se sienta así. Cansarte no te hace una mala persona ni un mal cuidador.',
      'Algunas señales de desgaste: cansancio que no se va, irritabilidad, dormir mal, sentirte solo o aislado, tristeza, o dejar de lado tu propia salud y tus citas.',
      'Cuida lo básico primero: dormir lo que puedas, comer a tus horas y moverte un poco. Sin eso, todo lo demás pesa más.',
      'Pide ayuda con tareas concretas, no con ayudas vagas. «¿Puedes llevarlo a la cita el jueves?» funciona mejor que «necesito ayuda». Haz una lista corta y deja que otras personas escojan algo.',
      'Busca un rato de descanso que sea tuyo, aunque sea pequeño: una caminata, una llamada con un amigo, algo que disfrutes. No es egoísmo, es lo que te permite seguir acompañando.',
      'Pon límites con cariño. Puedes decir «hoy no puedo» sin dar explicaciones largas.',
      'Si sientes desesperanza, o piensas que no puedes más, habla con alguien: un médico, un psicólogo o la línea 106. Si en algún momento piensas en hacerte daño, llama de inmediato al 123.',
      'Prueba la guía «Pausa de 5 minutos para ti» cuando necesites parar un momento.',
    ],
  },
  {
    id: 'contarle-al-medico',
    type: 'leer',
    title: 'Cómo contarle al médico lo que ves',
    duration: 'Leer · 4 min',
    summary: 'Cómo preparar tus observaciones para que sirvan en la consulta con el neurólogo.',
    body: [
      'Lo que ves a diario es información valiosa: cambios de ánimo, de movilidad o de energía que la persona misma no siempre nota.',
      'Antes de la cita, revisa tus notas y elige dos o tres patrones que te parezcan los más importantes, en vez de llevar todo suelto.',
      'Describe hechos, no conclusiones. En vez de «está peor», di «tropezó dos veces esta semana al subir escaleras».',
      'Para cada cambio, intenta decir qué pasó, cuándo empezó, cuánto duró y qué lo mejoró o lo empeoró.',
      'Tus observaciones en esta app son privadas: las ve solo tu cuenta. Puedes leerlas o compartirlas en la consulta por fuera de la app.',
      'Recuerda que la persona decide qué ve su médico. Si quiere compartirle un resumen, puede hacerlo desde su perfil, y tú puedes acompañarla en ese momento.',
      'Lleva también una lista con los medicamentos que toma y las preguntas que quieren hacer.',
    ],
  },
  {
    id: 'pausa-de-5-minutos',
    type: 'escuchar',
    title: 'Pausa de 5 minutos para ti',
    duration: 'Escuchar · 5 min',
    badge: 'Se lee en voz alta',
    summary: 'Una pausa guiada por pasos para bajar el ritmo en medio del día. Hazla a tu ritmo.',
    body: [
      'Guía de la pausa. Puedes leerla o pulsar «Escuchar la guía». Si quieres que dure cinco minutos, haz una pausa de unos segundos al final de cada paso.',
      'Minuto uno. Detente donde estés, aunque sea de pie. Apoya los pies en el suelo y nota el peso de tu cuerpo.',
      'Minuto dos. Mira a tu alrededor y nombra en voz baja cinco cosas que ves, cuatro que puedes tocar, tres que oyes, dos que hueles y una que saboreas. Esto ayuda a volver al presente.',
      'Minuto tres. Respira despacio. Inhala contando hasta cuatro y exhala contando hasta seis. Repite cinco veces.',
      'Minuto cuatro. Suelta la tensión. Baja los hombros, relaja la mandíbula, abre las manos y suaviza el ceño.',
      'Minuto cinco. Piensa en una sola cosa que hayas hecho bien hoy como cuidador. Solo una. Dite: «Estoy haciendo lo que puedo».',
      'Cuando estés listo, vuelve a tu día. Puedes repetir esta pausa las veces que la necesites.',
    ],
  },
  {
    id: 'redes-de-apoyo',
    type: 'leer',
    title: 'Redes de apoyo y cuidadores',
    duration: 'Leer · 4 min',
    badge: 'Comunidad',
    summary: 'Cómo encontrar grupos y personas que acompañen a quien cuida, y cómo elegirlos con cuidado.',
    body: [
      'Hablar con otros cuidadores que viven algo parecido ayuda a sentir menos soledad. No tienes que hacerlo todo solo.',
      'Una forma de empezar es preguntar en la consulta de neurología, en el servicio de trabajo social o en la atención al usuario de la EPS o IPS de tu familiar. Muchas veces conocen grupos de pacientes y cuidadores de tu ciudad.',
      'También hay organizaciones internacionales de esclerosis múltiple, como la Federación Internacional de Esclerosis Múltiple, que publican información y enlazan con asociaciones de cada país.',
      'Si te unes a un grupo en línea, fíjate en que esté moderado, que respete la privacidad y que no prometa curas milagrosas ni pida dinero a cambio de «tratamientos».',
      'Cuida lo que compartes: no publiques datos médicos de la persona que acompañas sin su permiso.',
      'Para hablar con alguien de inmediato sobre cómo te sientes, está la línea 106. Si estás en peligro o es una urgencia, llama al 123.',
    ],
  },
];

export function findGuide(id: string): SupportGuide | undefined {
  return [...PATIENT_GUIDES, ...CAREGIVER_GUIDES].find((guide) => guide.id === id);
}
