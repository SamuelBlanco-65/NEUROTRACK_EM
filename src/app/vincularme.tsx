import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { claimErrorCleared, claimPatientInviteCode } from '@/store/slices/caregiver-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

export default function VincularmeScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const [code, setCode] = useState('');
  const { claimStatus, claimError } = useAppSelector((state) => state.caregiver);

  useEffect(() => {
    return () => {
      dispatch(claimErrorCleared());
    };
  }, [dispatch]);

  function enviarSolicitud() {
    if (code.trim().length < 6) return;
    dispatch(claimPatientInviteCode(code.trim()));
  }

  if (claimStatus === 'listo') {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.successContainer} accessible accessibilityLiveRegion="polite">
            <View style={[styles.successIcon, { backgroundColor: colors.secondaryContainer }]}>
              <MaterialIcons name="check-circle" size={40} color={colors.primary} />
            </View>
            <ThemedText variant="headlineMd" style={styles.centerText}>
              Solicitud enviada
            </ThemedText>
            <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.centerText}>
              Le avisamos a la persona que acompañas. En cuanto acepte, verás su información aquí.
            </ThemedText>
            <Pressable
              onPress={() => router.replace('/(cuidador)/inicio')}
              accessibilityRole="button"
              accessibilityLabel="Ir a Inicio"
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              testID="vincularme-ir-a-inicio">
              <ThemedText variant="labelLg" colorRole="onPrimary">
                Ir a Inicio
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
            testID="vincularme-volver">
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <ThemedText variant="headlineSm" accessibilityRole="header">
            Vincularme
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.introContainer}>
            <View style={[styles.introIcon, { backgroundColor: colors.secondaryContainer }]}>
              <MaterialIcons name="handshake" size={32} color={colors.primary} />
            </View>
            <ThemedText variant="headlineMd" style={styles.centerText}>
              Ingresa el código de invitación
            </ThemedText>
            <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.centerText}>
              La persona que acompañas lo encuentra en su app, en Cuidadores &gt; Tu código de invitación.
            </ThemedText>
          </View>

          <TextField
            label="Código de 6 caracteres"
            icon="key"
            value={code}
            onChangeText={(value) => setCode(value.toUpperCase().slice(0, 6))}
            placeholder="N7K2QX"
            autoComplete="off"
            errorText={claimError?.message}
            testID="vincularme-codigo-input"
          />

          <View
            style={[styles.trustCard, { backgroundColor: colors.surfaceContainer }]}
            accessible
            accessibilityLabel="Privacidad y control activo: solo verás lo que esa persona autorice, y puede quitarte el acceso cuando quiera.">
            <MaterialIcons name="lock" size={20} color={colors.primary} />
            <View style={styles.trustTextGroup}>
              <ThemedText variant="labelSm" style={styles.bold}>
                Privacidad y control activo
              </ThemedText>
              <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
                Solo verás lo que esa persona autorice, y puede quitarte el acceso cuando quiera.
              </ThemedText>
            </View>
          </View>

          <Pressable
            onPress={enviarSolicitud}
            disabled={code.trim().length < 6 || claimStatus === 'enviando'}
            accessibilityRole="button"
            accessibilityLabel="Enviar solicitud"
            accessibilityState={{ disabled: code.trim().length < 6 || claimStatus === 'enviando' }}
            style={[
              styles.primaryButton,
              { backgroundColor: colors.primary, opacity: code.trim().length < 6 ? 0.5 : 1 },
            ]}
            testID="vincularme-enviar-solicitud">
            <ThemedText variant="labelLg" colorRole="onPrimary">
              {claimStatus === 'enviando' ? 'Enviando…' : 'Enviar solicitud'}
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
    gap: Spacing.lg,
  },
  introContainer: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingTop: Spacing.sm,
  },
  introIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {
    textAlign: 'center',
  },
  trustCard: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
  },
  trustTextGroup: {
    flex: 1,
    gap: 2,
  },
  bold: {
    fontWeight: 'bold',
  },
  primaryButton: {
    minHeight: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
