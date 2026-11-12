import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { guideScript } from '@/features/audio/screen-scripts';
import { SpeakButton } from '@/features/audio/speak-button';
import { findGuide } from '@/features/support/constants';
import type { GuideType } from '@/features/support/types';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const TYPE_ICON: Record<GuideType, keyof typeof MaterialIcons.glyphMap> = {
  leer: 'menu-book',
  escuchar: 'headset',
  ver: 'format-list-numbered',
};

export default function GuiaDeApoyoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useThemeColors();
  const guide = findGuide(id);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            style={styles.backButton}
            testID="apoyo-guia-volver">
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <ThemedText variant="headlineSm" accessibilityRole="header" numberOfLines={1} style={styles.headerTitle}>
            {guide?.title ?? 'Guía'}
          </ThemedText>
        </View>

        {!guide ? (
          <ScreenState
            kind="error"
            title="No encontramos esta guía"
            description="Puede que ya no esté disponible."
            testID="apoyo-guia-no-encontrada"
          />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.metaRow}>
              <View style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}>
                <MaterialIcons name={TYPE_ICON[guide.type]} size={22} color={colors.onSecondaryContainer} />
              </View>
              <View>
                <ThemedText variant="labelMd" colorRole="onSurfaceVariant">
                  {guide.duration}
                  {guide.badge ? ` · ${guide.badge}` : ''}
                </ThemedText>
              </View>
            </View>

            <ThemedText variant="bodyLg">{guide.summary}</ThemedText>
            <SpeakButton
              text={guideScript({ title: guide.title, summary: guide.summary, body: guide.body })}
              label="Escuchar la guía"
              accessibilityLabel="Escuchar la guía completa"
              style={{ alignSelf: 'flex-start' }}
              testID="apoyo-guia-escuchar"
              always={guide.type !== 'leer'}
            />

            {(guide.type === 'escuchar' || guide.type === 'ver') && (
              <View style={[styles.transcriptBanner, { backgroundColor: colors.surfaceContainer }]}>
                <MaterialIcons name="subtitles" size={18} color={colors.onSurfaceVariant} />
                <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.transcriptText}>
                  {guide.type === 'escuchar'
                    ? 'Esta guía se lee en voz alta con la voz de tu teléfono. El texto completo está siempre disponible aquí abajo.'
                    : 'Guía paso a paso: no hay video, cada movimiento está escrito aquí abajo y también puedes escucharlo.'}
                </ThemedText>
              </View>
            )}

            <View style={styles.body}>
              {guide.body.map((paragraph, index) => (
                <ThemedText key={index} variant="bodyMd" colorRole="onSurfaceVariant">
                  {paragraph}
                </ThemedText>
              ))}
            </View>

            <View style={[styles.disclaimer, { backgroundColor: colors.surfaceContainer }]}>
              <MaterialIcons name="info-outline" size={18} color={colors.onSurfaceVariant} />
              <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.disclaimerText}>
                Este contenido informa y acompaña; no reemplaza la atención profesional ni el criterio médico.
              </ThemedText>
            </View>
          </ScrollView>
        )}
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
  headerTitle: {
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transcriptBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
    alignItems: 'flex-start',
  },
  transcriptText: {
    flex: 1,
  },
  body: {
    gap: Spacing.sm,
  },
  disclaimer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
  },
});
