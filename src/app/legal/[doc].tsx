import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { isLegalDocId, LEGAL_DOCUMENTS } from '@/features/legal/documents';
import { MinTouchSize, Spacing, useThemeColors } from '@/theme';

/** Términos de uso y política de privacidad: texto estático, accesible sin iniciar sesión. */
export default function LegalScreen() {
  const colors = useThemeColors();
  const { doc } = useLocalSearchParams<{ doc: string }>();
  const document = isLegalDocId(doc) ? LEGAL_DOCUMENTS[doc] : null;

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
            testID="legal-volver">
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <ThemedText variant="headlineSm" accessibilityRole="header" style={styles.title}>
            {document?.title ?? 'Documento'}
          </ThemedText>
        </View>

        {document ? (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <ThemedText variant="labelSm" colorRole="onSurfaceVariant">
              Actualizado: {document.updated}
            </ThemedText>
            <ThemedText variant="bodyMd">{document.intro}</ThemedText>
            {document.sections.map((section) => (
              <View key={section.heading} style={styles.section}>
                <ThemedText variant="labelLg" accessibilityRole="header">
                  {section.heading}
                </ThemedText>
                {section.body.map((paragraph) => (
                  <ThemedText key={paragraph} variant="bodyMd" colorRole="onSurfaceVariant">
                    {paragraph}
                  </ThemedText>
                ))}
              </View>
            ))}
          </ScrollView>
        ) : (
          <ScreenState kind="vacio" title="No encontramos ese documento" testID="legal-no-encontrado" />
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
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
  title: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.md,
  },
  section: { gap: Spacing.xs },
});
