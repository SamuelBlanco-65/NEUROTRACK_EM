import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountButton } from '@/components/account-button';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { describeExpiry, formatShortDate, isLinkExpired, sharedCategories } from '@/features/doctor/logic';
import type { DoctorLink } from '@/features/doctor/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyPatients } from '@/store/slices/doctor-slice';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

function initialsOf(name: string | null): string {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'P';
  return parts
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

/** Médico: lista de pacientes que lo autorizaron (solo lectura). */
export default function MedicoPacientesScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myPatients, doctorStatus, doctorError } = useAppSelector((state) => state.doctor);

  useEffect(() => {
    dispatch(fetchMyPatients());
  }, [dispatch]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Mis pacientes
          </ThemedText>
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/accesibilidad')}
              accessibilityRole="button"
              accessibilityLabel="Accesibilidad: ajustar apariencia y lectura"
              hitSlop={8}
              style={[styles.iconButton, { backgroundColor: colors.surfaceContainerHigh }]}
              testID="medico-accesibilidad">
              <MaterialIcons name="accessibility-new" size={18} color={colors.onSurface} />
            </Pressable>
            <AccountButton testID="medico-cuenta" />
          </View>
        </View>

        {doctorStatus === 'error' ? (
          <View style={styles.stateWrap}>
            <ScreenState
              kind="error"
              title="No pudimos cargar tus pacientes"
              description={doctorError?.message ?? 'Revisa tu conexión.'}
              testID="medico-pacientes-error"
            />
            <Pressable
              onPress={() => dispatch(fetchMyPatients())}
              accessibilityRole="button"
              accessibilityLabel="Reintentar"
              style={[styles.secondaryButton, { backgroundColor: colors.surfaceContainer }]}
              testID="medico-pacientes-reintentar">
              <MaterialIcons name="refresh" size={20} color={colors.onSurface} />
              <ThemedText variant="labelLg">Reintentar</ThemedText>
            </Pressable>
          </View>
        ) : (doctorStatus === 'cargando' || doctorStatus === 'idle') && myPatients.length === 0 ? (
          <ScreenState kind="cargando" title="Cargando pacientes…" testID="medico-pacientes-cargando" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
              Solo ves lo que cada paciente autorizó.
            </ThemedText>

            {myPatients.length === 0 ? (
              <View style={styles.stateBox}>
                <ScreenState
                  kind="vacio"
                  title="Aún no tienes pacientes vinculados"
                  description="Pídele a tu paciente el código de 8 caracteres que aparece en su app, en «Mi médico»."
                  testID="medico-pacientes-vacio"
                />
              </View>
            ) : (
              myPatients.map((link) => <PatientCard key={link.id} link={link} />)
            )}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <Pressable
            onPress={() => router.push('/vincular-paciente')}
            accessibilityRole="button"
            accessibilityLabel="Vincular paciente"
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            testID="medico-vincular-paciente">
            <MaterialIcons name="person-add" size={22} color={colors.onPrimary} />
            <ThemedText variant="labelLg" colorRole="onPrimary">
              Vincular paciente
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function PatientCard({ link }: { link: DoctorLink }) {
  const colors = useThemeColors();
  const name = link.patientName ?? 'Paciente';

  if (link.status === 'solicitado') {
    return (
      <View
        style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]}
        accessible
        accessibilityLabel={`${name}. Esperando que el paciente acepte tu solicitud.`}
        testID={`medico-paciente-pendiente-${link.id}`}>
        <Avatar initials={initialsOf(link.patientName)} />
        <View style={styles.cardText}>
          <ThemedText variant="labelLg">{name}</ThemedText>
          <View style={styles.infoRow}>
            <MaterialIcons name="hourglass-empty" size={18} color={colors.onSurfaceVariant} />
            <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.flex}>
              Esperando que el paciente acepte tu solicitud
            </ThemedText>
          </View>
        </View>
      </View>
    );
  }

  const shared = sharedCategories(link);
  const expired = isLinkExpired(link);
  const sharedText = [shared.sintomas && 'síntomas', shared.actividades && 'actividades', shared.notas && 'notas']
    .filter(Boolean)
    .join(', ');

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/paciente/[id]', params: { id: link.id } })}
      accessibilityRole="button"
      accessibilityLabel={`${name}. ${expired ? 'Acceso vencido.' : `Comparte: ${sharedText || 'nada'}.`}`}
      accessibilityHint="Abre el resumen del paciente"
      style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}
      testID={`medico-paciente-${link.id}`}>
      <Avatar initials={initialsOf(link.patientName)} />
      <View style={styles.cardText}>
        <ThemedText variant="labelLg">{name}</ThemedText>
        <View style={styles.chips}>
          <Chip icon="check" text="Síntomas" on={shared.sintomas} />
          <Chip icon="check" text="Actividades" on={shared.actividades} />
          <Chip icon="check" text="Notas" on={shared.notas} />
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name={expired ? 'event-busy' : 'event'} size={18} color={colors.onSurfaceVariant} />
          <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.flex}>
            {expired ? `Acceso vencido el ${formatShortDate(link.expiresAt ?? '')}` : describeExpiry(link.expiresAt)}
          </ThemedText>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
    </Pressable>
  );
}

function Avatar({ initials }: { initials: string }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.avatar, { backgroundColor: colors.primary }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <ThemedText variant="labelLg" colorRole="onPrimary" maxFontSizeMultiplier={1.2}>
        {initials}
      </ThemedText>
    </View>
  );
}

/** Compartido = relleno con ✓; no compartido = contorno con ojo tachado y «no compartidas» (nunca solo color). */
function Chip({ icon, text, on }: { icon: keyof typeof MaterialIcons.glyphMap; text: string; on: boolean }) {
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
        name={on ? icon : 'visibility-off'}
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
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  stateBox: { minHeight: 200 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  stateWrap: { flex: 1, justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.margin },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 72,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  cardText: { flex: 1, gap: Spacing.xs },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
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
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  footer: { paddingHorizontal: Spacing.margin, paddingVertical: Spacing.sm },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 56,
    borderRadius: Radius.full,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
  },
});
