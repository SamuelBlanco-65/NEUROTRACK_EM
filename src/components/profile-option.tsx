import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

type ProfileOptionProps = {
  title: string;
  description: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
};

/** Tarjeta de una opción dentro del radiogroup de selección de perfil (RF-012). */
export function ProfileOption({ title, description, selected, onPress, testID }: ProfileOptionProps) {
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
          backgroundColor: colors.surfaceContainerLowest,
          borderColor: selected ? colors.primary : 'transparent',
          opacity: pressed ? 0.85 : 1,
        },
      ]}>
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
  },
  textStack: {
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
