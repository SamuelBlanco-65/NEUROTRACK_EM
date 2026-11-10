import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

type ProfileOptionProps = {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  icon?: keyof typeof MaterialIcons.glyphMap;
  iconBackgroundColor?: string;
  iconColor?: string;
  /** Reemplaza el ícono por un nodo a medida (p. ej. las barras de severidad). */
  iconNode?: ReactNode;
  testID?: string;
};

/** Tarjeta de una opción dentro del radiogroup de selección de perfil (RF-012). */
export function ProfileOption({
  title,
  description,
  selected,
  onPress,
  icon,
  iconBackgroundColor,
  iconColor,
  iconNode,
  testID,
}: ProfileOptionProps) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={title}
      accessibilityHint={description}
      hitSlop={8}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? colors.secondaryContainer : colors.surfaceContainerLowest,
          borderColor: selected ? colors.primary : 'transparent',
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
      {iconNode ? (
        <View style={[styles.iconBadge, { backgroundColor: iconBackgroundColor ?? colors.surfaceContainerLow }]}>
          {iconNode}
        </View>
      ) : icon ? (
        <View style={[styles.iconBadge, { backgroundColor: iconBackgroundColor }]}>
          <MaterialIcons name={icon} size={28} color={iconColor} />
        </View>
      ) : null}
      <View style={styles.textStack}>
        <View style={styles.titleRow}>
          <ThemedText variant="headlineSm" style={styles.titleText}>
            {title}
          </ThemedText>
          {selected ? (
            <MaterialIcons name="check-circle" size={24} color={colors.primary} />
          ) : null}
        </View>
        <ThemedText variant="bodyMd" colorRole="secondary" style={styles.description}>
          {description}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    minHeight: MinTouchSize,
    borderRadius: Radius.default,
    borderWidth: 2,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  textStack: {
    flex: 1,
    gap: Spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleText: {
    flexShrink: 1,
  },
  description: {
    marginTop: 2,
  },
});
