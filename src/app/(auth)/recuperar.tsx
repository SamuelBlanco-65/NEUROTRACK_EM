import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedView } from '@/components/themed-view';
import { RecoverPasswordForm } from '@/features/auth/recover-password-form';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

/** Ruta «¿Olvidaste tu contraseña?». Solo resuelve navegación; la UI vive en la feature de auth. */
export default function RecuperarScreen() {
  const colors = useThemeColors();
  const { correo } = useLocalSearchParams<{ correo?: string }>();

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={styles.flex}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/(auth)/acceder'))}
              accessibilityRole="button"
              accessibilityLabel="Volver a iniciar sesión"
              hitSlop={8}
              style={[styles.back, { backgroundColor: colors.surfaceContainerHigh }]}
              testID="recuperar-atras">
              <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
            </Pressable>
            <View style={styles.body}>
              <RecoverPasswordForm initialEmail={typeof correo === 'string' ? correo : ''} />
            </View>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  back: {
    width: MinTouchSize,
    height: MinTouchSize,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, justifyContent: 'center' },
});
