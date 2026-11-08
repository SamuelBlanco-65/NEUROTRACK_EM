import { View, type ViewProps } from 'react-native';

import { type ColorRoleName, useThemeColors } from '@/theme';

export type ThemedViewProps = ViewProps & {
  colorRole?: ColorRoleName;
};

export function ThemedView({ style, colorRole = 'surface', ...rest }: ThemedViewProps) {
  const colors = useThemeColors();

  return <View style={[{ backgroundColor: colors[colorRole] }, style]} {...rest} />;
}
