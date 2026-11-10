import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';
import type { GuideType, SupportGuide } from './types';

const TYPE_ICON: Record<GuideType, keyof typeof MaterialIcons.glyphMap> = {
  leer: 'menu-book',
  escuchar: 'headset',
  ver: 'play-circle-outline',
};

const FILTERS: { id: GuideType | 'todo'; label: string }[] = [
  { id: 'todo', label: 'Todo' },
  { id: 'leer', label: 'Leer' },
  { id: 'escuchar', label: 'Escuchar' },
  { id: 'ver', label: 'Ver' },
];

export function GuideList({ guides, testID }: { guides: SupportGuide[]; testID: string }) {
  const colors = useThemeColors();
  const [filter, setFilter] = useState<GuideType | 'todo'>('todo');

  const visibleGuides = useMemo(
    () => (filter === 'todo' ? guides : guides.filter((guide) => guide.type === filter)),
    [guides, filter]
  );

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.headerRow}>
        <ThemedText variant="headlineSm" accessibilityRole="header">
          Para tu día a día
        </ThemedText>
        <ThemedText variant="labelSm" colorRole="onSurfaceVariant">
          {guides.length} guías
        </ThemedText>
      </View>

      <View style={styles.filterRow} accessibilityRole="radiogroup" accessibilityLabel="Filtrar guías por tipo">
        {FILTERS.map((item) => {
          const selected = item.id === filter;
          return (
            <Pressable
              key={item.id}
              onPress={() => setFilter(item.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={item.label}
              style={[
                styles.filterChip,
                { backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerLow },
              ]}
              testID={`apoyo-filtro-${item.id}`}>
              <ThemedText variant="labelMd" colorRole={selected ? 'onPrimary' : 'onSurfaceVariant'}>
                {item.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {visibleGuides.map((guide) => (
        <Pressable
          key={guide.id}
          onPress={() => router.push({ pathname: '/apoyo/[id]', params: { id: guide.id } })}
          accessibilityRole="button"
          accessibilityLabel={`${guide.title}, ${guide.duration}`}
          style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}
          testID={`apoyo-guia-${guide.id}`}>
          <View style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}>
            <MaterialIcons name={TYPE_ICON[guide.type]} size={22} color={colors.onSecondaryContainer} />
          </View>
          <View style={styles.cardBody}>
            <ThemedText variant="labelLg">{guide.title}</ThemedText>
            <View style={styles.metaRow}>
              <ThemedText variant="labelSm" colorRole="onSurfaceVariant">
                {guide.duration}
              </ThemedText>
              {guide.badge ? (
                <ThemedText variant="labelSm" colorRole="onSurfaceVariant">
                  · {guide.badge}
                </ThemedText>
              ) : null}
            </View>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  filterChip: {
    minHeight: MinTouchSize,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    borderRadius: Radius.default,
    padding: Spacing.md,
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
  cardBody: {
    flex: 1,
    gap: 2,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 2,
  },
});
