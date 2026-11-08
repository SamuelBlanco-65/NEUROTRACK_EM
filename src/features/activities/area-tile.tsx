import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';
import { AREA_META, MAX_LEVEL } from './constants';
import type { ActivityArea } from './types';

type AreaTileProps = {
  area: ActivityArea;
  level: number;
  onPress: () => void;
  testID?: string;
};

export function AreaTile({ area, level, onPress, testID }: AreaTileProps) {
  const colors = useThemeColors();
  const meta = AREA_META[area];
  const maxLevel = MAX_LEVEL[area];

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Área ${meta.title}, nivel ${level} de ${maxLevel}`}
      hitSlop={4}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: colors.surfaceContainerLowest, opacity: pressed ? 0.9 : 1 },
      ]}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: colors.secondaryContainer }]}>
          <MaterialIcons name={meta.icon} size={24} color={colors.primaryContainer} />
        </View>
        <View>
          <ThemedText variant="labelLg">{meta.title}</ThemedText>
          <ThemedText variant="bodySm" colorRole="secondary" style={styles.levelText}>
            Nivel {level} de {maxLevel}
          </ThemedText>
        </View>
      </View>
      <View
        style={styles.progressRow}
        accessibilityRole="progressbar"
        accessibilityLabel={`Progreso de ${meta.title}: ${level} de ${maxLevel} niveles`}
        accessibilityValue={{ min: 1, max: maxLevel, now: level }}>
        {Array.from({ length: maxLevel }, (_, index) => (
          <View
            key={index}
            style={[
              styles.segment,
              { backgroundColor: index < level ? colors.primaryContainer : colors.surfaceContainerHighest },
            ]}
          />
        ))}
      </View>
    </Pressable>
  );
}

type LockedAreaTileProps = {
  title: string;
  unlockHint: string;
};

export function LockedAreaTile({ title, unlockHint }: LockedAreaTileProps) {
  const colors = useThemeColors();

  return (
    <View
      style={[styles.tile, { backgroundColor: colors.surfaceContainerLow, opacity: 0.8 }]}
      accessible
      accessibilityLabel={`Área ${title}, bloqueada. ${unlockHint}`}>
      <View style={styles.top}>
        <View style={[styles.iconWrap, { backgroundColor: colors.surfaceContainerHighest }]}>
          <MaterialIcons name="lock" size={22} color={colors.outline} />
        </View>
        <ThemedText variant="labelLg" colorRole="secondary">
          {title}
        </ThemedText>
      </View>
      <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.hint}>
        {unlockHint}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexBasis: '48%',
    flexGrow: 1,
    minHeight: MinTouchSize * 2,
    borderRadius: Radius.default,
    padding: Spacing.md,
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  top: {
    gap: Spacing.xs,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    marginTop: 2,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  segment: {
    flex: 1,
    height: 6,
    borderRadius: Radius.full,
  },
  hint: {
    marginTop: Spacing.xs,
  },
});
