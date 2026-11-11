import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing, useThemeColors } from '@/theme';
import { initialsOf, sharedCategories } from './logic';
import type { DoctorPermissions } from './types';

/** Círculo con iniciales (decorativo: el nombre ya se lee al lado). */
export function InitialsAvatar({ name, size = 48 }: { name: string | null; size?: number }) {
  const colors = useThemeColors();
  return (
    <View
      style={[styles.avatar, { width: size, height: size, backgroundColor: colors.primary }]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants">
      <ThemedText variant="labelLg" colorRole="onPrimary" maxFontSizeMultiplier={1.2}>
        {initialsOf(name)}
      </ThemedText>
    </View>
  );
}

/** Contador junto al título de una sección («1 pendiente»). */
export function CountBadge({ text }: { text: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.badge, { backgroundColor: colors.secondaryContainer }]}>
      <ThemedText variant="labelSm" colorRole="onSecondaryContainer">
        {text}
      </ThemedText>
    </View>
  );
}

/**
 * Chips de lo que se comparte. Compartido = relleno con ✓; no compartido = contorno con ojo tachado
 * y la palabra «no compartidas» (nunca solo color, RNF-006).
 */
export function ShareChips({ permissions }: { permissions: DoctorPermissions }) {
  const shared = sharedCategories(permissions);
  return (
    <View style={styles.chips}>
      <ShareChip text="Síntomas" on={shared.sintomas} />
      <ShareChip text="Actividades" on={shared.actividades} />
      <ShareChip text="Notas" on={shared.notas} />
    </View>
  );
}

function ShareChip({ text, on }: { text: string; on: boolean }) {
  const colors = useThemeColors();
  return (
    <View
      style={[
        styles.chip,
        on
          ? { backgroundColor: colors.secondaryContainer, borderColor: colors.secondaryContainer }
          : { backgroundColor: 'transparent', borderColor: colors.outline },
      ]}>
      <MaterialIcons
        name={on ? 'check' : 'visibility-off'}
        size={14}
        color={on ? colors.onSecondaryContainer : colors.onSurfaceVariant}
      />
      <ThemedText variant="labelSm" colorRole={on ? 'onSecondaryContainer' : 'onSurfaceVariant'}>
        {on ? text : `${text}: no compartidas`}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
});
