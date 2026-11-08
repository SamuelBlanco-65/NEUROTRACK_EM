import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { WizardActions } from '@/features/symptoms/wizard-actions';
import { WizardHeader } from '@/features/symptoms/wizard-header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { draftNoteSet, draftReset, submitSymptomLog } from '@/store/slices/symptoms-slice';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const NOTE_MAX_LENGTH = 300;

export default function RegistrarSintomaPaso3Screen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const symptomType = useAppSelector((state) => state.symptoms.draft.symptomType);
  const severity = useAppSelector((state) => state.symptoms.draft.severity);
  const note = useAppSelector((state) => state.symptoms.draft.note);
  const submitStatus = useAppSelector((state) => state.symptoms.submitStatus);
  const submitError = useAppSelector((state) => state.symptoms.submitError);

  if (!symptomType || !severity) return <Redirect href="/registrar-sintoma/paso-1" />;

  async function guardar() {
    const result = await dispatch(submitSymptomLog());
    if (submitSymptomLog.fulfilled.match(result)) {
      dispatch(draftReset());
      router.dismissTo('/(paciente)/calendario');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <WizardHeader
          step={3}
          onClose={() => {
            dispatch(draftReset());
            router.dismissAll();
          }}
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <ThemedText variant="headlineLg">¿Quieres agregar algo?</ThemedText>
            <ThemedText variant="bodyMd" colorRole="secondary">
              Es totalmente opcional. Puedes guardar sin escribir nada.
            </ThemedText>
          </View>

          <View style={[styles.noteCard, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={styles.noteHeader}>
              <ThemedText variant="labelMd">Nota (opcional)</ThemedText>
              <ThemedText variant="labelSm" colorRole="secondary">
                {note.length}/{NOTE_MAX_LENGTH}
              </ThemedText>
            </View>
            <TextInput
              value={note}
              onChangeText={(text) => dispatch(draftNoteSet(text.slice(0, NOTE_MAX_LENGTH)))}
              placeholder="Escribe alguna sensación, cómo dormiste o lo que quieras recordar…"
              placeholderTextColor={colors.secondary}
              multiline
              numberOfLines={4}
              maxLength={NOTE_MAX_LENGTH}
              style={[styles.noteInput, { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface }]}
              accessibilityLabel="Nota opcional sobre el registro"
              testID="sintoma-nota"
            />
          </View>

          {submitError ? (
            <View
              style={[styles.errorBanner, { backgroundColor: colors.tertiaryFixed }]}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive">
              <ThemedText variant="labelMd">{submitError.message}</ThemedText>
            </View>
          ) : null}
        </ScrollView>
        <View style={styles.actions}>
          <WizardActions
            onBack={() => router.back()}
            primaryLabel={submitStatus === 'guardando' ? 'Guardando…' : 'Guardar registro'}
            primaryLoading={submitStatus === 'guardando'}
            onPrimaryPress={guardar}
            primaryTestID="sintoma-paso3-guardar"
          />
        </View>
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
    gap: Spacing.lg,
  },
  scroll: {
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  heading: {
    gap: 2,
  },
  noteCard: {
    borderRadius: Radius.default,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noteInput: {
    minHeight: MinTouchSize * 2,
    borderRadius: Radius.default,
    padding: Spacing.md,
    textAlignVertical: 'top',
  },
  errorBanner: {
    borderRadius: Radius.default / 2,
    padding: Spacing.sm,
  },
  actions: {
    paddingBottom: Spacing.md,
  },
});
