import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing, useThemeColors } from '@/theme';

type ScreenStateProps = {
  kind: 'cargando' | 'error' | 'vacio';
  title: string;
  description?: string;
  testID?: string;
};

/** Estado no-contenido de una pantalla: carga, error o vacío (RNF-008). */
export function ScreenState({ kind, title, description, testID }: ScreenStateProps) {
  const colors = useThemeColors();

  return (
    <View
      style={styles.container}
      testID={testID}
      accessible
      accessibilityRole={kind === 'error' ? 'alert' : undefined}
      accessibilityState={{ busy: kind === 'cargando' }}
      accessibilityLiveRegion={kind === 'error' ? 'assertive' : 'polite'}>
      {kind === 'cargando' && <ActivityIndicator size="large" color={colors.primary} />}
      <ThemedText variant="headlineSm" style={styles.title}>
        {title}
      </ThemedText>
      {description ? (
        <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.description}>
          {description}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  title: {
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
  },
});
