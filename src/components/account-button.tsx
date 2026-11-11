import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { Radius, useThemeColors } from '@/theme';

/** Botón de cabecera que abre «Mi cuenta» (32 dp visibles + `hitSlop` de 8 = 48 dp de área táctil). */
export function AccountButton({ testID }: { testID?: string }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => router.push('/cuenta')}
      accessibilityRole="button"
      accessibilityLabel="Mi cuenta: cerrar sesión, privacidad y datos"
      hitSlop={8}
      style={[styles.button, { backgroundColor: colors.surfaceContainerHigh }]}
      testID={testID}>
      <MaterialIcons name="account-circle" size={18} color={colors.onSurface} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
