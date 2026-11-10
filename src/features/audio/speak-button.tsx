import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';
import { speak, stopSpeaking } from './speech';

type SpeakButtonProps = {
  /** Texto que se lee en voz alta al tocar. */
  text: string;
  /** Texto visible. Si se omite, solo se muestra el ícono (con etiqueta accesible). */
  label?: string;
  accessibilityLabel?: string;
  /** Para alinear el botón en su contenedor (p. ej. `{ alignSelf: 'flex-start' }`). */
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Botón "Escuchar" (REC-002): lee `text` con la voz del teléfono. Solo existe si la preferencia
 * "Lectura en voz alta" de Accesibilidad está activa (ver D-013): con ella apagada no se pinta
 * en ninguna pantalla, así el interruptor hace exactamente lo que dice. Es ícono + texto, o
 * ícono con etiqueta accesible, y mide al menos 48dp (RNF-005). Al salir de la pantalla corta
 * la lectura en curso.
 */
export function SpeakButton({ text, label, accessibilityLabel, style, testID }: SpeakButtonProps) {
  const colors = useThemeColors();
  const enabled = useAppSelector((state) => state.settings.audioGuidance);

  useEffect(() => stopSpeaking, []);

  if (!enabled) return null;

  return (
    <Pressable
      onPress={() => speak(text)}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label ?? 'Escuchar en voz alta'}
      hitSlop={4}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        label ? styles.withLabel : styles.iconOnly,
        { backgroundColor: colors.secondaryContainer, opacity: pressed ? 0.85 : 1 },
        style,
      ]}>
      <MaterialIcons name="volume-up" size={22} color={colors.onSecondaryContainer} />
      {label ? (
        <ThemedText variant="labelMd" colorRole="onSecondaryContainer">
          {label}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MinTouchSize,
    minWidth: MinTouchSize,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  withLabel: {
    paddingHorizontal: Spacing.md,
  },
  iconOnly: {
    paddingHorizontal: 0,
  },
});
