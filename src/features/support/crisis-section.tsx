import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';
import type { CrisisContact } from './types';

export function CrisisSection({ contacts, lead }: { contacts: CrisisContact[]; lead: string }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.container, { backgroundColor: colors.tertiaryFixed }]}>
      <View style={styles.headerRow}>
        <MaterialIcons name="volunteer-activism" size={24} color={colors.onTertiaryFixedVariant} />
        <ThemedText variant="headlineSm" colorRole="onTertiaryFixedVariant" accessibilityRole="header">
          ¿Necesitas hablar con alguien?
        </ThemedText>
      </View>
      <ThemedText variant="bodySm" colorRole="onTertiaryFixedVariant">
        {lead}
      </ThemedText>

      {contacts.map((contact) => {
        const buttonColor = contact.variant === 'error' ? colors.error : colors.primaryContainer;
        const onButtonColor = contact.variant === 'error' ? colors.onError : colors.onPrimary;
        return (
          <View key={contact.id} style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardTitleGroup}>
                <View
                  style={[
                    styles.contactIcon,
                    { backgroundColor: contact.variant === 'error' ? colors.errorContainer : colors.secondaryContainer },
                  ]}>
                  <MaterialIcons
                    name={contact.variant === 'error' ? 'shield' : 'call'}
                    size={18}
                    color={contact.variant === 'error' ? colors.onErrorContainer : colors.onSecondaryContainer}
                  />
                </View>
                <ThemedText variant="labelLg">{contact.title}</ThemedText>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.secondaryContainer }]}>
                <ThemedText variant="labelSm" colorRole="onSecondaryContainer">
                  {contact.badge}
                </ThemedText>
              </View>
            </View>
            <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
              {contact.description}
            </ThemedText>
            <Pressable
              onPress={() => Linking.openURL(`tel:${contact.phone}`)}
              accessibilityRole="button"
              accessibilityLabel={`Llamar al ${contact.phone}`}
              style={[styles.callButton, { backgroundColor: buttonColor }]}
              testID={`apoyo-llamar-${contact.phone}`}>
              <MaterialIcons name="call" size={20} color={onButtonColor} />
              <ThemedText variant="labelLg" colorRole={contact.variant === 'error' ? 'onError' : 'onPrimary'}>
                Llamar al {contact.phone}
              </ThemedText>
            </Pressable>
          </View>
        );
      })}

      <ThemedText variant="bodySm" colorRole="onTertiaryFixedVariant" style={styles.footnote}>
        Si no estás en Bogotá, consulta la línea de atención de tu ciudad.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  card: {
    borderRadius: Radius.default,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  cardTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 1,
  },
  contactIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
  },
  callButton: {
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  footnote: {
    textAlign: 'center',
  },
});
