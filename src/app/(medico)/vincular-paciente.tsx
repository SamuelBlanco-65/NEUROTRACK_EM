import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { claimErrorCleared, claimPatientCode } from '@/store/slices/doctor-slice';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const CODE_LENGTH = 8;

/** Médico: ingresa el código que le dio su paciente. El paciente decide qué ve y por cuánto tiempo. */
export default function VincularPacienteScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const [code, setCode] = useState('');
  const [professionalId, setProfessionalId] = useState('');
  const { claimStatus, claimError } = useAppSelector((state) => state.doctor);

  useEffect(() => {
    return () => {
      dispatch(claimErrorCleared());
    };
  }, [dispatch]);

  const incomplete = code.trim().length < CODE_LENGTH;
  const sending = claimStatus === 'enviando';

  function enviarSolicitud() {
    if (incomplete || sending) return;
    dispatch(claimPatientCode({ code: code.trim(), professionalId }));
  }

  if (claimStatus === 'listo') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.successContainer}>
            <View style={[styles.successIcon, { backgroundColor: colors.secondaryContainer }]}>
              <MaterialIcons name="check-circle" size={40} color={colors.primary} />
            </View>
            <View accessible accessibilityLiveRegion="polite" style={styles.successText}>
              <ThemedText variant="headlineMd" accessibilityRole="header" style={styles.centerText}>
                Solicitud enviada
              </ThemedText>
              <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.centerText}>
                Cuando tu paciente la acepte, aparecerá en «Mis pacientes».
              </ThemedText>
            </View>
            <Pressable
              onPress={() => router.replace('/pacientes')}
              accessibilityRole="button"
              accessibilityLabel="Ir a mis pacientes"
              style={[styles.primaryButton, styles.fullWidth, { backgroundColor: colors.primary }]}
              testID="vincular-paciente-ir-a-pacientes">
              <ThemedText variant="labelLg" colorRole="onPrimary">
                Ir a mis pacientes
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </ThemedView>
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
            testID="vincular-paciente-volver">
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Vincular paciente
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <ThemedText variant="bodyMd" colorRole="onSurfaceVariant">
            Escribe el código que te dio tu paciente. Él o ella decide qué ves y por cuánto tiempo.
          </ThemedText>

          <TextField
            label="Código del paciente"
            icon="key"
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, CODE_LENGTH))}
            placeholder="K7P2QX4M"
            autoComplete="off"
            errorText={claimError?.message}
            testID="vincular-paciente-codigo"
          />

          <View style={styles.optionalField}>
            <TextField
              label="Registro profesional (opcional)"
              icon="badge"
              value={professionalId}
              onChangeText={(value) => setProfessionalId(value.slice(0, 40))}
              placeholder="Ej. número de RETHUS"
              autoComplete="off"
              testID="vincular-paciente-registro"
            />
            <ThemedText variant="bodySm" colorRole="secondary">
              Lo verá tu paciente. Neurotrack EM no lo verifica.
            </ThemedText>
          </View>

          <View
            style={[styles.trustCard, { backgroundColor: colors.surfaceContainer }]}
            accessible
            accessibilityLabel="Tu acceso será de solo lectura. Puedes perderlo si el paciente lo retira o si vence.">
            <MaterialIcons name="lock" size={20} color={colors.primary} />
            <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.flex}>
              Tu acceso será de solo lectura. Puedes perderlo si el paciente lo retira o si vence.
            </ThemedText>
          </View>

          <Pressable
            onPress={enviarSolicitud}
            disabled={incomplete || sending}
            accessibilityRole="button"
            accessibilityLabel="Enviar solicitud"
            accessibilityHint={incomplete ? `Escribe los ${CODE_LENGTH} caracteres del código` : undefined}
            accessibilityState={{ disabled: incomplete || sending, busy: sending }}
            style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: incomplete ? 0.5 : 1 }]}
            testID="vincular-paciente-enviar">
            <ThemedText variant="labelLg" colorRole="onPrimary">
              {sending ? 'Enviando…' : 'Enviar solicitud'}
            </ThemedText>
          </Pressable>
          {incomplete ? (
            <ThemedText variant="bodySm" colorRole="secondary" style={styles.centerText}>
              Escribe los {CODE_LENGTH} caracteres del código para continuar.
            </ThemedText>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
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
    gap: Spacing.lg,
  },
  optionalField: { gap: Spacing.xs },
  trustCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: { alignSelf: 'stretch' },
  successText: { gap: Spacing.xs, alignSelf: 'stretch' },
  centerText: { textAlign: 'center' },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  successIcon: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
});
