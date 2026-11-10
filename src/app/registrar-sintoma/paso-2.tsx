import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ProfileOption } from '@/components/profile-option';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { Severity } from '@/features/symptoms/types';
import { symptomTypeLabel, SEVERITY_OPTIONS } from '@/features/symptoms/constants';
import { WizardActions } from '@/features/symptoms/wizard-actions';
import { WizardHeader } from '@/features/symptoms/wizard-header';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { draftReset, draftSeveritySet } from '@/store/slices/symptoms-slice';
import { Radius, Spacing, useThemeColors } from '@/theme';

const SEVERITY_BAR_COUNT: Record<Severity, number> = { leve: 1, moderado: 2, fuerte: 3 };

export default function RegistrarSintomaPaso2Screen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const symptomType = useAppSelector((state) => state.symptoms.draft.symptomType);
  const severity = useAppSelector((state) => state.symptoms.draft.severity);

  if (!symptomType) return <Redirect href="/registrar-sintoma/paso-1" />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <WizardHeader
          step={2}
          onClose={() => {
            dispatch(draftReset());
            router.dismissAll();
          }}
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.heading}>
            <ThemedText variant="headlineLg" accessibilityRole="header">
              ¿Qué tan fuerte es {symptomTypeLabel(symptomType).toLowerCase()}?
            </ThemedText>
            <ThemedText variant="bodyMd" colorRole="secondary">
              Selecciona cómo lo sientes ahora.
            </ThemedText>
          </View>
          <View accessibilityRole="radiogroup" accessibilityLabel="Nivel de severidad" style={styles.options}>
            {SEVERITY_OPTIONS.map((option) => (
              <ProfileOption
                key={option.id}
                title={option.title}
                description={option.description}
                selected={severity === option.id}
                onPress={() => dispatch(draftSeveritySet(option.id))}
                iconNode={
                  <View style={styles.severityBars}>
                    {Array.from({ length: SEVERITY_BAR_COUNT[option.id] }, (_, index) => (
                      <View key={index} style={[styles.severityBar, { backgroundColor: colors.tertiary }]} />
                    ))}
                  </View>
                }
                testID={`sintoma-severidad-${option.id}`}
              />
            ))}
          </View>

          <View style={[styles.reassuranceBanner, { backgroundColor: colors.tertiaryFixed }]}>
            <MaterialIcons name="lightbulb-outline" size={20} color={colors.onTertiaryFixed} />
            <ThemedText variant="bodySm" style={[styles.reassuranceText, { color: colors.onTertiaryFixedVariant }]}>
              Recuerda que no hay respuestas buenas ni malas. Tu registro es únicamente para cuidarte.
            </ThemedText>
          </View>
        </ScrollView>
        <View style={styles.actions}>
          <WizardActions
            onBack={() => router.back()}
            primaryLabel="Siguiente"
            primaryDisabled={!severity}
            onPrimaryPress={() => router.push('/registrar-sintoma/paso-3')}
            primaryTestID="sintoma-paso2-siguiente"
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
  severityBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  severityBar: {
    width: 4,
    height: 14,
    borderRadius: 2,
  },
  reassuranceBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
  },
  reassuranceText: {
    flex: 1,
  },
  actions: {
    paddingBottom: Spacing.md,
  },
});
