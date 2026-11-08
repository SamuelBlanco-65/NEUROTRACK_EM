import { StyleSheet, Text, type TextProps } from 'react-native';

import { type ColorRoleName, TypeScale, type TypeScaleName, useThemeColors } from '@/theme';

export type ThemedTextProps = TextProps & {
  variant?: TypeScaleName;
  colorRole?: ColorRoleName;
};

export function ThemedText({ style, variant = 'bodyMd', colorRole, ...rest }: ThemedTextProps) {
  const colors = useThemeColors();

  return (
    <Text
      style={[styles.base, TypeScale[variant], { color: colors[colorRole ?? 'onSurface'] }, style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
  },
});
