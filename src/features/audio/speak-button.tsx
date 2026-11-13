import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';
import { speak, speakForAudioMode, stopSpeaking } from './speech';

type SpeakButtonProps = {
  /** Texto que se lee en voz alta al tocar. */
  text: string;
  /** Texto visible. Si se omite, solo se muestra el ícono (con etiqueta accesible). */
  label?: string;
  accessibilityLabel?: string;
  /** Para alinear el botón en su contenedor (p. ej. `{ alignSelf: 'flex-start' }`). */
  style?: StyleProp<ViewStyle>;
  testID?: string;
  /**
   * Muestra el botón aunque «Lectura en voz alta» esté apagada. Solo para contenido cuyo formato ES el audio
   * (las guías «Escuchar»), donde no tener el botón dejaría sin cumplir lo que la guía promete.
   */
  always?: boolean;
};

/**
 * Botón "Escuchar" (REC-002): lee `text` con la voz del teléfono. Solo existe si la preferencia
 * "Lectura en voz alta" de Accesibilidad está activa: con ella apagada no se pinta
 * en ninguna pantalla, así el interruptor hace exactamente lo que dice. Es ícono + texto, o
 * ícono con etiqueta accesible, y mide al menos 48dp (RNF-005). Al salir de la pantalla corta
 * la lectura en curso.
 */
export function SpeakButton({ text, label, accessibilityLabel, style, testID, always }: SpeakButtonProps) {
  const colors = useThemeColors();
  const enabled = useAppSelector((state) => state.settings.audioGuidance);
  const audioOnly = useAppSelector((state) => state.settings.audioOnly);

  useEffect(() => stopSpeaking, []);

  if (!enabled && !always) return null;

  return (
    <Pressable
      onPress={() => (audioOnly ? speakForAudioMode(text) : speak(text))}
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
