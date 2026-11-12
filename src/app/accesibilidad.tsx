import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { stopSpeaking } from '@/features/audio/speech';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  audioGuidanceToggled,
  audioOnlyToggled,
  brightnessChanged,
  colorSchemeChanged,
  highContrastToggled,
  reduceMotionToggled,
  settingsReset,
  textScaleChanged,
  type BrightnessPreference,
  type ColorSchemePreference,
  type TextScalePreference,
} from '@/store/slices/settings-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const COLOR_SCHEME_OPTIONS: { id: ColorSchemePreference; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'light', label: 'Claro', icon: 'light-mode' },
  { id: 'dark', label: 'Oscuro', icon: 'dark-mode' },
  { id: 'auto', label: 'Automático', icon: 'brightness-auto' },
];

const BRIGHTNESS_OPTIONS: { id: BrightnessPreference; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'sistema', label: 'Del teléfono', icon: 'brightness-auto' },
  { id: 'bajo', label: 'Bajo', icon: 'brightness-medium' },
  { id: 'muy-bajo', label: 'Muy bajo', icon: 'brightness-low' },
];

const TEXT_SCALE_OPTIONS: { id: TextScalePreference; label: string }[] = [
  { id: 'normal', label: 'Normal' },
  { id: 'grande', label: 'Grande' },
  { id: 'extra-grande', label: 'Extra grande' },
];

export default function AccesibilidadScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const settings = useAppSelector((state) => state.settings);

  function confirmarRestablecer() {
    Alert.alert(
      'Restablecer configuración',
      'Esto vuelve la apariencia, el brillo, el contraste, el tamaño de texto, las animaciones, la lectura en voz alta y las actividades solo con audio a sus valores originales.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Restablecer',
          style: 'destructive',
          onPress: () => {
            stopSpeaking();
            dispatch(settingsReset());
          },
        },
      ]
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            style={styles.backButton}
            testID="accesibilidad-volver">
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Accesibilidad
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={[styles.introCard, { backgroundColor: colors.surfaceContainerLowest }]}>
            <MaterialIcons name="favorite-border" size={22} color={colors.primary} />
            <View style={styles.introTextGroup}>
              <ThemedText variant="labelLg">A tu propio compás</ThemedText>
              <ThemedText variant="bodySm" colorRole="secondary">
                Ajusta cada preferencia como mejor te funcione. Se guardan en este dispositivo y se
                aplican en toda la app al instante.
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText variant="headlineSm">Apariencia</ThemedText>
            <View style={styles.optionsRow}>
              {COLOR_SCHEME_OPTIONS.map((option) => {
                const selected = option.id === settings.colorScheme;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => dispatch(colorSchemeChanged(option.id))}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={option.label}
                    style={[
                      styles.optionCard,
                      { backgroundColor: selected ? colors.primary : colors.surfaceContainerLowest },
                    ]}
                    testID={`accesibilidad-esquema-${option.id}`}>
                    <MaterialIcons
                      name={option.icon}
                      size={22}
                      color={selected ? colors.onPrimary : colors.onSurfaceVariant}
                    />
                    <ThemedText variant="labelMd" colorRole={selected ? 'onPrimary' : 'onSurface'}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText variant="headlineSm">Brillo de la app</ThemedText>
            <ThemedText variant="bodySm" colorRole="secondary">
              Baja el brillo solo mientras usas Neurotrack EM, sin cambiar el del resto del teléfono. Útil si
              la luz te molesta.
            </ThemedText>
            <View accessibilityRole="radiogroup" accessibilityLabel="Brillo de la app" style={styles.optionsRow}>
              {BRIGHTNESS_OPTIONS.map((option) => {
                const selected = option.id === settings.brightness;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => dispatch(brightnessChanged(option.id))}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={option.label}
                    style={[
                      styles.optionCard,
                      { backgroundColor: selected ? colors.primary : colors.surfaceContainerLowest },
                    ]}
                    testID={`accesibilidad-brillo-${option.id}`}>
                    <MaterialIcons
                      name={option.icon}
                      size={22}
                      color={selected ? colors.onPrimary : colors.onSurfaceVariant}
                    />
                    <ThemedText variant="labelMd" colorRole={selected ? 'onPrimary' : 'onSurface'}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText variant="headlineSm">Tamaño de texto</ThemedText>
            <ThemedText variant="bodySm" colorRole="secondary">
              Se suma al tamaño de letra que ya tengas configurado en el teléfono.
            </ThemedText>
            <View style={styles.optionsRow}>
              {TEXT_SCALE_OPTIONS.map((option) => {
                const selected = option.id === settings.textScale;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => dispatch(textScaleChanged(option.id))}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    accessibilityLabel={option.label}
                    style={[
                      styles.optionCard,
                      { backgroundColor: selected ? colors.primary : colors.surfaceContainerLowest },
                    ]}
                    testID={`accesibilidad-texto-${option.id}`}>
                    <ThemedText variant="labelMd" colorRole={selected ? 'onPrimary' : 'onSurface'}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
            <View style={[styles.previewCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <ThemedText variant="bodyMd" accessibilityLabel="Vista previa del tamaño de texto elegido">
                Así se ve un párrafo normal con el tamaño elegido.
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ToggleRow
              icon="contrast"
              title="Alto contraste"
              description="Aumenta el contraste de textos y bordes por encima del mínimo habitual, para que se lean más fácil."
              value={settings.highContrast}
              onChange={() => dispatch(highContrastToggled())}
              testID="accesibilidad-alto-contraste"
            />
          </View>

          <View style={styles.section}>
            <ToggleRow
              icon="motion-photos-off"
              title="Reducir animaciones"
              description="En las actividades, la señal de acierto o error se queda fija en vez de desaparecer sola a los pocos segundos."
              value={settings.reduceMotion}
              onChange={() => dispatch(reduceMotionToggled())}
              testID="accesibilidad-reducir-animaciones"
            />
          </View>

          <View style={styles.section}>
            <ToggleRow
              icon="volume-up"
              title="Lectura en voz alta"
              description="Muestra el botón «Escuchar» en las pantallas principales y, en las actividades, lee solas las instrucciones, la secuencia y los resultados. Si ya usas TalkBack no la necesitas."
              value={settings.audioGuidance}
              onChange={() => {
                if (settings.audioGuidance) stopSpeaking();
                dispatch(audioGuidanceToggled());
              }}
              testID="accesibilidad-lectura-voz"
            />
          </View>

          <View style={styles.section}>
            <ToggleRow
              icon="hearing"
              title="Actividades solo con audio"
              description="En Memoria y Lógica no se muestra la secuencia ni la serie: se dicen en voz alta y puedes repetirlas con «Escuchar». Para quien no puede ver la pantalla. Enciende también la lectura en voz alta."
              value={settings.audioOnly}
              onChange={() => {
                if (settings.audioOnly) stopSpeaking();
                dispatch(audioOnlyToggled());
              }}
              testID="accesibilidad-solo-audio"
            />
          </View>

          <View style={[styles.privacyNote, { backgroundColor: colors.tertiaryFixed }]}>
            <MaterialIcons name="lock" size={18} color={colors.onTertiaryFixed} />
            <ThemedText variant="bodySm" style={[styles.privacyNoteText, { color: colors.onTertiaryFixedVariant }]}>
              Tus preferencias son privadas: se guardan solo en este dispositivo, no se comparten con
              nadie.
            </ThemedText>
          </View>

          <Pressable
            onPress={confirmarRestablecer}
            accessibilityRole="button"
            accessibilityLabel="Restablecer configuración de accesibilidad"
            style={[styles.resetButton, { backgroundColor: colors.surfaceContainerLow }]}
            testID="accesibilidad-restablecer">
            <MaterialIcons name="restart-alt" size={20} color={colors.onSurfaceVariant} />
            <ThemedText variant="labelLg">Restablecer configuración</ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ToggleRow({
  icon,
  title,
  description,
  value,
  onChange,
  testID,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onChange: () => void;
  testID: string;
}) {
  const colors = useThemeColors();
  return (
    <View style={[styles.toggleCard, { backgroundColor: colors.surfaceContainerLowest }]}>
      <View style={[styles.toggleIcon, { backgroundColor: colors.surfaceContainerLow }]}>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.toggleTextGroup}>
        <ThemedText variant="labelLg">{title}</ThemedText>
        <ThemedText variant="bodySm" colorRole="secondary">
          {description}
        </ThemedText>
      </View>
      <View style={styles.toggleSwitchGroup}>
        <ThemedText variant="labelSm" colorRole={value ? 'primary' : 'secondary'}>
          {value ? 'Sí' : 'No'}
        </ThemedText>
        <Switch
          value={value}
          onValueChange={onChange}
          trackColor={{ false: colors.surfaceContainerHigh, true: colors.primary }}
          thumbColor={colors.surfaceContainerLowest}
          accessibilityLabel={title}
          accessibilityHint={description}
          testID={testID}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  backButton: {
    minWidth: MinTouchSize,
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.lg,
  },
  introCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  introTextGroup: {
    flex: 1,
    gap: 2,
  },
  section: {
    gap: Spacing.sm,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  optionCard: {
    flexGrow: 1,
    minHeight: MinTouchSize,
    borderRadius: Radius.default,
    paddingHorizontal: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  previewCard: {
    borderRadius: Radius.default,
    padding: Spacing.md,
  },
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  toggleIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleTextGroup: {
    flex: 1,
    gap: 2,
  },
  toggleSwitchGroup: {
    alignItems: 'center',
    gap: 2,
  },
  privacyNote: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
  },
  privacyNoteText: {
    flex: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
  },
});
