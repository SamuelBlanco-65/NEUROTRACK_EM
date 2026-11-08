import { Platform, type TextStyle } from 'react-native';

// Familia tipográfica diseñada para baja visión / dislexia (export de Stitch).
export const FontFamily = {
  regular: Platform.select({ web: 'Atkinson Hyperlegible Next', default: 'AtkinsonHyperlegibleNext_400Regular' }),
  bold: Platform.select({ web: 'Atkinson Hyperlegible Next', default: 'AtkinsonHyperlegibleNext_700Bold' }),
} as const;

type TypeScaleEntry = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight' | 'fontFamily'>;

// Escala de texto del export de Stitch (tamaño/altura de línea/peso).
export const TypeScale: Record<
  'bodySm' | 'bodyMd' | 'bodyLg' | 'labelSm' | 'labelMd' | 'labelLg' | 'headlineSm' | 'headlineMd' | 'headlineLg',
  TypeScaleEntry
> = {
  bodySm: { fontSize: 15, lineHeight: 22, fontWeight: '400', fontFamily: FontFamily.regular },
  bodyMd: { fontSize: 17, lineHeight: 26, fontWeight: '400', fontFamily: FontFamily.regular },
  bodyLg: { fontSize: 19, lineHeight: 28, fontWeight: '400', fontFamily: FontFamily.regular },
  labelSm: { fontSize: 13, lineHeight: 18, fontWeight: '700', fontFamily: FontFamily.bold },
  labelMd: { fontSize: 15, lineHeight: 20, fontWeight: '700', fontFamily: FontFamily.bold },
  labelLg: { fontSize: 17, lineHeight: 24, fontWeight: '700', fontFamily: FontFamily.bold },
  headlineSm: { fontSize: 20, lineHeight: 28, fontWeight: '700', fontFamily: FontFamily.bold },
  headlineMd: { fontSize: 24, lineHeight: 32, fontWeight: '700', fontFamily: FontFamily.bold },
  headlineLg: { fontSize: 28, lineHeight: 36, fontWeight: '700', fontFamily: FontFamily.bold },
};

export type TypeScaleName = keyof typeof TypeScale;
