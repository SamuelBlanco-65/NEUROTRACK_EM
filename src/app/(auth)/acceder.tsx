import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Redirect, router } from 'expo-router';
import { useRef, useState, type RefObject } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField, type TextFieldInput } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { resendConfirmationEmail } from '@/features/auth/api';
import type { AuthError } from '@/features/auth/types';
import { isValidEmail } from '@/features/auth/validation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { authErrorCleared, confirmationNoticeCleared, login, register } from '@/store/slices/auth-slice';
import { profileCleared } from '@/store/slices/profile-slice';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

type Mode = 'login' | 'registro';

const MIN_PASSWORD_LENGTH = 8;

export default function AccederScreen() {
  const dispatch = useAppDispatch();
  const perfil = useAppSelector((state) => state.profile.selected);
  const authStatus = useAppSelector((state) => state.auth.status);
  const authError = useAppSelector((state) => state.auth.error);
  const pendingConfirmationEmail = useAppSelector((state) => state.auth.pendingConfirmationEmail);
  const colors = useThemeColors();

  const [mode, setMode] = useState<Mode>('login');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [camposInvalidos, setCamposInvalidos] = useState<Record<string, string>>({});
  const [acepto, setAcepto] = useState(false);
  const [resetNotice, setResetNotice] = useState<string | null>(null);
  const [resendSending, setResendSending] = useState(false);

  const nombreRef = useRef<TextFieldInput>(null);
  const correoRef = useRef<TextFieldInput>(null);
  const passwordRef = useRef<TextFieldInput>(null);
  const confirmRef = useRef<TextFieldInput>(null);

  if (!perfil) return <Redirect href="/" />;
  if (authStatus === 'authenticated') {
    return <Redirect href={perfil === 'paciente' ? '/(paciente)/inicio' : '/(cuidador)/inicio'} />;
  }

  const enviando = authStatus === 'authenticating';

  function cambiarModo(siguiente: Mode) {
    setMode(siguiente);
    setCamposInvalidos({});
    setResetNotice(null);
    dispatch(authErrorCleared());
    dispatch(confirmationNoticeCleared());
  }

  function validar(): boolean {
    const errores: Record<string, string> = {};
    if (mode === 'registro' && nombre.trim().length === 0) {
      errores.nombre = 'Cuéntanos cómo te llamas';
    }
    if (!isValidEmail(correo)) {
      errores.correo = 'Escribe un correo válido';
    }
    // Al crear la cuenta se exige una contraseña de 8+ (datos de salud); al iniciar sesión solo que no esté
    // vacía, para no dejar fuera a quien ya creó su cuenta con una más corta.
    if (mode === 'registro' ? password.length < MIN_PASSWORD_LENGTH : password.length === 0) {
      errores.password =
        mode === 'registro'
          ? `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`
          : 'Escribe tu contraseña';
    }
    if (mode === 'registro' && confirmPassword !== password) {
      errores.confirmPassword = 'Las contraseñas no coinciden';
    }
    if (mode === 'registro' && !acepto) {
      errores.acepto = 'Para crear tu cuenta necesitamos que aceptes los términos y la autorización de datos';
    }
    setCamposInvalidos(errores);

    // Foco al primer campo con error: el lector de pantalla salta ahí y lee su etiqueta y el aviso.
    const primero: [string, RefObject<TextFieldInput | null>][] = [
      ['nombre', nombreRef],
      ['correo', correoRef],
      ['password', passwordRef],
      ['confirmPassword', confirmRef],
    ];
    const conError = primero.find(([campo]) => errores[campo]);
    conError?.[1].current?.focus();

    return Object.keys(errores).length === 0;
  }

  async function reenviarConfirmacion() {
    const destino = pendingConfirmationEmail ?? correo;
    setResetNotice(null);
    if (!isValidEmail(destino)) {
      setCamposInvalidos({ correo: 'Escribe tu correo para reenviarte la confirmación' });
      correoRef.current?.focus();
      return;
    }
    setCamposInvalidos({});
    setResendSending(true);
    try {
      await resendConfirmationEmail(destino);
      setResetNotice(`Te reenviamos el correo de confirmación a ${destino.trim()}. Revisa también el spam.`);
    } catch (error) {
      setCamposInvalidos({ correo: (error as AuthError).message });
    } finally {
      setResendSending(false);
    }
  }

  function recuperarContrasena() {
    setResetNotice(null);
    dispatch(authErrorCleared());
    // La pantalla de recuperación llega con el correo ya escrito aquí, para no pedirlo dos veces.
    router.push({ pathname: '/recuperar', params: { correo: correo.trim() } });
  }

  async function enviar() {
    if (!validar()) return;
    if (mode === 'login') {
      dispatch(login({ email: correo, password }));
    } else {
      const result = await dispatch(register({ name: nombre, email: correo, password }));
      if (register.fulfilled.match(result) && result.payload === null) {
        setMode('login');
        setPassword('');
      }
    }
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
        <SafeAreaView style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.safeArea}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              dispatch(profileCleared());
              router.replace('/');
            }}
            accessibilityRole="button"
            accessibilityLabel="Volver a selección de perfil"
            hitSlop={8}
            style={[styles.backButton, { backgroundColor: colors.surfaceContainerHigh }]}>
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <View style={[styles.profileChip, { backgroundColor: colors.secondaryContainer }]}>
            <MaterialIcons name="person" size={20} color={colors.primaryContainer} />
            <ThemedText variant="labelSm" colorRole="onSecondaryContainer">
              Perfil: {perfil === 'paciente' ? 'Paciente' : 'Cuidador'}
            </ThemedText>
          </View>
        </View>

        <View style={styles.heading}>
          <ThemedText variant="labelSm" colorRole="secondary" style={styles.eyebrow}>
            NEUROTRACK EM
          </ThemedText>
          <ThemedText variant="headlineLg" accessibilityRole="header">
            {mode === 'login' ? 'Hola de nuevo' : 'Crea tu cuenta'}
          </ThemedText>
          <ThemedText variant="bodyMd" colorRole="secondary">
            {mode === 'login'
              ? 'Ingresa a tu espacio de bienestar y seguimiento.'
              : 'Comienza a registrar tu proceso día a día.'}
          </ThemedText>
        </View>

        {pendingConfirmationEmail ? (
          <View
            style={[styles.confirmBanner, { backgroundColor: colors.secondaryContainer }]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite">
            <MaterialIcons name="mark-email-unread" size={22} color={colors.primaryContainer} />
            <ThemedText variant="bodySm" colorRole="onSecondaryContainer" style={styles.confirmText}>
              Cuenta creada. Confirma {pendingConfirmationEmail} desde tu correo antes de iniciar sesión.
            </ThemedText>
          </View>
        ) : null}

        {resetNotice ? (
          <View
            style={[styles.confirmBanner, { backgroundColor: colors.secondaryContainer }]}
            accessibilityRole="alert"
            accessibilityLiveRegion="polite"
            testID="acceder-reset-aviso">
            <MaterialIcons name="mark-email-read" size={22} color={colors.primaryContainer} />
            <ThemedText variant="bodySm" colorRole="onSecondaryContainer" style={styles.confirmText}>
              {resetNotice}
            </ThemedText>
          </View>
        ) : null}

        <View
          accessibilityRole="tablist"
          accessibilityLabel="Tipo de acceso"
          style={[styles.tabs, { backgroundColor: colors.surfaceContainerHigh }]}>
          <Pressable
            onPress={() => cambiarModo('login')}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === 'login' }}
            style={[styles.tab, mode === 'login' && { backgroundColor: colors.primaryContainer }]}>
            <ThemedText
              variant="labelMd"
              colorRole={mode === 'login' ? 'onPrimary' : 'onSurfaceVariant'}>
              Iniciar sesión
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => cambiarModo('registro')}
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === 'registro' }}
            style={[styles.tab, mode === 'registro' && { backgroundColor: colors.primaryContainer }]}>
            <ThemedText
              variant="labelMd"
              colorRole={mode === 'registro' ? 'onPrimary' : 'onSurfaceVariant'}>
              Crear cuenta
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.form}>
          {mode === 'registro' ? (
            <TextField
              label="Nombre"
              icon="person"
              value={nombre}
              onChangeText={setNombre}
              placeholder="Tu nombre o cómo prefieres que te llamemos"
              autoComplete="name"
              textContentType="name"
              errorText={camposInvalidos.nombre}
              inputRef={nombreRef}
              testID="acceder-nombre"
            />
          ) : null}
          <TextField
            label="Correo electrónico"
            icon="mail"
            value={correo}
            onChangeText={setCorreo}
            placeholder={mode === 'login' ? 'ejemplo@correo.com' : 'tu@correo.com'}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            errorText={camposInvalidos.correo ?? authError?.message}
            inputRef={correoRef}
            testID="acceder-correo"
          />
          <TextField
            label="Contraseña"
            icon="lock"
            secureEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••••••"
            autoComplete={mode === 'login' ? 'password' : 'password-new'}
            textContentType={mode === 'login' ? 'password' : 'newPassword'}
            errorText={camposInvalidos.password}
            inputRef={passwordRef}
            testID="acceder-password"
          />
          {mode === 'registro' ? (
            <TextField
              label="Confirmar contraseña"
              icon="lock"
              secureEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="••••••••••••"
              autoComplete="password-new"
              textContentType="newPassword"
              errorText={camposInvalidos.confirmPassword}
              inputRef={confirmRef}
              testID="acceder-confirmar-password"
            />
          ) : null}

          {mode === 'registro' ? (
            <View style={styles.consent}>
              <Pressable
                onPress={() => {
                  setAcepto((v) => !v);
                  setCamposInvalidos((prev) => ({ ...prev, acepto: '' }));
                }}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: acepto }}
                accessibilityLabel="Acepto los términos de uso y autorizo el tratamiento de mis datos de salud"
                style={styles.consentRow}
                testID="acceder-consentimiento">
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: camposInvalidos.acepto ? colors.tertiary : colors.primary,
                      backgroundColor: acepto ? colors.primaryContainer : 'transparent',
                    },
                  ]}>
                  {acepto ? <MaterialIcons name="check" size={20} color={colors.onPrimary} /> : null}
                </View>
                <ThemedText variant="bodySm" style={styles.consentText}>
                  Acepto los términos de uso y autorizo el tratamiento de mis datos de salud para que la app funcione.
                </ThemedText>
              </Pressable>
              <View style={styles.consentLinks}>
                <Pressable
                  onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terminos' } })}
                  accessibilityRole="link"
                  accessibilityLabel="Leer los términos de uso"
                  style={styles.consentLink}
                  testID="acceder-ver-terminos">
                  <ThemedText variant="labelMd" colorRole="primary" style={styles.forgotText}>
                    Leer términos
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacidad' } })}
                  accessibilityRole="link"
                  accessibilityLabel="Leer la política de privacidad y datos de salud"
                  style={styles.consentLink}
                  testID="acceder-ver-privacidad">
                  <ThemedText variant="labelMd" colorRole="primary" style={styles.forgotText}>
                    Leer privacidad
                  </ThemedText>
                </Pressable>
              </View>
              {camposInvalidos.acepto ? (
                <View
                  style={[styles.consentError, { backgroundColor: colors.tertiaryFixed }]}
                  accessibilityRole="alert"
                  accessibilityLiveRegion="assertive">
                  <MaterialIcons name="error" size={20} color={colors.onTertiaryFixed} />
                  <ThemedText variant="labelMd" colorRole="onTertiaryFixed" style={styles.consentText}>
                    {camposInvalidos.acepto}
                  </ThemedText>
                </View>
              ) : null}
            </View>
          ) : null}

          {mode === 'login' && (pendingConfirmationEmail || authError?.authClass === 'correo-sin-confirmar') ? (
            <Pressable
              onPress={reenviarConfirmacion}
              disabled={resendSending}
              accessibilityRole="button"
              accessibilityLabel="Reenviar el correo de confirmación"
              accessibilityState={{ disabled: resendSending, busy: resendSending }}
              style={styles.forgotLink}
              testID="acceder-reenviar-confirmacion">
              <ThemedText variant="labelMd" colorRole="primary" style={styles.forgotText}>
                {resendSending ? 'Reenviando…' : 'Reenviar correo de confirmación'}
              </ThemedText>
            </Pressable>
          ) : null}

          {mode === 'login' ? (
            <Pressable
              onPress={recuperarContrasena}
              accessibilityRole="link"
              accessibilityLabel="¿Olvidaste tu contraseña?"
              accessibilityHint="Abre una pantalla para que te enviemos un correo y la cambies"
              style={styles.forgotLink}
              testID="acceder-olvide-password">
              <ThemedText variant="labelMd" colorRole="primary" style={styles.forgotText}>
                ¿Olvidaste tu contraseña?
              </ThemedText>
            </Pressable>
          ) : null}

          <Pressable
            onPress={enviar}
            disabled={enviando}
            accessibilityRole="button"
            accessibilityLabel={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            accessibilityState={{ disabled: enviando, busy: enviando }}
            style={[styles.submit, { backgroundColor: colors.primaryContainer, opacity: enviando ? 0.8 : 1 }]}
            testID="acceder-enviar">
            {enviando ? (
              <>
                <ActivityIndicator color={colors.onPrimary} />
                <ThemedText variant="labelLg" colorRole="onPrimary">
                  Enviando...
                </ThemedText>
              </>
            ) : (
              <>
                <ThemedText variant="labelLg" colorRole="onPrimary">
                  {mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </ThemedText>
                <MaterialIcons name="arrow-forward" size={22} color={colors.onPrimary} />
              </>
            )}
          </Pressable>
        </View>

        {mode === 'login' ? (
          <View style={[styles.tip, { backgroundColor: colors.tertiaryFixed }]}>
            <View style={[styles.tipIcon, { backgroundColor: colors.tertiaryFixedDim }]}>
              <MaterialIcons name="spa" size={22} color={colors.onTertiaryFixed} />
            </View>
            <View style={styles.tipText}>
              <ThemedText variant="labelSm" colorRole="onTertiaryFixed">
                Un paso a la vez
              </ThemedText>
              <ThemedText variant="bodySm" colorRole="onTertiaryFixedVariant">
                Tu evolución, tu proceso, tu camino.
              </ThemedText>
            </View>
          </View>
        ) : null}

        <View style={[styles.privacy, { backgroundColor: colors.surfaceContainerLow }]}>
          <MaterialIcons name="verified-user" size={22} color={colors.primaryContainer} />
          <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.privacyText}>
            Tus datos de salud se guardan cifrados y solo tú decides quién los ve.
          </ThemedText>
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.lg,
    gap: Spacing.lg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: MinTouchSize,
    height: MinTouchSize,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
  },
  heading: {
    gap: Spacing.xs,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  tabs: {
    flexDirection: 'row',
    padding: Spacing.xs / 2,
    borderRadius: Radius.full,
  },
  tab: {
    flex: 1,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    gap: Spacing.lg,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    minHeight: MinTouchSize,
    justifyContent: 'center',
    marginTop: -Spacing.sm,
  },
  forgotText: {
    textDecorationLine: 'underline',
  },
  consent: {
    gap: Spacing.xs,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchSize,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consentText: {
    flex: 1,
  },
  consentLinks: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginLeft: 28 + Spacing.sm,
  },
  consentLink: {
    minHeight: MinTouchSize,
    justifyContent: 'center',
  },
  consentError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default / 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  submit: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchSize + 8,
    borderRadius: Radius.full,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.default,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipText: {
    flex: 1,
    gap: 2,
  },
  privacy: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.default,
  },
  privacyText: {
    flex: 1,
  },
  confirmBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.default,
  },
  confirmText: {
    flex: 1,
  },
});
