import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CAREGIVER_GUIDES, CRISIS_CONTACTS } from '@/features/support/constants';
import { CrisisSection } from '@/features/support/crisis-section';
import { GuideList } from '@/features/support/guide-list';
import { Spacing, useThemeColors } from '@/theme';

export default function CuidadorApoyoScreen() {
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

          <CrisisSection
            contacts={CRISIS_CONTACTS}
            lead="Acompañamiento profesional y líneas directas, para ti y tu familia."
          />

          <View style={[styles.selfCareBanner, { backgroundColor: colors.surfaceContainer }]}>
            <MaterialIcons name="favorite-border" size={20} color={colors.tertiary} />
            <View style={styles.selfCareText}>
              <ThemedText variant="labelMd">Cuidarte a ti es parte de cuidar</ThemedText>
              <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                No estás solo. Dedicar tiempo a tu bienestar no es descuido, es la base que te permite seguir
                acompañando.
              </ThemedText>
            </View>
          </View>

          <GuideList guides={CAREGIVER_GUIDES} testID="cuidador-apoyo-guias" />

          <View style={[styles.disclaimer, { backgroundColor: colors.surfaceContainer }]}>
            <MaterialIcons name="info-outline" size={18} color={colors.onSurfaceVariant} />
            <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.disclaimerText}>
              Estos contenidos informan y acompañan; no reemplazan la atención profesional ni el criterio médico.
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
  selfCareBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: 16,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  selfCareText: {
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
