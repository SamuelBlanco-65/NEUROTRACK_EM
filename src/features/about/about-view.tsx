import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MinTouchSize, Radius, Spacing, useThemeColors } from '@/theme';
import {
  ABOUT_AUDIENCES,
  ABOUT_COMFORT,
  ABOUT_FAQ,
  ABOUT_FEATURES,
  ABOUT_HELP,
  ABOUT_HERO,
  ABOUT_NOTICE,
  ABOUT_PRIVACY,
  ABOUT_STEPS,
  type AboutItem,
} from './content';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText variant="headlineSm" accessibilityRole="header">
        {title}
      </ThemedText>
      {children}
    </View>
  );
}

function IconCard({ item }: { item: AboutItem }) {
  const colors = useThemeColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.surfaceContainerLow }]} accessible>
      <View style={[styles.iconCircle, { backgroundColor: colors.secondaryContainer }]}>
        <MaterialIcons name={item.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.cardText}>
        <ThemedText variant="labelLg">{item.title}</ThemedText>
        <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
          {item.text}
        </ThemedText>
      </View>
    </View>
  );
}

function FaqRow({ question, answer }: { question: string; answer: string }) {
  const colors = useThemeColors();
  const [open, setOpen] = useState(false);
  return (
    <View style={[styles.faq, { backgroundColor: colors.surfaceContainerLow }]}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityLabel={question}
        accessibilityState={{ expanded: open }}
        accessibilityHint={open ? 'Toca para ocultar la respuesta' : 'Toca para ver la respuesta'}
        style={styles.faqQuestion}
        testID={`acerca-faq-${question}`}>
        <ThemedText variant="labelLg" style={styles.faqQuestionText}>
          {question}
        </ThemedText>
        <MaterialIcons name={open ? 'expand-less' : 'expand-more'} size={24} color={colors.primary} />
      </Pressable>
      {open ? (
        <ThemedText variant="bodyMd" colorRole="onSurfaceVariant" style={styles.faqAnswer}>
          {answer}
        </ThemedText>
      ) : null}
    </View>
  );
}

/** Contenido de la pantalla «¿Qué es Neurotrack EM?». Es estático: no depende de datos remotos. */
export function AboutView() {
  const colors = useThemeColors();

  return (
    <View style={styles.root}>
      <View style={[styles.hero, { backgroundColor: colors.surfaceContainerLow }]}>
        <Image
          accessibilityIgnoresInvertColors
          source={require('@/assets/images/acerca-fondo.jpeg')}
          style={styles.heroImage}
          resizeMode="cover"
          accessibilityLabel="Ilustración de dos personas caminando juntas por un sendero entre flores"
        />
      </View>
      <View style={styles.heroText}>
        <ThemedText variant="headlineLg" accessibilityRole="header">
          {ABOUT_HERO.title}
        </ThemedText>
        <ThemedText variant="bodyMd">{ABOUT_HERO.text}</ThemedText>
        <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
          {ABOUT_HERO.note}
        </ThemedText>
      </View>

      <Section title="¿Para quién es?">
        {ABOUT_AUDIENCES.map((item) => (
          <IconCard key={item.id} item={item} />
        ))}
      </Section>

      <Section title="Qué puedes hacer">
        {ABOUT_FEATURES.map((item) => (
          <IconCard key={item.id} item={item} />
        ))}
      </Section>

      <Section title="Cómo empezar">
        {ABOUT_STEPS.map((step, index) => (
          <View key={step} style={styles.stepRow} accessible accessibilityLabel={`Paso ${index + 1}: ${step}`}>
            <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
              <ThemedText variant="labelLg" colorRole="onPrimary">
                {index + 1}
              </ThemedText>
            </View>
            <ThemedText variant="bodyMd" style={styles.stepText}>
              {step}
            </ThemedText>
          </View>
        ))}
      </Section>

      <Section title="Tus datos, tu decisión">
        {ABOUT_PRIVACY.map((line) => (
          <View key={line} style={styles.bulletRow}>
            <MaterialIcons name="check-circle" size={22} color={colors.primary} />
            <ThemedText variant="bodyMd" style={styles.bulletText}>
              {line}
            </ThemedText>
          </View>
        ))}
        <View style={styles.linksRow}>
          <Pressable
            onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'terminos' } })}
            accessibilityRole="link"
            accessibilityLabel="Leer los términos de uso"
            style={styles.link}
            testID="acerca-terminos">
            <ThemedText variant="labelMd" colorRole="primary" style={styles.linkText}>
              Términos de uso
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => router.push({ pathname: '/legal/[doc]', params: { doc: 'privacidad' } })}
            accessibilityRole="link"
            accessibilityLabel="Leer la política de privacidad y datos de salud"
            style={styles.link}
            testID="acerca-privacidad">
            <ThemedText variant="labelMd" colorRole="primary" style={styles.linkText}>
              Privacidad y datos de salud
            </ThemedText>
          </Pressable>
        </View>
      </Section>

      <Section title="Pensada para que sea cómoda">
        <View style={styles.chips}>
          {ABOUT_COMFORT.map((chip) => (
            <View key={chip.id} style={[styles.chip, { backgroundColor: colors.secondaryContainer }]}>
              <MaterialIcons name={chip.icon} size={18} color={colors.onSecondaryContainer} />
              <ThemedText variant="labelMd" colorRole="onSecondaryContainer">
                {chip.label}
              </ThemedText>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Preguntas frecuentes">
        {ABOUT_FAQ.map((faq) => (
          <FaqRow key={faq.id} question={faq.question} answer={faq.answer} />
        ))}
      </Section>

      <View
        style={[styles.notice, { backgroundColor: colors.tertiaryFixed }]}
        accessible
        accessibilityLabel={`Aviso: ${ABOUT_NOTICE} ${ABOUT_HELP}`}>
        <MaterialIcons name="info" size={22} color={colors.onTertiaryFixed} />
        <View style={styles.noticeText}>
          <ThemedText variant="bodySm" colorRole="onTertiaryFixed">
            {ABOUT_NOTICE}
          </ThemedText>
          <ThemedText variant="bodySm" colorRole="onTertiaryFixed">
            {ABOUT_HELP}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.lg },
  hero: {
    aspectRatio: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  heroImage: { width: '100%', height: '100%' },
  heroText: { gap: Spacing.xs },
  section: { gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: { flex: 1, gap: 2 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, minHeight: MinTouchSize },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepText: { flex: 1 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  bulletText: { flex: 1 },
  linksRow: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.lg },
  link: { minHeight: MinTouchSize, justifyContent: 'center' },
  linkText: { textDecorationLine: 'underline' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    minHeight: 36,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.full,
  },
  faq: { borderRadius: Radius.default, overflow: 'hidden' },
  faqQuestion: {
    minHeight: MinTouchSize + 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  faqQuestionText: { flex: 1 },
  faqAnswer: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.default,
    padding: Spacing.md,
  },
  noticeText: { flex: 1, gap: Spacing.xs },
});
