import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Share, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScreenState } from '@/components/screen-state';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import type { CaregiverLink, CaregiverPermissions } from '@/features/caregiver/types';
import {
  fetchPatientCaregiverData,
  regenerateMyInvite,
  respondToIncomingRequest,
  revokeMyCaregiver,
} from '@/store/slices/caregiver-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const DEFAULT_PERMISSIONS: CaregiverPermissions = {
  shareSintomas: true,
  shareProgreso: true,
  shareRecordatorios: true,
};

export default function PermisosScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const { myInvite, incomingRequests, myCaregivers, patientStatus, patientError } = useAppSelector(
    (state) => state.caregiver
  );
  const [draftPermissions, setDraftPermissions] = useState<Record<string, CaregiverPermissions>>({});

  useEffect(() => {
    dispatch(fetchPatientCaregiverData());
  }, [dispatch]);

  function permissionsFor(linkId: string): CaregiverPermissions {
    return draftPermissions[linkId] ?? DEFAULT_PERMISSIONS;
  }

  function toggle(linkId: string, key: keyof CaregiverPermissions) {
    const current = permissionsFor(linkId);
    setDraftPermissions((prev) => ({ ...prev, [linkId]: { ...current, [key]: !current[key] } }));
  }

  function compartirCodigo() {
    if (!myInvite) return;
    Share.share({
      message: `Para acompañarme en Neurotrack EM, ingresa este código en "Vincularme": ${myInvite.inviteCode}`,
    });
  }

  function confirmarRechazo(link: CaregiverLink) {
    Alert.alert('Rechazar solicitud', `¿Rechazar la solicitud de ${link.caregiverName ?? link.caregiverEmail ?? 'este cuidador'}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Rechazar',
        style: 'destructive',
        onPress: () => dispatch(respondToIncomingRequest({ linkId: link.id, accept: false, permissions: permissionsFor(link.id) })),
      },
    ]);
  }

  function confirmarRevocar(link: CaregiverLink) {
    Alert.alert(
      'Quitar acceso',
      `¿Quitarle el acceso a ${link.caregiverName ?? link.caregiverEmail ?? 'este cuidador'}? Podrás volver a invitarlo cuando quieras.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Quitar acceso', style: 'destructive', onPress: () => dispatch(revokeMyCaregiver(link.id)) },
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
            testID="permisos-volver">
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Cuidadores
          </ThemedText>
        </View>

        {patientStatus === 'error' ? (
          <ScreenState
            kind="error"
            title="No pudimos cargar esta sección"
            description={patientError?.message ?? 'Inténtalo de nuevo'}
            testID="permisos-error"
          />
        ) : patientStatus === 'cargando' || patientStatus === 'idle' ? (
          <ScreenState kind="cargando" title="Cargando…" testID="permisos-cargando" />
        ) : (
          <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
            <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
              Comparte este código con quien te acompaña. Solo verá lo que tú autorices, y puedes quitarle el acceso cuando quieras.
            </ThemedText>

            {myInvite ? (
              <View style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
                <ThemedText variant="labelSm" colorRole="onSurfaceVariant">
                  Tu código de invitación
                </ThemedText>
                <ThemedText variant="headlineLg" style={styles.code} testID="permisos-codigo">
                  {myInvite.inviteCode}
                </ThemedText>
                <View style={styles.codeActions}>
                  <Pressable
                    onPress={compartirCodigo}
                    accessibilityRole="button"
                    accessibilityLabel="Compartir código"
                    style={[styles.pillButton, { backgroundColor: colors.primaryContainer }]}
                    testID="permisos-compartir-codigo">
                    <MaterialIcons name="share" size={20} color={colors.onPrimary} />
                    <ThemedText variant="labelMd" colorRole="onPrimary">
                      Compartir
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => dispatch(regenerateMyInvite())}
                    accessibilityRole="button"
                    accessibilityLabel="Generar un código nuevo"
                    style={[styles.pillButton, { backgroundColor: colors.surfaceContainer }]}
                    testID="permisos-regenerar-codigo">
                    <MaterialIcons name="refresh" size={20} color={colors.onSurface} />
                    <ThemedText variant="labelMd">Generar otro</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : null}

            {incomingRequests.length > 0 ? (
              <View style={styles.section}>
                <ThemedText variant="headlineSm">Solicitudes nuevas</ThemedText>
                {incomingRequests.map((link) => {
                  const permissions = permissionsFor(link.id);
                  return (
                    <View key={link.id} style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
                      <ThemedText variant="labelLg">{link.caregiverName ?? link.caregiverEmail ?? 'Alguien'} quiere acompañarte</ThemedText>
                      <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                        Elige qué puede ver. Puedes cambiarlo después.
                      </ThemedText>
                      <PermissionRow
                        label="Mis síntomas"
                        value={permissions.shareSintomas}
                        onChange={() => toggle(link.id, 'shareSintomas')}
                        testID={`permisos-toggle-sintomas-${link.id}`}
                      />
                      <PermissionRow
                        label="Mi progreso"
                        value={permissions.shareProgreso}
                        onChange={() => toggle(link.id, 'shareProgreso')}
                        testID={`permisos-toggle-progreso-${link.id}`}
                      />
                      <PermissionRow
                        label="Mis recordatorios"
                        value={permissions.shareRecordatorios}
                        onChange={() => toggle(link.id, 'shareRecordatorios')}
                        testID={`permisos-toggle-recordatorios-${link.id}`}
                      />
                      <View style={styles.requestActions}>
                        <Pressable
                          onPress={() => dispatch(respondToIncomingRequest({ linkId: link.id, accept: true, permissions }))}
                          accessibilityRole="button"
                          accessibilityLabel="Aceptar y compartir"
                          style={[styles.primaryButton, { backgroundColor: colors.primaryContainer }]}
                          testID={`permisos-aceptar-${link.id}`}>
                          <MaterialIcons name="check" size={20} color={colors.onPrimary} />
                          <ThemedText variant="labelLg" colorRole="onPrimary">
                            Aceptar y compartir
                          </ThemedText>
                        </Pressable>
                        <Pressable
                          onPress={() => confirmarRechazo(link)}
                          accessibilityRole="button"
                          accessibilityLabel="Rechazar solicitud"
                          style={styles.textButton}
                          testID={`permisos-rechazar-${link.id}`}>
                          <ThemedText variant="labelMd" colorRole="error">
                            Rechazar
                          </ThemedText>
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : null}

            <View style={styles.section}>
              <ThemedText variant="headlineSm">Con acceso</ThemedText>
              {myCaregivers.length === 0 ? (
                <ScreenState
                  kind="vacio"
                  title="Aún no le has dado acceso a nadie"
                  description="Comparte tu código con la persona que te acompaña."
                  testID="permisos-sin-cuidadores"
                />
              ) : (
                myCaregivers.map((link) => (
                  <View key={link.id} style={[styles.card, { backgroundColor: colors.surfaceContainerLowest }]}>
                    <ThemedText variant="labelLg">{link.caregiverName ?? link.caregiverEmail ?? 'Cuidador'}</ThemedText>
                    <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                      Ve: {[link.shareSintomas && 'síntomas', link.shareProgreso && 'progreso', link.shareRecordatorios && 'recordatorios']
                        .filter(Boolean)
                        .join(', ') || 'nada por ahora'}
                    </ThemedText>
                    <Pressable
                      onPress={() => confirmarRevocar(link)}
                      accessibilityRole="button"
                      accessibilityLabel={`Quitar acceso a ${link.caregiverName ?? 'este cuidador'}`}
                      style={styles.textButton}
                      testID={`permisos-revocar-${link.id}`}>
                      <ThemedText variant="labelMd" colorRole="error">
                        Quitar acceso
                      </ThemedText>
                    </Pressable>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

function PermissionRow({
  label,
  value,
  onChange,
  testID,
}: {
  label: string;
  value: boolean;
  onChange: () => void;
  testID: string;
}) {
  const colors = useThemeColors();
  return (
    <View style={styles.permissionRow}>
      <ThemedText variant="bodyMd">{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceContainerHigh, true: colors.primaryContainer }}
        thumbColor={colors.surfaceContainerLowest}
        accessibilityLabel={label}
        testID={testID}
      />
    </View>
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
    paddingBottom: Spacing.xl * 2,
    gap: Spacing.lg,
  },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  code: {
    letterSpacing: 6,
  },
  codeActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  pillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
  },
  section: {
    gap: Spacing.sm,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: MinTouchSize,
  },
  requestActions: {
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
  },
  textButton: {
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
