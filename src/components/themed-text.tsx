import { PixelRatio, StyleSheet, Text, type TextProps } from 'react-native';

import { type ColorRoleName, TypeScale, type TypeScaleName, useTextScaleMultiplier, useThemeColors } from '@/theme';

export type ThemedTextProps = TextProps & {
  variant?: TypeScaleName;
  colorRole?: ColorRoleName;
};

export function ThemedText({ style, variant = 'bodyMd', colorRole, ...rest }: ThemedTextProps) {
  const colors = useThemeColors();
  const appTextScale = useTextScaleMultiplier();
  const { lineHeight, fontSize, ...typeScale } = TypeScale[variant];
  // `fontSize` escala solo con la preferencia de fuente del sistema (comportamiento
  // nativo de <Text>); `lineHeight` no, así que hay que escalarlo a mano con el mismo
  // factor o el texto se recorta/superpone con fuentes grandes (RNF-002). El multiplicador
  // de "Tamaño de texto" de Accesibilidad se aplica ANTES de que el SO escale el resultado,
  // así los dos controles se combinan en vez de pisarse.
  const scaledFontSize = fontSize ? fontSize * appTextScale : undefined;
  const scaledLineHeight = lineHeight ? lineHeight * appTextScale * PixelRatio.getFontScale() : undefined;

  return (
    <Text
      style={[
        styles.base,
        typeScale,
        { fontSize: scaledFontSize, lineHeight: scaledLineHeight, color: colors[colorRole ?? 'onSurface'] },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
