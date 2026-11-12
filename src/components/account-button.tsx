import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { MinTouchSize, Radius, useThemeColors } from '@/theme';

/** Botón de cabecera que abre «Mi cuenta»: 48 dp reales (sin solaparse con sus vecinos), no 32 con `hitSlop`. */
export function AccountButton({ testID }: { testID?: string }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={() => router.push('/cuenta')}
      accessibilityRole="button"
      accessibilityLabel="Mi cuenta"
      accessibilityHint="Cerrar sesión, cuidadores, privacidad y datos"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.surfaceContainerHigh, opacity: pressed ? 0.85 : 1 },
      ]}
      testID={testID}>
      <MaterialIcons name="account-circle" size={26} color={colors.onSurface} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: MinTouchSize,
    height: MinTouchSize,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
