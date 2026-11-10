import { Redirect } from 'expo-router';
import { useState } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image, Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ProfileOption } from '@/components/profile-option';
import { profileSelected } from '@/store/slices/profile-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';

export default function SeleccionDePerfilScreen() {
  const dispatch = useAppDispatch();
  const selected = useAppSelector((state) => state.profile.selected);
  const authStatus = useAppSelector((state) => state.auth.status);
  const colors = useThemeColors();
  const [infoVisible, setInfoVisible] = useState(false);

  if (selected && authStatus !== 'authenticated') return <Redirect href="/(auth)/acceder" />;
  if (selected === 'paciente') return <Redirect href="/(paciente)/inicio" />;
  if (selected === 'cuidador') return <Redirect href="/(cuidador)/inicio" />;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.brandRow}>
          <View style={styles.brandLabel}>
            <View style={[styles.brandDot, { backgroundColor: colors.primary }]} />
            <ThemedText variant="labelSm" colorRole="secondary" style={styles.brandText}>
              NEUROTRACK EM
            </ThemedText>
          </View>
          <View style={[styles.stepPill, { backgroundColor: colors.surfaceContainer }]}>
            <ThemedText variant="labelSm" colorRole="onSurfaceVariant">
              Paso 1 de 2
            </ThemedText>
          </View>
        </View>

        <View style={[styles.hero, { backgroundColor: colors.surfaceContainerLow }]}>
          <Image
            accessibilityIgnoresInvertColors
            source={require('@/assets/images/ilustracion-acompanamiento.png')}
            style={styles.heroImage}
            resizeMode="contain"
            accessibilityLabel="Ilustración de acompañamiento de Neurotrack EM"
          />
        </View>

        <View style={styles.heading}>
          <ThemedText variant="headlineLg" accessibilityRole="header">
            Te acompañamos en tu camino
          </ThemedText>
          <ThemedText variant="bodyMd" colorRole="secondary">
            ¿Cómo vas a usar la app?
          </ThemedText>
        </View>

        <View accessibilityRole="radiogroup" accessibilityLabel="Selección de perfil" style={styles.options}>
          <ProfileOption
            title="Soy paciente"
            description="Registra cómo te sientes y haz tus actividades"
            selected={selected === 'paciente'}
            onPress={() => dispatch(profileSelected('paciente'))}
            icon="person"
            iconBackgroundColor={colors.secondaryContainer}
            iconColor={colors.primary}
            testID="profile-option-paciente"
          />
          <ProfileOption
            title="Acompaño a alguien"
            description="Familiar, pareja o cuidador"
            selected={selected === 'cuidador'}
            onPress={() => dispatch(profileSelected('cuidador'))}
            icon="groups"
            iconBackgroundColor={colors.tertiaryFixed}
            iconColor={colors.tertiary}
            testID="profile-option-cuidador"
          />
        </View>

        <View style={styles.noteRow}>
          <MaterialIcons name="spa" size={18} color={colors.primary} />
          <ThemedText variant="bodySm" colorRole="secondary" style={styles.noteText}>
            Puedes ajustar esta preferencia en cualquier momento
          </ThemedText>
        </View>

        <Pressable
          onPress={() => setInfoVisible(true)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="¿Qué es Neurotrack EM?"
          style={styles.infoLink}>
          <ThemedText variant="bodyMd" colorRole="secondary" style={styles.infoLinkText}>
            ¿Qué es Neurotrack EM?
          </ThemedText>
          <MaterialIcons name="help-outline" size={20} color={colors.secondary} />
        </Pressable>
      </SafeAreaView>

      <Modal visible={infoVisible} transparent animationType="slide" onRequestClose={() => setInfoVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surfaceContainerLowest }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.surfaceContainerHighest }]} />
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <MaterialIcons name="favorite-border" size={26} color={colors.primary} />
                <ThemedText variant="headlineSm" accessibilityRole="header">
                  Sobre Neurotrack EM
                </ThemedText>
              </View>
              <Pressable
                onPress={() => setInfoVisible(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Cerrar ventana"
                style={styles.modalClose}>
                <MaterialIcons name="close" size={24} color={colors.secondary} />
              </Pressable>
            </View>
            <ThemedText variant="bodyMd" colorRole="secondary" style={styles.modalBody}>
              Neurotrack EM es un espacio sereno y accesible diseñado especialmente para
              acompañarte en tu día a día con Esclerosis Múltiple, facilitando el registro de
              síntomas, nivel de energía y rutinas sin fricción.
            </ThemedText>
            <Pressable
              onPress={() => setInfoVisible(false)}
              accessibilityRole="button"
              accessibilityLabel="Entendido"
              style={[styles.modalButton, { backgroundColor: colors.primary }]}>
              <ThemedText variant="labelLg" style={{ color: colors.onPrimary }}>
                Entendido
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.sm,
    gap: Spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  brandDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  brandText: {
    letterSpacing: 1,
  },
  stepPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  hero: {
    width: '100%',
    height: 170,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    width: 140,
    height: 140,
  },
  heading: {
    gap: Spacing.xs,
  },
  options: {
    gap: Spacing.md,
  },
  noteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  noteText: {
    textAlign: 'center',
  },
  infoLink: {
    minHeight: MinTouchSize,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  infoLinkText: {
    textDecorationLine: 'underline',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalHandle: {
    width: 48,
    height: 6,
    borderRadius: 3,
    alignSelf: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexShrink: 1,
  },
  modalClose: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    lineHeight: 24,
  },
  modalButton: {
    minHeight: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
