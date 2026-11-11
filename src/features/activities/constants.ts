import type { ActivityArea, ShapeId } from './types';

export const MAX_LEVEL: Record<ActivityArea, number> = {
  memoria: 5,
  atencion: 5,
  logica: 5,
  movimiento: 4,
};

/** Orden en que se muestran las áreas. */
export const ACTIVITY_AREAS: ActivityArea[] = ['memoria', 'atencion', 'logica', 'movimiento'];

export const ROUNDS_PER_SESSION = 3;
// Con 2 de 3 rondas correctas se sube de nivel (RF-003: la precisión manda, no la velocidad).
export const ROUNDS_TO_LEVEL_UP = 2;

export const AREA_META: Record<
  ActivityArea,
  { title: string; icon: 'psychology' | 'auto-awesome' | 'functions' | 'pan-tool-alt'; description: string }
> = {
  memoria: {
    title: 'Memoria',
    icon: 'psychology',
    description: 'Secuencia de patrones · memoriza y repite a tu ritmo.',
  },
  atencion: {
    title: 'Atención',
    icon: 'auto-awesome',
    description: 'Encuentra la figura distinta, sin cronómetro.',
  },
  logica: {
    title: 'Lógica',
    icon: 'functions',
    description: 'Descubre qué número sigue en la serie, sin cronómetro.',
  },
  movimiento: {
    title: 'Movimiento',
    icon: 'pan-tool-alt',
    description: 'Pasos guiados, aptos con temblor.',
  },
};

export const SHAPE_META: Record<ShapeId, { label: string; icon: 'circle' | 'square' | 'change-history' | 'diamond' }> = {
  circulo: { label: 'Círculo', icon: 'circle' },
  cuadrado: { label: 'Cuadrado', icon: 'square' },
  triangulo: { label: 'Triángulo', icon: 'change-history' },
  diamante: { label: 'Diamante', icon: 'diamond' },
};

export const ALL_SHAPES: ShapeId[] = ['circulo', 'cuadrado', 'triangulo', 'diamante'];

export const MOVIMIENTO_STEP_POOL = [
  'Levanta ambos brazos despacio y cuenta hasta 5.',
  'Gira el cuello suavemente hacia un lado y luego el otro.',
  'Aprieta y suelta las manos 5 veces, a tu ritmo.',
  'Inclina el torso levemente hacia adelante y vuelve al centro.',
  'Encoge los hombros hacia las orejas y suéltalos.',
  'Flexiona y estira los tobillos, sentado o de pie.',
] as const;
