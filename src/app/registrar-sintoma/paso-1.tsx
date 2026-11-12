import { router } from 'expo-router';
import { useRef, type ComponentRef } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileOption } from '@/components/profile-option';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SYMPTOM_TYPE_ICON, SYMPTOM_TYPE_OPTIONS } from '@/features/symptoms/constants';
import { screenIntroScript } from '@/features/audio/screen-scripts';
import { SpeakButton } from '@/features/audio/speak-button';
import { WizardActions } from '@/features/symptoms/wizard-actions';
import { CUSTOM_LABEL_MAX_LENGTH } from '@/features/symptoms/types';
import { WizardHeader } from '@/features/symptoms/wizard-header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { draftCustomLabelSet, draftReset, draftSymptomTypeSet } from '@/store/slices/symptoms-slice';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

export default function RegistrarSintomaPaso1Screen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const symptomType = useAppSelector((state) => state.symptoms.draft.symptomType);
  const customLabel = useAppSelector((state) => state.symptoms.draft.customLabel);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Sube el contenido cuando aparece el teclado, para que el campo «Otro» no quede tapado. */}
        <KeyboardAvoidingView
          style={styles.keyboardArea}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
        <WizardHeader
          step={1}
          onClose={() => {
            dispatch(draftReset());
            router.back();
          }}
        />
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <ThemedText variant="headlineLg" accessibilityRole="header">¿Qué estás sintiendo?</ThemedText>
            <ThemedText variant="bodyMd" colorRole="secondary">
              Elige lo que más se acerque a lo que notas ahora.
            </ThemedText>
            <SpeakButton
              text={screenIntroScript(
                '¿Qué estás sintiendo?',
                'Elige lo que más se acerque a lo que notas ahora.',
                SYMPTOM_TYPE_OPTIONS
              )}
              label="Escuchar"
              accessibilityLabel="Escuchar las opciones"
              style={styles.speak}
              testID="sintoma-paso1-escuchar"
            />
          </View>
          <View accessibilityRole="radiogroup" accessibilityLabel="Tipo de síntoma" style={styles.options}>
            {SYMPTOM_TYPE_OPTIONS.map((option) => (
              <ProfileOption
                key={option.id}
                title={option.title}
                description={option.description}
                selected={symptomType === option.id}
                onPress={() => dispatch(draftSymptomTypeSet(option.id))}
                icon={SYMPTOM_TYPE_ICON[option.id]}
                iconBackgroundColor={colors.surfaceContainerLow}
                iconColor={colors.tertiary}
                testID={`sintoma-tipo-${option.id}`}
              />
            ))}
          </View>
          {symptomType === 'otro' ? (
            <View style={[styles.customCard, { backgroundColor: colors.surfaceContainerLowest }]}>
              <View style={styles.customHeader}>
                <ThemedText variant="labelMd">¿Cómo lo describirías?</ThemedText>
                <ThemedText variant="labelSm" colorRole="secondary">
                  {customLabel.length}/{CUSTOM_LABEL_MAX_LENGTH}
                </ThemedText>
              </View>
              <TextInput
                value={customLabel}
                onChangeText={(text) => dispatch(draftCustomLabelSet(text.slice(0, CUSTOM_LABEL_MAX_LENGTH)))}
                placeholder="Escríbelo con tus palabras (opcional)"
                placeholderTextColor={colors.onSurfaceVariant}
                maxLength={CUSTOM_LABEL_MAX_LENGTH}
                autoFocus
                onFocus={() => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300)}
                style={[styles.customInput, { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface }]}
                accessibilityLabel="Cómo describirías tu síntoma, con tus palabras. Opcional"
                testID="sintoma-otro-texto"
              />
              <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                Por ejemplo: «hormigueo en la mano izquierda» o «sensibilidad al calor». Si no escribes nada, se
                guarda como «Otro».
              </ThemedText>
            </View>
          ) : null}
        </ScrollView>
        <View style={styles.actions}>
          <WizardActions
            primaryLabel="Siguiente"
            primaryDisabled={!symptomType}
            onPrimaryPress={() => router.push('/registrar-sintoma/paso-2')}
            primaryTestID="sintoma-paso1-siguiente"
          />
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.md,
  },
  keyboardArea: {
    flex: 1,
    gap: Spacing.lg,
  },
  scroll: {
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  heading: {
    gap: 2,
  },
  speak: {
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  options: {
    gap: Spacing.md,
  },
  customCard: {
    borderRadius: Radius.default,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  customHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customInput: {
    minHeight: MinTouchSize + 8,
    borderRadius: Radius.default,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 17,
  },
  actions: {
    paddingBottom: Spacing.md,
  },
});
