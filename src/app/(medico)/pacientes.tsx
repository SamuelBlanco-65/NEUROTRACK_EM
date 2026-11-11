import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AccountButton } from '@/components/account-button';
import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CountBadge, InitialsAvatar, ShareChips } from '@/features/doctor/components';
import { describeExpiry, formatShortDate, isLinkActive, isLinkExpired, sharedCategories } from '@/features/doctor/logic';
import type { DoctorLink } from '@/features/doctor/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMyPatients } from '@/store/slices/doctor-slice';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const HOW_IT_WORKS = [
  'Tu paciente abre su app en Mi cuenta › Mi médico y te da su código.',
  'Lo escribes en «Vincular paciente».',
  'Tu paciente acepta y elige qué ves y por cuánto tiempo.',
];

/** Médico: lista de pacientes que lo autorizaron (solo lectura). */
export default function MedicoPacientesScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myPatients, doctorStatus, doctorError } = useAppSelector((state) => state.doctor);

  useEffect(() => {
    dispatch(fetchMyPatients());
  }, [dispatch]);

  const activeCount = myPatients.filter((link) => isLinkActive(link)).length;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View style={styles.header}>
          <ThemedText variant="headlineSm" accessibilityRole="header" style={styles.flex}>
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
            <View style={[styles.privacyCard, { backgroundColor: colors.surfaceContainerLow }]}>
              <MaterialIcons name="shield" size={22} color={colors.primary} />
              <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.flex}>
                Solo ves lo que cada paciente autorizó, en modo de lectura.
              </ThemedText>
            </View>

            {myPatients.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                <View style={styles.sectionHeader}>
                  <ThemedText variant="headlineSm" accessibilityRole="header" style={styles.flex}>
                    Pacientes
                  </ThemedText>
                  <CountBadge text={`${activeCount} ${activeCount === 1 ? 'activo' : 'activos'}`} />
                </View>
                {myPatients.map((link) => (
                  <PatientCard key={link.id} link={link} />
                ))}
              </>
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

function EmptyState() {
  const colors = useThemeColors();
  return (
    <View style={styles.emptyWrap} testID="medico-pacientes-vacio">
      <View accessible accessibilityLiveRegion="polite" style={styles.emptyText}>
        <ThemedText variant="headlineSm" accessibilityRole="header" style={styles.centerText}>
          Aún no tienes pacientes vinculados
        </ThemedText>
        <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.centerText}>
          Pídele a tu paciente el código de 8 caracteres de su app. Él o ella decide qué compartir contigo.
        </ThemedText>
      </View>
      <ThemedText variant="labelLg" accessibilityRole="header">
        ¿Cómo funciona?
      </ThemedText>
      {HOW_IT_WORKS.map((step, index) => (
        <View key={step} style={[styles.step, { backgroundColor: colors.surfaceContainerLow }]}>
          <View style={[styles.stepNumber, { backgroundColor: colors.secondaryContainer }]}>
            <ThemedText variant="labelMd" colorRole="onSecondaryContainer">
              {index + 1}
            </ThemedText>
          </View>
          <ThemedText variant="bodyMd" style={styles.flex}>
            {step}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

function PatientCard({ link }: { link: DoctorLink }) {
  const colors = useThemeColors();
  const name = link.patientName ?? 'Paciente';

  if (link.status === 'solicitado') {
    return (
      <View
        style={[styles.card, styles.cardColumn, { backgroundColor: colors.surfaceContainerLow }]}
        accessible
        accessibilityLabel="Solicitud pendiente de autorización. Esperando que el paciente acepte. Podrá elegir qué información compartir contigo."
        testID={`medico-paciente-pendiente-${link.id}`}>
        <View style={styles.cardRow}>
          <InitialsAvatar name={link.patientName} />
          <View style={styles.cardText}>
            <ThemedText variant="labelLg">{link.patientName ?? 'Solicitud enviada'}</ThemedText>
            <View style={[styles.statusChip, { backgroundColor: colors.tertiaryFixed }]}>
              <MaterialIcons name="hourglass-empty" size={14} color={colors.onTertiaryFixed} />
              <ThemedText variant="labelSm" colorRole="onTertiaryFixed">
                Pendiente de autorización
              </ThemedText>
            </View>
          </View>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="info-outline" size={18} color={colors.onSurfaceVariant} />
          <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.flex}>
            Esperando que el paciente acepte. Podrá elegir qué información compartir contigo.
          </ThemedText>
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
      accessibilityLabel={`${name}. ${expired ? 'Acceso vencido.' : `Comparte: ${sharedText || 'nada'}.`} ${
        expired ? '' : describeExpiry(link.expiresAt)
      }`}
      accessibilityHint="Abre el resumen del paciente"
      style={[styles.card, styles.cardColumn, { backgroundColor: colors.surfaceContainerLowest }]}
      testID={`medico-paciente-${link.id}`}>
      <View style={styles.cardRow}>
        <InitialsAvatar name={link.patientName} />
        <ThemedText variant="labelLg" style={styles.flex}>
          {name}
        </ThemedText>
        <MaterialIcons name="chevron-right" size={24} color={colors.outline} />
      </View>
      <ShareChips permissions={link} />
      <View style={[styles.metaBox, { backgroundColor: colors.surfaceContainerLow }]}>
        <MaterialIcons name={expired ? 'event-busy' : 'event'} size={18} color={colors.onSurfaceVariant} />
        <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.flex}>
          {expired ? `Acceso vencido el ${formatShortDate(link.expiresAt ?? '')}` : describeExpiry(link.expiresAt)}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  centerText: { textAlign: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
  privacyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  stateWrap: { flex: 1, justifyContent: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.margin },
  emptyWrap: { gap: Spacing.sm, paddingTop: Spacing.md },
  emptyText: { gap: Spacing.xs, paddingBottom: Spacing.sm },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    minHeight: 72,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  cardColumn: { gap: Spacing.sm },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  cardText: { flex: 1, gap: Spacing.xs, alignItems: 'flex-start' },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  metaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.default,
    padding: Spacing.sm,
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
