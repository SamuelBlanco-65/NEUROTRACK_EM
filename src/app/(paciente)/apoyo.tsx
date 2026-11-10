import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CRISIS_CONTACTS, PATIENT_GUIDES } from '@/features/support/constants';
import { CrisisSection } from '@/features/support/crisis-section';
import { GuideList } from '@/features/support/guide-list';
import { Spacing, useThemeColors } from '@/theme';

export default function PacienteApoyoScreen() {
  const colors = useThemeColors();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText variant="headlineMd" accessibilityRole="header">
            Apoyo
          </ThemedText>
          <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
            Información clara y ayuda cuando la necesites.
          </ThemedText>

          <CrisisSection contacts={CRISIS_CONTACTS} lead="Escucha y orientación cuando algo pese más de la cuenta." />

          <GuideList guides={PATIENT_GUIDES} testID="paciente-apoyo-guias" />

          <View style={[styles.restBanner, { backgroundColor: colors.surfaceContainer }]}>
            <MaterialIcons name="spa" size={20} color={colors.tertiary} />
            <View style={styles.restText}>
              <ThemedText variant="labelMd">Pausa cuando lo necesites</ThemedText>
              <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                No tienes que leer todo hoy. Respeta tu propio ritmo y cuida tu energía.
              </ThemedText>
            </View>
          </View>

          <View style={[styles.disclaimer, { backgroundColor: colors.surfaceContainer }]}>
            <MaterialIcons name="info-outline" size={18} color={colors.onSurfaceVariant} />
            <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.disclaimerText}>
              Estos contenidos informan y acompañan; no reemplazan a tu médico ni sustituyen una consulta neurológica
              personalizada.
            </ThemedText>
          </View>
        </ScrollView>
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
  },
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.lg,
  },
  restBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  restText: {
    flex: 1,
    gap: 2,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
  },
});
