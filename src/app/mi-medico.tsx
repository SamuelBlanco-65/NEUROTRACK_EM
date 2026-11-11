import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DEFAULT_DURATION, DURATION_OPTIONS } from '@/features/doctor/constants';
import { describeExpiry, formatShortDate, isLinkExpired, sharedCategories } from '@/features/doctor/logic';
import type { DoctorAccessDuration, DoctorLink, DoctorPermissions } from '@/features/doctor/types';
import {
  fetchPatientDoctorData,
  regenerateMyDoctorInvite,
  respondToIncomingDoctorRequest,
  revokeMyDoctor,
} from '@/store/slices/doctor-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

// Las notas libres son lo más íntimo: apagadas por defecto, las enciende el paciente.
const DEFAULT_PERMISSIONS: DoctorPermissions = {
  shareSintomas: true,
  shareNotas: false,
  shareProgreso: true,
};

type Draft = { permissions: DoctorPermissions; duration: DoctorAccessDuration };

/** Paciente: comparte un resumen con su médico tratante, eligiendo qué ve y por cuánto tiempo. */
export default function MiMedicoScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myInvite, incomingRequests, myDoctors, patientStatus, patientError, respondingToId } = useAppSelector(
    (state) => state.doctor
  );
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});

  useEffect(() => {
    dispatch(fetchPatientDoctorData());
  }, [dispatch]);

  function draftFor(linkId: string): Draft {
    return drafts[linkId] ?? { permissions: DEFAULT_PERMISSIONS, duration: DEFAULT_DURATION };
  }

  function togglePermission(linkId: string, key: keyof DoctorPermissions) {
    const current = draftFor(linkId);
    setDrafts((prev) => ({
      ...prev,
      [linkId]: { ...current, permissions: { ...current.permissions, [key]: !current.permissions[key] } },
    }));
  }

  function chooseDuration(linkId: string, duration: DoctorAccessDuration) {
    const current = draftFor(linkId);
    setDrafts((prev) => ({ ...prev, [linkId]: { ...current, duration } }));
  }

  function compartirCodigo() {
    if (!myInvite) return;
    Share.share({
      message: `Para compartirte mi resumen en Neurotrack EM, ingresa este código en "Vincular paciente": ${myInvite.inviteCode}`,
    });
  }

  function confirmarRechazo(link: DoctorLink) {
    Alert.alert('Rechazar solicitud', `¿Rechazar la solicitud de ${link.doctorName ?? link.doctorEmail ?? 'este médico'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: () =>
          dispatch(
            respondToIncomingDoctorRequest({
              linkId: link.id,
              accept: false,
              permissions: draftFor(link.id).permissions,
              duration: draftFor(link.id).duration,
            })
          ),
      },
    ]);
  }

  function confirmarRevocar(link: DoctorLink) {
    const name = link.doctorName ?? link.doctorEmail ?? 'este médico';
    Alert.alert(
      `¿Quitar el acceso a ${name}?`,
      'Dejará de ver tu resumen de inmediato. Puedes volver a compartirlo con un código nuevo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Quitar acceso', style: 'destructive', onPress: () => dispatch(revokeMyDoctor(link.id)) },
      ]
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            style={styles.backButton}
            testID="mi-medico-volver">
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Mi médico
          </ThemedText>
        </View>

        {patientStatus === 'error' ? (
          <ScreenState
            kind="error"
            title="No pudimos cargar esta sección"
            description={patientError?.message ?? 'Inténtalo de nuevo'}
            testID="mi-medico-error"
          />
        ) : patientStatus === 'cargando' || patientStatus === 'idle' ? (
          <ScreenState kind="cargando" title="Cargando…" testID="mi-medico-cargando" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
              Comparte un resumen con tu médico tratante. Tú decides qué ve y por cuánto tiempo, y puedes quitarle el acceso cuando
              quieras.
            </ThemedText>

            {patientError ? (
              <View
                style={[styles.errorBanner, { backgroundColor: colors.tertiaryFixed }]}
                accessibilityRole="alert"
                accessibilityLiveRegion="assertive"
                testID="mi-medico-aviso-error">
                <MaterialIcons name="error" size={20} color={colors.onTertiaryFixed} />
                <ThemedText variant="labelMd" colorRole="onTertiaryFixed" style={styles.flex}>
                  {patientError.message}
                </ThemedText>
              </View>
            ) : null}

            {myInvite ? (
              <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
                <ThemedText variant="labelSm" colorRole="onSurfaceVariant">
                  Tu código para el médico
                </ThemedText>
                <View accessible accessibilityLiveRegion="polite" accessibilityLabel={`Tu código: ${myInvite.inviteCode.split('').join(' ')}`}>
                  <ThemedText
                    variant="headlineMd"
                    style={styles.code}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    testID="mi-medico-codigo">
                    {myInvite.inviteCode}
                  </ThemedText>
                </View>
                <ThemedText variant="bodySm" colorRole="secondary">
                  Dáselo solo a tu médico. Sirve una vez y vale 7 días.
                </ThemedText>
                <View style={styles.codeActions}>
                  <Pressable
                    onPress={compartirCodigo}
                    accessibilityRole="button"
                    accessibilityLabel="Compartir código"
                    style={[styles.pillButton, { backgroundColor: colors.primary }]}
                    testID="mi-medico-compartir-codigo">
                    <MaterialIcons name="share" size={20} color={colors.onPrimary} />
                    <ThemedText variant="labelMd" colorRole="onPrimary">
                      Compartir
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => dispatch(regenerateMyDoctorInvite())}
                    accessibilityRole="button"
                    accessibilityLabel="Generar un código nuevo"
                    style={[styles.pillButton, { backgroundColor: colors.surfaceContainer }]}
                    testID="mi-medico-regenerar-codigo">
                    <MaterialIcons name="refresh" size={20} color={colors.onSurface} />
                    <ThemedText variant="labelMd">Generar otro</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {incomingRequests.length > 0 ? (
              <View style={styles.section}>
                <ThemedText variant="headlineSm" accessibilityRole="header">
                  Solicitudes
                </ThemedText>
                {incomingRequests.map((link) => {
                  const draft = draftFor(link.id);
                  const busy = respondingToId === link.id;
                  return (
                    <View key={link.id} style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
                      <ThemedText variant="labelLg">
                        {link.doctorName ?? link.doctorEmail ?? 'Un médico'} quiere ver tu resumen
                      </ThemedText>
                      {link.doctorEmail && link.doctorName ? (
                        <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                          {link.doctorEmail}
                        </ThemedText>
                      ) : null}
                      <ThemedText variant="bodySm" colorRole="secondary">
                        {link.professionalId
                          ? `Registro profesional: ${link.professionalId}. Lo declaró el propio médico: Neurotrack EM no lo verifica.`
                          : 'No indicó registro profesional. Neurotrack EM no verifica la identidad del médico.'}
                      </ThemedText>

                      <ThemedText variant="labelMd" style={styles.groupLabel}>
                        Qué puede ver
                      </ThemedText>
                      <PermissionRow
                        icon="monitor-heart"
                        label="Síntomas"
                        description="Días y tipos de síntomas, con su intensidad."
                        value={draft.permissions.shareSintomas}
                        onChange={() => togglePermission(link.id, 'shareSintomas')}
                        testID={`mi-medico-toggle-sintomas-${link.id}`}
                      />
                      <PermissionRow
                        icon="show-chart"
                        label="Actividades"
                        description="Sesiones y nivel en cada área."
                        value={draft.permissions.shareProgreso}
                        onChange={() => togglePermission(link.id, 'shareProgreso')}
                        testID={`mi-medico-toggle-progreso-${link.id}`}
                      />
                      <PermissionRow
                        icon="edit-note"
                        label="Mis notas"
                        description={
                          draft.permissions.shareSintomas
                            ? 'Lo que escribes al registrar un síntoma.'
                            : 'Requiere compartir síntomas.'
                        }
                        value={draft.permissions.shareNotas && draft.permissions.shareSintomas}
                        disabled={!draft.permissions.shareSintomas}
                        onChange={() => togglePermission(link.id, 'shareNotas')}
                        testID={`mi-medico-toggle-notas-${link.id}`}
                      />

                      <ThemedText variant="labelMd" style={styles.groupLabel}>
                        Acceso por
                      </ThemedText>
                      <View accessibilityRole="radiogroup" accessibilityLabel="Duración del acceso" style={styles.chips}>
                        {DURATION_OPTIONS.map((option) => {
                          const selected = draft.duration === option.id;
                          return (
                            <Pressable
                              key={option.id}
                              onPress={() => chooseDuration(link.id, option.id)}
                              accessibilityRole="radio"
                              accessibilityLabel={option.label}
                              accessibilityState={{ checked: selected }}
                              style={[
                                styles.chip,
                                {
                                  backgroundColor: selected ? colors.secondaryContainer : colors.surfaceContainerLow,
                                  borderColor: selected ? colors.primary : 'transparent',
                                },
                              ]}
                              testID={`mi-medico-duracion-${option.id}-${link.id}`}>
                              {selected ? <MaterialIcons name="check" size={18} color={colors.primary} /> : null}
                              <ThemedText variant="labelMd" colorRole={selected ? 'onSecondaryContainer' : 'onSurface'}>
                                {option.label}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>

                      <View style={[styles.note, { backgroundColor: colors.surfaceContainerLow }]}>
                        <MaterialIcons name="shield" size={18} color={colors.primary} />
                        <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.flex}>
                          Tu médico solo puede leer. Neurotrack EM no diagnostica: él ve registros, no conclusiones.
                        </ThemedText>
                      </View>

                      <Pressable
                        onPress={() =>
                          dispatch(
                            respondToIncomingDoctorRequest({
                              linkId: link.id,
                              accept: true,
                              permissions: {
                                ...draft.permissions,
                                shareNotas: draft.permissions.shareNotas && draft.permissions.shareSintomas,
                              },
                              duration: draft.duration,
                            })
                          )
                        }
                        disabled={busy}
                        accessibilityRole="button"
                        accessibilityLabel={`Aceptar y compartir con ${link.doctorName ?? link.doctorEmail ?? 'este médico'}`}
                        accessibilityState={{ disabled: busy, busy }}
                        style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: busy ? 0.6 : 1 }]}
                        testID={`mi-medico-aceptar-${link.id}`}>
                        <MaterialIcons name="check" size={20} color={colors.onPrimary} />
                        <ThemedText variant="labelLg" colorRole="onPrimary">
                          {busy ? 'Guardando…' : 'Aceptar y compartir'}
                        </ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={() => confirmarRechazo(link)}
                        disabled={busy}
                        accessibilityRole="button"
                        accessibilityLabel={`Rechazar solicitud de ${link.doctorName ?? link.doctorEmail ?? 'este médico'}`}
                        accessibilityState={{ disabled: busy }}
                        style={[styles.textButton, { opacity: busy ? 0.6 : 1 }]}
                        testID={`mi-medico-rechazar-${link.id}`}>
                        <ThemedText variant="labelMd" colorRole="error">
                          Rechazar
                        </ThemedText>
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.section}>
              <ThemedText variant="headlineSm" accessibilityRole="header">
                Con acceso
              </ThemedText>
              {myDoctors.length === 0 ? (
                <View style={styles.stateBox}>
                  <ScreenState
                    kind="vacio"
                    title="Todavía no has compartido tu resumen con un médico"
                    description="Comparte tu código con tu médico tratante."
                    testID="mi-medico-sin-medicos"
                  />
                </View>
              ) : (
                myDoctors.map((link) => {
                  const shared = sharedCategories(link);
                  const expired = isLinkExpired(link);
                  return (
                    <View key={link.id} style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
                      <ThemedText variant="labelLg">{link.doctorName ?? link.doctorEmail ?? 'Médico'}</ThemedText>
                      <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                        Ve:{' '}
                        {[shared.sintomas && 'síntomas', shared.actividades && 'actividades', shared.notas && 'tus notas']
                          .filter(Boolean)
                          .join(', ') || 'nada por ahora'}
                      </ThemedText>
                      <View style={styles.infoRow}>
                        <MaterialIcons name={expired ? 'event-busy' : 'event'} size={18} color={colors.onSurfaceVariant} />
                        <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.flex}>
                          {expired ? `Venció el ${formatShortDate(link.expiresAt ?? '')}` : describeExpiry(link.expiresAt)}
                        </ThemedText>
                      </View>
                      <View style={styles.infoRow}>
                        <MaterialIcons name="visibility" size={18} color={colors.onSurfaceVariant} />
                        <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.flex}>
                          {link.lastViewedAt
                            ? `Última vez que lo revisó: ${formatShortDate(link.lastViewedAt)}`
                            : 'Todavía no ha revisado tu resumen'}
                        </ThemedText>
                      </View>
                      <Pressable
                        onPress={() => confirmarRevocar(link)}
                        accessibilityRole="button"
                        accessibilityLabel={`Quitar acceso a ${link.doctorName ?? link.doctorEmail ?? 'este médico'}`}
                        style={styles.textButton}
                        testID={`mi-medico-revocar-${link.id}`}>
                        <ThemedText variant="labelMd" colorRole="error">
                          Quitar acceso
                        </ThemedText>
                      </Pressable>
                    </View>
                  );
                })
              )}
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="info-outline" size={16} color={colors.onSurfaceVariant} />
              <ThemedText variant="bodySm" colorRole="secondary" style={styles.flex}>
                Neurotrack EM no diagnostica ni reemplaza a tu equipo médico.
              </ThemedText>
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function PermissionRow({
  icon,
  label,
  description,
  value,
  disabled,
  onChange,
  testID,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  onChange: () => void;
  testID: string;
}) {
  const colors = useThemeColors();
  // Toda la fila es el interruptor (área táctil completa y un solo foco para TalkBack). El Switch
  // visual no recibe toques ni se anuncia aparte; «Sí/No» y la posición del Switch evitan depender del color.
  return (
    <Pressable
      onPress={onChange}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityHint={description}
      accessibilityState={{ checked: value, disabled: Boolean(disabled) }}
      style={[styles.permissionRow, { opacity: disabled ? 0.5 : 1 }]}
      testID={testID}>
      <View style={[styles.permissionIcon, { backgroundColor: colors.surfaceContainerLow }]}>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={styles.permissionTextGroup}>
        <ThemedText variant="bodyMd">{label}</ThemedText>
        <ThemedText variant="bodySm" colorRole="secondary">
          {description}
        </ThemedText>
      </View>
      <View
        style={styles.permissionSwitchGroup}
        pointerEvents="none"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants">
        <ThemedText variant="labelSm" colorRole={value ? 'primary' : 'secondary'}>
          {value ? 'Sí' : 'No'}
        </ThemedText>
        <Switch
          value={value}
          disabled={disabled}
          trackColor={{ false: colors.outline, true: colors.primary }}
          thumbColor={value ? colors.onPrimary : colors.surfaceContainerLowest}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  stateBox: { minHeight: 160 },
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
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.lg,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
  },
  code: { letterSpacing: 6 },
  codeActions: { flexDirection: 'row', gap: Spacing.sm },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
  },
  section: { gap: Spacing.sm },
  groupLabel: { marginTop: Spacing.xs },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchSize,
  },
  permissionIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionTextGroup: { flex: 1, gap: 1 },
  permissionSwitchGroup: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    borderWidth: 2,
    paddingHorizontal: Spacing.md,
  },
  note: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
  },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: 56,
    borderRadius: Radius.full,
  },
  textButton: {
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
