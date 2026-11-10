import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileOption } from '@/components/profile-option';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SYMPTOM_TYPE_ICON, SYMPTOM_TYPE_OPTIONS } from '@/features/symptoms/constants';
import { WizardActions } from '@/features/symptoms/wizard-actions';
import { WizardHeader } from '@/features/symptoms/wizard-header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { draftReset, draftSymptomTypeSet } from '@/store/slices/symptoms-slice';
import { Spacing, useThemeColors } from '@/theme';

export default function RegistrarSintomaPaso1Screen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const symptomType = useAppSelector((state) => state.symptoms.draft.symptomType);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <WizardHeader
          step={1}
          onClose={() => {
            dispatch(draftReset());
            router.back();
          }}
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <ThemedText variant="headlineLg" accessibilityRole="header">¿Qué estás sintiendo?</ThemedText>
            <ThemedText variant="bodyMd" colorRole="secondary">
              Elige lo que más se acerque a lo que notas ahora.
            </ThemedText>
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
        </ScrollView>
        <View style={styles.actions}>
          <WizardActions
            primaryLabel="Siguiente"
            primaryDisabled={!symptomType}
            onPrimaryPress={() => router.push('/registrar-sintoma/paso-2')}
            primaryTestID="sintoma-paso1-siguiente"
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
  options: {
    gap: Spacing.md,
  },
  actions: {
    paddingBottom: Spacing.md,
  },
});
