import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AboutView } from '@/features/about/about-view';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

/** «¿Qué es Neurotrack EM?». Ruta pública (se abre antes de iniciar sesión); la UI vive en features/about. */
export default function AcercaScreen() {
  const colors = useThemeColors();

  function cerrar() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.topBar}>
          <Pressable
            onPress={cerrar}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            style={[styles.back, { backgroundColor: colors.surfaceContainerHigh }]}
            testID="acerca-atras">
            <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
          </Pressable>
          <ThemedText variant="labelLg" accessibilityRole="header">
            Sobre Neurotrack EM
          </ThemedText>
        </View>

        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <AboutView />
          <Pressable
            onPress={cerrar}
            accessibilityRole="button"
            accessibilityLabel="Entendido, volver"
            style={[styles.button, { backgroundColor: colors.primary }]}
            testID="acerca-entendido">
            <ThemedText variant="labelLg" colorRole="onPrimary">
              Entendido
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  back: {
    width: MinTouchSize,
    height: MinTouchSize,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
    gap: Spacing.lg,
  },
  button: {
    minHeight: MinTouchSize + 8,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
