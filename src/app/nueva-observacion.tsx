import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { ObservationCategory } from '@/features/caregiver/types';
import { addObservation } from '@/store/slices/caregiver-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const CATEGORIES: { id: ObservationCategory; label: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { id: 'animo', label: 'Ánimo', icon: 'sentiment-satisfied' },
  { id: 'movilidad', label: 'Movilidad', icon: 'directions-walk' },
  { id: 'fatiga', label: 'Fatiga', icon: 'battery-alert' },
  { id: 'medicacion', label: 'Medicación', icon: 'medication' },
  { id: 'otro', label: 'Otro', icon: 'edit-note' },
];

export default function NuevaObservacionScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myLinksAsCaregiver, savingObservation } = useAppSelector((state) => state.caregiver);
  const [category, setCategory] = useState<ObservationCategory>('animo');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeLink = useMemo(
    () => myLinksAsCaregiver.find((link) => link.status === 'aceptado') ?? null,
    [myLinksAsCaregiver]
  );

  async function guardar() {
    if (!activeLink || note.trim().length === 0) return;
    setErrorMessage(null);
    const result = await dispatch(
      addObservation({ linkId: activeLink.id, patientId: activeLink.patientId, category, note: note.trim() })
    );
    if (addObservation.fulfilled.match(result)) {
      router.back();
    } else {
      // La nota se queda en pantalla: no se pierde lo que escribió.
      setErrorMessage(result.payload?.message ?? 'No pudimos guardar la observación. Inténtalo de nuevo.');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Cerrar"
            hitSlop={8}
            style={styles.backButton}
            testID="nueva-observacion-cerrar">
            <MaterialIcons name="close" size={24} color={colors.onSurface} />
          </Pressable>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Nueva observación
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <ThemedText variant="labelSm" colorRole="onSurfaceVariant">
            CATEGORÍA
          </ThemedText>
          <View style={styles.chipRow} accessibilityRole="radiogroup" accessibilityLabel="Categoría de observación">
            {CATEGORIES.map((item) => {
              const selected = item.id === category;
              return (
                <Pressable
                  key={item.id}
                  onPress={() => setCategory(item.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selected }}
                  accessibilityLabel={item.label}
                  style={[
                    styles.chip,
                    { backgroundColor: selected ? colors.primaryContainer : colors.surfaceContainerLow },
                  ]}
                  testID={`nueva-observacion-categoria-${item.id}`}>
                  <MaterialIcons name={item.icon} size={20} color={selected ? colors.onPrimary : colors.onSurfaceVariant} />
                  <ThemedText variant="labelMd" colorRole={selected ? 'onPrimary' : 'onSurfaceVariant'}>
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>

          <ThemedText variant="labelSm" colorRole="onSurfaceVariant" style={styles.fieldLabel}>
            ¿QUÉ NOTASTE?
          </ThemedText>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Describe lo que observaste (comportamiento, equilibrio, energía…)"
            placeholderTextColor={colors.outline}
            multiline
            numberOfLines={4}
            maxLength={1000}
            style={[styles.textArea, { backgroundColor: colors.surfaceContainerLow, color: colors.onSurface }]}
            accessibilityLabel="Descripción de la observación"
            testID="nueva-observacion-texto"
          />

          <View style={[styles.privacyBanner, { backgroundColor: colors.tertiaryFixed }]}>
            <MaterialIcons name="lock" size={20} color={colors.onTertiaryFixedVariant} />
            <ThemedText variant="bodySm" colorRole="onTertiaryFixedVariant" style={styles.privacyText}>
              Esta nota queda en tu bitácora privada de cuidador.
            </ThemedText>
          </View>

          {errorMessage ? (
            <View
              style={[styles.privacyBanner, { backgroundColor: colors.tertiaryFixed }]}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              testID="nueva-observacion-error">
              <MaterialIcons name="error" size={20} color={colors.onTertiaryFixed} />
              <ThemedText variant="labelMd" colorRole="onTertiaryFixed" style={styles.privacyText}>
                {errorMessage}
              </ThemedText>
            </View>
          ) : null}

          <Pressable
            onPress={guardar}
            disabled={note.trim().length === 0 || savingObservation}
            accessibilityRole="button"
            accessibilityLabel="Guardar observación"
            accessibilityState={{ disabled: note.trim().length === 0 || savingObservation }}
            style={[
              styles.saveButton,
              { backgroundColor: colors.primaryContainer, opacity: note.trim().length === 0 ? 0.5 : 1 },
            ]}
            testID="nueva-observacion-guardar">
            <MaterialIcons name="check-circle" size={22} color={colors.onPrimary} />
            <ThemedText variant="labelLg" colorRole="onPrimary">
              {savingObservation ? 'Guardando…' : 'Guardar observación'}
            </ThemedText>
          </Pressable>
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
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  chip: {
    minHeight: MinTouchSize,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  fieldLabel: {
    marginTop: Spacing.sm,
  },
  textArea: {
    borderRadius: Radius.default,
    padding: Spacing.sm,
    minHeight: 96,
    textAlignVertical: 'top',
  },
  privacyBanner: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  privacyText: {
    flex: 1,
  },
  saveButton: {
    minHeight: 56,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
});
