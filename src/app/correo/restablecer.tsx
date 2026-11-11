import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLinkingURL } from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField, type TextFieldInput } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { changePasswordFromLink, linkFlowReset, logout, openAuthLink } from '@/store/slices/auth-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

const MIN_PASSWORD_LENGTH = 8;

/** Destino del enlace «Recuperar contraseña» del correo: abre la sesión de recuperación y pide la contraseña nueva. */
export default function RestablecerScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const url = useLinkingURL();
  const { status, message } = useAppSelector((state) => state.auth.linkFlow);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errores, setErrores] = useState<Record<string, string>>({});
  const passwordRef = useRef<TextFieldInput>(null);
  const confirmRef = useRef<TextFieldInput>(null);

  useEffect(() => {
    if (url) dispatch(openAuthLink(url));
  }, [dispatch, url]);

  function irAlInicio() {
    dispatch(linkFlowReset());
    router.replace('/');
  }

  async function cancelar() {
    // La sesión de recuperación ya está abierta en este teléfono: si se abandona el cambio, se cierra.
    await dispatch(logout());
    irAlInicio();
  }

  function guardar() {
    const siguiente: Record<string, string> = {};
    if (password.length < MIN_PASSWORD_LENGTH) {
      siguiente.password = `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`;
    }
    if (confirm !== password) {
      siguiente.confirm = 'Las contraseñas no coinciden';
    }
    setErrores(siguiente);
    if (siguiente.password) {
      passwordRef.current?.focus();
      return;
    }
    if (siguiente.confirm) {
      confirmRef.current?.focus();
      return;
    }
    dispatch(changePasswordFromLink(password));
  }

  const guardando = status === 'guardando';

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {status === 'hecho' ? (
              <>
                <Icono name="check-circle" fondo={colors.secondaryContainer} color={colors.primary} />
                <ThemedText variant="headlineLg" accessibilityRole="header" style={styles.center}>
                  Contraseña actualizada
                </ThemedText>
                <ThemedText
                  variant="bodyMd"
                  colorRole="onSurfaceVariant"
                  style={styles.center}
                  accessibilityLiveRegion="polite">
                  Por seguridad cerramos tus sesiones abiertas. Inicia sesión con tu contraseña nueva.
                </ThemedText>
                <Boton etiqueta="Iniciar sesión" onPress={irAlInicio} testID="restablecer-iniciar-sesion" />
              </>
            ) : status === 'error' ? (
              <>
                <Icono name="link-off" fondo={colors.tertiaryFixed} color={colors.onTertiaryFixed} />
                <ThemedText variant="headlineLg" accessibilityRole="header" style={styles.center}>
                  No pudimos abrir el enlace
                </ThemedText>
                <ThemedText
                  variant="bodyMd"
                  colorRole="onSurfaceVariant"
                  style={styles.center}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive"
                  testID="restablecer-error">
                  {message}
                </ThemedText>
                <Boton etiqueta="Volver al inicio" onPress={irAlInicio} testID="restablecer-volver" />
              </>
            ) : status === 'listo' || guardando ? (
              <>
                <Icono name="lock-reset" fondo={colors.secondaryContainer} color={colors.primary} />
                <ThemedText variant="headlineLg" accessibilityRole="header" style={styles.center}>
                  Elige tu contraseña nueva
                </ThemedText>
                <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.center}>
                  Usa al menos {MIN_PASSWORD_LENGTH} caracteres.
                </ThemedText>

                <View style={styles.form}>
                  <TextField
                    label="Contraseña nueva"
                    icon="lock"
                    secureEntry
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••••••"
                    autoComplete="password-new"
                    textContentType="newPassword"
                    errorText={errores.password}
                    inputRef={passwordRef}
                    testID="restablecer-password"
                  />
                  <TextField
                    label="Confirmar contraseña"
                    icon="lock"
                    secureEntry
                    value={confirm}
                    onChangeText={setConfirm}
                    placeholder="••••••••••••"
                    autoComplete="password-new"
                    textContentType="newPassword"
                    errorText={errores.confirm}
                    inputRef={confirmRef}
                    testID="restablecer-confirmar"
                  />

                  {message ? (
                    <View
                      style={[styles.banner, { backgroundColor: colors.tertiaryFixed }]}
                      accessibilityRole="alert"
                      accessibilityLiveRegion="assertive"
                      testID="restablecer-error-guardar">
                      <MaterialIcons name="error" size={20} color={colors.onTertiaryFixed} />
                      <ThemedText variant="labelMd" colorRole="onTertiaryFixed" style={styles.flex}>
                        {message}
                      </ThemedText>
                    </View>
                  ) : null}

                  <Boton
                    etiqueta={guardando ? 'Guardando…' : 'Guardar contraseña'}
                    onPress={guardar}
                    ocupado={guardando}
                    testID="restablecer-guardar"
                  />
                  <Pressable
                    onPress={cancelar}
                    disabled={guardando}
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar y cerrar la sesión de recuperación"
                    style={styles.cancel}
                    testID="restablecer-cancelar">
                    <ThemedText variant="labelLg" colorRole="primary">
                      Cancelar
                    </ThemedText>
                  </Pressable>
                </View>
              </>
            ) : (
              <View style={styles.center} accessible accessibilityLiveRegion="polite" accessibilityState={{ busy: true }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <ThemedText variant="headlineSm" style={styles.center}>
                  Verificando tu enlace…
                </ThemedText>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

function Icono({ name, fondo, color }: { name: keyof typeof MaterialIcons.glyphMap; fondo: string; color: string }) {
  return (
    <View style={[styles.icon, { backgroundColor: fondo }]} accessibilityElementsHidden importantForAccessibility="no">
      <MaterialIcons name={name} size={36} color={color} />
    </View>
  );
}

function Boton({
  etiqueta,
  onPress,
  ocupado,
  testID,
}: {
  etiqueta: string;
  onPress: () => void;
  ocupado?: boolean;
  testID: string;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={ocupado}
      accessibilityRole="button"
      accessibilityLabel={etiqueta}
      accessibilityState={{ disabled: ocupado, busy: ocupado }}
      style={[styles.button, { backgroundColor: colors.primaryContainer, opacity: ocupado ? 0.8 : 1 }]}
      testID={testID}>
      {ocupado ? <ActivityIndicator color={colors.onPrimary} /> : null}
      <ThemedText variant="labelLg" colorRole="onPrimary">
        {etiqueta}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: Spacing.md,
    paddingHorizontal: Spacing.margin,
    paddingVertical: Spacing.xl,
  },
  center: { textAlign: 'center', alignItems: 'center', gap: Spacing.md },
  icon: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { gap: Spacing.lg },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchSize + 8,
    borderRadius: Radius.full,
  },
  cancel: {
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
