import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLinkingURL } from 'expo-linking';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { bootstrapSession, linkFlowReset, openAuthLink } from '@/store/slices/auth-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

/** Destino del enlace «Confirmar correo» del correo de bienvenida. */
export default function ConfirmarCorreoScreen() {
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const url = useLinkingURL();
  const { status, message } = useAppSelector((state) => state.auth.linkFlow);

  useEffect(() => {
    if (url) dispatch(openAuthLink(url));
  }, [dispatch, url]);

  async function continuar() {
    // El canje del enlace dejó una sesión abierta: se carga en el estado de la app y se entra.
    await dispatch(bootstrapSession());
    dispatch(linkFlowReset());
    router.replace('/');
  }

  function irAlInicio() {
    dispatch(linkFlowReset());
    router.replace('/');
  }

  const exito = status === 'listo';
  const fallo = status === 'error';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {exito || fallo ? (
            <View
              style={[
                styles.icon,
                { backgroundColor: exito ? colors.secondaryContainer : colors.tertiaryFixed },
              ]}
              accessibilityElementsHidden
              importantForAccessibility="no">
              <MaterialIcons
                name={exito ? 'mark-email-read' : 'link-off'}
                size={36}
                color={exito ? colors.primary : colors.onTertiaryFixed}
              />
            </View>
          ) : (
            <ActivityIndicator size="large" color={colors.primary} />
          )}

          <ThemedText variant="headlineLg" accessibilityRole="header" style={styles.text}>
            {exito ? '¡Correo confirmado!' : fallo ? 'No pudimos abrir el enlace' : 'Confirmando tu correo…'}
          </ThemedText>

          {exito ? (
            <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.text} accessibilityLiveRegion="polite">
              Tu cuenta ya está lista. Entra para empezar.
            </ThemedText>
          ) : null}

          {fallo ? (
            <ThemedText
              variant="bodyMd"
              colorRole="onSurfaceVariant"
              style={styles.text}
              accessibilityRole="alert"
              accessibilityLiveRegion="assertive"
              testID="confirmar-error">
              {message} Si ya confirmaste tu correo, solo inicia sesión.
            </ThemedText>
          ) : null}

          {exito || fallo ? (
            <Pressable
              onPress={exito ? continuar : irAlInicio}
              accessibilityRole="button"
              accessibilityLabel={exito ? 'Continuar' : 'Ir a iniciar sesión'}
              style={[styles.button, { backgroundColor: colors.primary }]}
              testID={exito ? 'confirmar-continuar' : 'confirmar-ir-acceso'}>
              <ThemedText variant="labelLg" colorRole="onPrimary">
                {exito ? 'Continuar' : 'Ir a iniciar sesión'}
              </ThemedText>
            </Pressable>
          ) : null}
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: Spacing.md,
    paddingHorizontal: Spacing.margin,
  },
  icon: {
    alignSelf: 'center',
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { textAlign: 'center' },
  button: {
    minHeight: MinTouchSize + 8,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
});
