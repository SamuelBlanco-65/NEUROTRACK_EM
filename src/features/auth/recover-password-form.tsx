import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { TextField, type TextFieldInput } from '@/components/text-field';
import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';
import { requestPasswordReset } from './api';
import type { AuthError } from './types';
import { isValidEmail } from './validation';

type Step = 'form' | 'sending' | 'sent';

/** Cuerpo de la pantalla «Recuperar contraseña»: pide el correo, envía el enlace y confirma. */
export function RecoverPasswordForm({ initialEmail }: { initialEmail: string }) {
  const colors = useThemeColors();
  const [email, setEmail] = useState(initialEmail);
  const [step, setStep] = useState<Step>('form');
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [sendError, setSendError] = useState<string | null>(null);
  const emailRef = useRef<TextFieldInput>(null);

  function volverAlAcceso() {
    if (router.canGoBack()) router.back();
    else router.replace('/(auth)/acceder');
  }

  async function enviar() {
    setSendError(null);
    if (!isValidEmail(email)) {
      setFieldError('Escribe un correo válido');
      emailRef.current?.focus();
      return;
    }
    setFieldError(undefined);
    setStep('sending');
    try {
      await requestPasswordReset(email);
      setStep('sent');
    } catch (error) {
      setSendError((error as AuthError).message);
      setStep('form');
    }
  }

  if (step === 'sent') {
    return (
      <View style={styles.content}>
        <View
          style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}
          accessibilityElementsHidden
          importantForAccessibility="no">
          <MaterialIcons name="mark-email-read" size={36} color={colors.primary} />
        </View>
        <ThemedText variant="headlineLg" accessibilityRole="header" style={styles.center}>
          Revisa tu correo
        </ThemedText>
        <ThemedText
          variant="bodyMd"
          colorRole="onSurfaceVariant"
          style={styles.center}
          accessibilityLiveRegion="polite"
          testID="recuperar-enviado">
          Si {email.trim()} tiene una cuenta, te enviamos un enlace para elegir una contraseña nueva. Revisa también el
          spam.
        </ThemedText>
        <ThemedText variant="bodySm" colorRole="onSurfaceVariant" style={styles.center}>
          Puedes abrir el enlace desde cualquier dispositivo.
        </ThemedText>

        <Pressable
          onPress={volverAlAcceso}
          accessibilityRole="button"
          accessibilityLabel="Volver a iniciar sesión"
          style={[styles.button, { backgroundColor: colors.primaryContainer }]}
          testID="recuperar-volver">
          <ThemedText variant="labelLg" colorRole="onPrimary">
            Volver a iniciar sesión
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setStep('form')}
          accessibilityRole="button"
          accessibilityLabel="Enviar el correo de nuevo"
          style={styles.secondary}
          testID="recuperar-reenviar">
          <ThemedText variant="labelLg" colorRole="primary">
            Enviar de nuevo
          </ThemedText>
        </Pressable>
      </View>
    );
  }

  const enviando = step === 'sending';

  return (
    <View style={styles.content}>
      <View
        style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}
        accessibilityElementsHidden
        importantForAccessibility="no">
        <MaterialIcons name="lock-reset" size={36} color={colors.primary} />
      </View>
      <ThemedText variant="headlineLg" accessibilityRole="header" style={styles.center}>
        Recupera tu contraseña
      </ThemedText>
      <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.center}>
        Escribe tu correo y te enviamos un enlace para elegir una nueva.
      </ThemedText>

      <TextField
        label="Correo electrónico"
        icon="mail"
        value={email}
        onChangeText={setEmail}
        placeholder="ejemplo@correo.com"
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        errorText={fieldError}
        inputRef={emailRef}
        testID="recuperar-correo"
      />

      {sendError ? (
        <View
          style={[styles.banner, { backgroundColor: colors.tertiaryFixed }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="assertive"
          testID="recuperar-error">
          <MaterialIcons name="error" size={20} color={colors.onTertiaryFixed} />
          <ThemedText variant="labelMd" colorRole="onTertiaryFixed" style={styles.flex}>
            {sendError}
          </ThemedText>
        </View>
      ) : null}

      <Pressable
        onPress={enviar}
        disabled={enviando}
        accessibilityRole="button"
        accessibilityLabel="Enviar correo de recuperación"
        accessibilityState={{ disabled: enviando, busy: enviando }}
        style={[styles.button, { backgroundColor: colors.primaryContainer, opacity: enviando ? 0.8 : 1 }]}
        testID="recuperar-enviar">
        {enviando ? <ActivityIndicator color={colors.onPrimary} /> : null}
        <ThemedText variant="labelLg" colorRole="onPrimary">
          {enviando ? 'Enviando…' : 'Enviar correo'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: Spacing.md },
  center: { textAlign: 'center' },
  icon: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    marginTop: Spacing.sm,
  },
  secondary: {
    minHeight: MinTouchSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
