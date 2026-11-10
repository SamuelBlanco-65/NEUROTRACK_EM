import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState, type ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ALL_SHAPES, AREA_META, MAX_LEVEL, ROUNDS_PER_SESSION, SHAPE_META } from '@/features/activities/constants';
import { FeedbackBadge } from '@/features/activities/feedback-badge';
import { SessionHeader } from '@/features/activities/session-header';
import { ShapeButton, ShapeSequenceItem } from '@/features/activities/shape-button';
import type { ActivityArea, MovimientoRound, RoundResult, ShapeId } from '@/features/activities/types';
import {
  MEMORIA_RESPONDER_SCRIPT,
  atencionScript,
  completedScript,
  movimientoIntroScript,
  sequenceScript,
} from '@/features/audio/scripts';
import { SpeakButton } from '@/features/audio/speak-button';
import { useActivityNarration } from '@/features/audio/use-activity-narration';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  atencionOptionTapped,
  memorizeConfirmed,
  memorizeReplayRequested,
  memoriaShapeTapped,
  movimientoSessionFinished,
  movimientoStepToggled,
  persistAreaLevel,
  recordActivitySession,
  roundContinued,
  sessionEnded,
  sessionStarted,
  type SessionState,
} from '@/store/slices/activities-slice';
import { MinTouchSize, Radius, Spacing, useReduceMotion, useThemeColors } from '@/theme';

const VALID_AREAS: ActivityArea[] = ['memoria', 'atencion', 'movimiento'];

type MaterialIconName = ComponentProps<typeof MaterialIcons>['name'];

export default function ActividadSesionScreen() {
  const params = useLocalSearchParams<{ area: string }>();
  const dispatch = useAppDispatch();
  const colors = useThemeColors();
  const session = useAppSelector((state) => state.activities.session);

  const area = VALID_AREAS.includes(params.area as ActivityArea) ? (params.area as ActivityArea) : null;

  useEffect(() => {
    if (area && (!session || session.area !== area)) {
      dispatch(sessionStarted(area));
    }
  }, [area, session, dispatch]);

  useActivityNarration(session && session.area === area ? session : null);

  const loggedSessionRef = useRef<SessionState | null>(null);
  useEffect(() => {
    if (session && session.phase === 'completada' && loggedSessionRef.current !== session) {
      loggedSessionRef.current = session;
      dispatch(recordActivitySession({ area: session.area }));
    }
  }, [session, dispatch]);

  function exitSession() {
    dispatch(sessionEnded());
    router.back();
  }

  if (!area) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <ThemedText variant="headlineSm">Actividad no encontrada</ThemedText>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            hitSlop={8}
            style={styles.volverButton}
            testID="actividad-area-invalida-volver">
            <ThemedText variant="labelLg" colorRole="primary">
              Volver
            </ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!session || session.area !== area) {
    return (
      <ThemedView style={styles.container} testID="actividad-cargando">
        <SafeAreaView style={styles.safeArea} />
      </ThemedView>
    );
  }

  const headerProgress = getHeaderProgress(session, area);

  return (
    <ThemedView style={styles.container} testID={`actividad-${area}-screen`}>
      <SafeAreaView style={styles.safeArea}>
        <SessionHeader
          title={headerProgress.title}
          step={headerProgress.step}
          total={headerProgress.total}
          unit={headerProgress.unit}
          onExit={exitSession}
        />
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {session.phase === 'memorizar' && session.memoriaRound ? (
            <View style={styles.block} testID="actividad-memoria-memorizar">
              <InstructionCard
                icon="psychology"
                headline="Memoriza esta secuencia"
                hint="Tómate el tiempo que necesites. No hay cronómetro."
                hintIcon="spa"
                speakText={sequenceScript(session.memoriaRound.sequence)}
              />
              <View style={styles.sequenceRow}>
                {session.memoriaRound.sequence.map((shape, index) => (
                  <ShapeSequenceItem key={`${shape}-${index}`} shape={shape} order={index + 1} />
                ))}
              </View>
              <Pressable
                onPress={() => dispatch(memorizeConfirmed())}
                testID="actividad-memoria-listo"
                accessibilityRole="button"
                accessibilityLabel="Listo, continuar"
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primaryContainer, opacity: pressed ? 0.9 : 1 },
                ]}>
                <ThemedText variant="labelLg" colorRole="onPrimary">
                  Listo, continuar
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {(session.phase === 'responder' || session.phase === 'resultado') && area === 'memoria' && session.memoriaRound ? (
            <MemoriaResponderBlock
              sequence={session.memoriaRound.sequence}
              answer={session.memoriaAnswer}
              phase={session.phase}
              lastResult={session.lastResult}
              onTapShape={(shape) => dispatch(memoriaShapeTapped(shape))}
              onContinue={() => dispatch(roundContinued())}
              onReplay={() => dispatch(memorizeReplayRequested())}
            />
          ) : null}

          {session.phase === 'responder' && area === 'atencion' && session.atencionRound ? (
            <View style={styles.block} testID="actividad-atencion-responder">
              <InstructionCard
                icon="auto-awesome"
                headline="Encuentra la figura distinta"
                hint="Tómate tu tiempo. Sin límites ni prisas."
                hintIcon="spa"
                speakText={atencionScript(session.atencionRound.options.length)}
              />
              <View style={styles.grid}>
                {session.atencionRound.options.map((option, index) => (
                  <ShapeButton
                    key={option.id}
                    shape={option.shape}
                    label={`Opción ${index + 1}: ${SHAPE_META[option.shape].label}`}
                    onPress={() => {
                      Haptics.notificationAsync(
                        option.isOdd
                          ? Haptics.NotificationFeedbackType.Success
                          : Haptics.NotificationFeedbackType.Error
                      );
                      dispatch(atencionOptionTapped(option.id));
                    }}
                    testID={`actividad-atencion-${option.id}`}
                  />
                ))}
              </View>
            </View>
          ) : null}

          {area === 'movimiento' && session.movimientoRound && session.phase !== 'completada' ? (
            <MovimientoBlock
              round={session.movimientoRound}
              completedStepIndices={session.completedStepIndices}
              onToggleStep={(index) => {
                Haptics.selectionAsync();
                dispatch(movimientoStepToggled(index));
              }}
              onFinish={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                dispatch(movimientoSessionFinished());
              }}
            />
          ) : null}

          {session.phase === 'resultado' && area === 'atencion' && session.lastResult ? (
            <View style={styles.block} testID="actividad-resultado">
              <FeedbackBadge result={session.lastResult} testID="actividad-feedback-badge" />
              <Pressable
                onPress={() => dispatch(roundContinued())}
                testID="actividad-continuar"
                accessibilityRole="button"
                accessibilityLabel="Continuar"
                style={({ pressed }) => [
                  styles.primaryButton,
                  { backgroundColor: colors.primaryContainer, opacity: pressed ? 0.9 : 1 },
                ]}>
                <ThemedText variant="labelLg" colorRole="onPrimary">
                  Continuar
                </ThemedText>
              </Pressable>
            </View>
          ) : null}

          {session.phase === 'completada' && session.newLevel !== null ? (
            <SesionCompletada
              area={area}
              levelAtStart={session.levelAtStart}
              newLevel={session.newLevel}
              aciertos={area === 'movimiento' ? session.completedStepIndices.length : session.roundsCorrect}
              aciertosTotal={
                area === 'movimiento' ? session.movimientoRound?.steps.length ?? 0 : ROUNDS_PER_SESSION
              }
              onVolver={() => {
                if (session.newLevel !== null && session.newLevel !== session.levelAtStart) {
                  dispatch(persistAreaLevel({ area, level: session.newLevel }));
                }
                dispatch(sessionEnded());
                router.back();
              }}
              onRepetir={() => {
                const level = session.newLevel ?? session.levelAtStart;
                if (level !== session.levelAtStart) {
                  dispatch(persistAreaLevel({ area, level }));
                }
                dispatch(sessionStarted({ area, level }));
              }}
            />
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/**
 * Progreso mostrado en el encabezado. La unidad cambia según qué se está contando en esa
 * fase, para no reusar "Paso" con dos significados distintos (ronda de la sesión vs. posición
 * dentro de la secuencia que hay que repetir en Memoria):
 * - Memoria, mientras se repite la secuencia: "Figura N de M" (M = largo de la secuencia).
 * - Movimiento: "Paso N de M" (M = pasos guiados de esa sesión).
 * - El resto (memorizar, Atención, rondas en general): "Ronda N de 3".
 */
function getHeaderProgress(
  session: SessionState,
  area: ActivityArea
): { title: string; step?: number; total?: number; unit?: string } {
  if (session.phase === 'completada') {
    return { title: 'Resumen de la sesión' };
  }
  if (area === 'memoria' && session.memoriaRound && (session.phase === 'responder' || session.phase === 'resultado')) {
    const total = session.memoriaRound.sequence.length;
    const step = Math.min(session.memoriaAnswer.length + (session.phase === 'responder' ? 1 : 0), total);
    return { title: 'Sesión de ejercicio', step: Math.max(step, 1), total, unit: 'Figura' };
  }
  if (area === 'movimiento' && session.movimientoRound) {
    return {
      title: 'Sesión de ejercicio',
      step: session.completedStepIndices.length,
      total: session.movimientoRound.steps.length,
      unit: 'Paso',
    };
  }
  return { title: 'Sesión de ejercicio', step: session.roundIndex + 1, total: ROUNDS_PER_SESSION, unit: 'Ronda' };
}

function InstructionCard({
  icon,
  headline,
  hint,
  hintIcon,
  speakText,
}: {
  icon: MaterialIconName;
  headline: string;
  hint: string;
  hintIcon: MaterialIconName;
  /** Si se da, muestra un botón "Escuchar" que lee este texto en voz alta (REC-002). */
  speakText?: string;
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.instructionCard, { backgroundColor: colors.surfaceContainerLowest }]}>
      <View style={[styles.instructionIconCircle, { backgroundColor: colors.secondaryContainer }]}>
        <MaterialIcons name={icon} size={24} color={colors.primaryContainer} />
      </View>
      <ThemedText variant="headlineSm" accessibilityRole="header" style={styles.instructionHeadline}>
        {headline}
      </ThemedText>
      <View style={[styles.instructionChip, { backgroundColor: colors.surfaceContainerLow }]}>
        <MaterialIcons name={hintIcon} size={18} color={colors.primaryContainer} />
        <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
          {hint}
        </ThemedText>
      </View>
      {speakText ? (
        <SpeakButton text={speakText} label="Escuchar" accessibilityLabel="Escuchar las instrucciones" testID="actividad-escuchar" />
      ) : null}
    </View>
  );
}

function MemoriaResponderBlock({
  sequence,
  answer,
  phase,
  lastResult,
  onTapShape,
  onContinue,
  onReplay,
}: {
  sequence: ShapeId[];
  answer: ShapeId[];
  phase: 'responder' | 'resultado';
  lastResult: RoundResult | null;
  onTapShape: (shape: ShapeId) => void;
  onContinue: () => void;
  onReplay: () => void;
}) {
  const colors = useThemeColors();
  const reduceMotion = useReduceMotion();
  // Resaltado transitorio, separado del estado de la sesión: la figura recién tocada se
  // enmarca un momento y luego vuelve a su estado normal, para que no parezca "seleccionada
  // para siempre". En la fase "resultado" se deja fija (la ronda ya terminó, conviene que
  // se vea qué tocó). Gracias a que una figura fuera de orden termina la ronda de inmediato
  // (ver `memoriaShapeTapped`), este resaltado y el veredicto final de la ronda nunca se
  // contradicen entre sí. Con "Reducir animaciones" activado (Accesibilidad), el resaltado
  // no se autolimpia: se queda fijo hasta el siguiente toque, que lo reemplaza igual.
  const [flash, setFlash] = useState<{ shape: ShapeId; correct: boolean } | null>(null);
  const flashTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    },
    []
  );

  function handleTap(shape: ShapeId) {
    const index = answer.length;
    const correct = shape === sequence[index];
    const roundEnds = !correct || index === sequence.length - 1;

    if (flashTimeoutRef.current) clearTimeout(flashTimeoutRef.current);
    setFlash({ shape, correct });
    Haptics.notificationAsync(
      correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error
    );
    onTapShape(shape);
    if (!roundEnds && !reduceMotion) {
      flashTimeoutRef.current = setTimeout(() => setFlash(null), 900);
    }
  }

  return (
    <View style={styles.block} testID="actividad-memoria-responder">
      <InstructionCard
        icon="psychology"
        headline="Toca las figuras en el mismo orden en que aparecieron."
        hint="Tómate tu tiempo. Sin límites ni prisas."
        hintIcon="spa"
        speakText={MEMORIA_RESPONDER_SCRIPT}
      />
      <View style={styles.grid}>
        {ALL_SHAPES.map((shape) => (
          <ShapeButton
            key={shape}
            shape={shape}
            feedback={flash && shape === flash.shape ? (flash.correct ? 'correcto' : 'incorrecto') : undefined}
            onPress={phase === 'responder' ? () => handleTap(shape) : undefined}
            testID={`actividad-memoria-opcion-${shape}`}
          />
        ))}
      </View>

      {flash ? (
        <View
          style={[
            styles.liveFeedback,
            { backgroundColor: flash.correct ? colors.secondaryContainer : colors.errorContainer },
          ]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          testID="actividad-memoria-feedback-vivo">
          <View style={[styles.liveFeedbackIcon, { backgroundColor: colors.surfaceContainerLowest }]}>
            <MaterialIcons
              name={flash.correct ? 'check-circle' : 'info'}
              size={22}
              color={flash.correct ? colors.onSecondaryContainer : colors.onErrorContainer}
            />
          </View>
          <View style={styles.liveFeedbackText}>
            <ThemedText variant="labelLg" colorRole={flash.correct ? 'onSecondaryContainer' : 'onErrorContainer'}>
              {flash.correct ? '¡Bien!' : 'Vamos, tú puedes'}
            </ThemedText>
            <ThemedText variant="bodySm" colorRole={flash.correct ? 'onSecondaryContainer' : 'onErrorContainer'}>
              {phase === 'resultado'
                ? lastResult === 'correcto'
                  ? 'Secuencia completa, bien hecho.'
                  : 'Esta vez no, pero vas avanzando.'
                : 'Paso reconocido con éxito.'}
            </ThemedText>
          </View>
        </View>
      ) : null}

      {phase === 'resultado' ? (
        <Pressable
          onPress={onContinue}
          testID="actividad-continuar"
          accessibilityRole="button"
          accessibilityLabel="Continuar"
          style={({ pressed }) => [
            styles.primaryButton,
            { backgroundColor: colors.primaryContainer, opacity: pressed ? 0.9 : 1 },
          ]}>
          <ThemedText variant="labelLg" colorRole="onPrimary">
            Continuar
          </ThemedText>
        </Pressable>
      ) : null}

      <Pressable
        onPress={onReplay}
        testID="actividad-memoria-replay"
        accessibilityRole="button"
        accessibilityLabel="Ver la secuencia otra vez"
        style={({ pressed }) => [
          styles.replayButton,
          { backgroundColor: colors.surfaceContainerHigh, opacity: pressed ? 0.85 : 1 },
        ]}>
        <MaterialIcons name="replay" size={20} color={colors.secondary} />
        <ThemedText variant="labelMd" colorRole="secondary">
          Ver la secuencia otra vez
        </ThemedText>
      </Pressable>
    </View>
  );
}

function MovimientoBlock({
  round,
  completedStepIndices,
  onToggleStep,
  onFinish,
}: {
  round: MovimientoRound;
  completedStepIndices: number[];
  onToggleStep: (index: number) => void;
  onFinish: () => void;
}) {
  const colors = useThemeColors();
  const allStepsDone = completedStepIndices.length >= round.steps.length;

  return (
    <View style={styles.block} testID="actividad-movimiento-pasos">
      <InstructionCard
        icon="pan-tool-alt"
        headline="Sigue estos pasos"
        hint="Márcalos como hechos a tu propio ritmo."
        hintIcon="spa"
        speakText={movimientoIntroScript(round.steps)}
      />
      <View style={styles.stepsList}>
        {round.steps.map((step, index) => {
          const done = completedStepIndices.includes(index);
          return (
            <Pressable
              key={index}
              onPress={() => onToggleStep(index)}
              testID={`actividad-movimiento-paso-${index}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={step}
              style={({ pressed }) => [
                styles.stepRow,
                { backgroundColor: colors.surfaceContainerLowest, opacity: pressed ? 0.9 : 1 },
              ]}>
              <MaterialIcons
                name={done ? 'check-circle' : 'radio-button-unchecked'}
                size={24}
                color={done ? colors.primary : colors.outline}
              />
              <ThemedText variant="bodyMd" style={styles.stepText}>
                {step}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      <Pressable
        onPress={onFinish}
        disabled={!allStepsDone}
        testID="actividad-movimiento-terminar"
        accessibilityRole="button"
        accessibilityLabel="Terminé esta sesión"
        accessibilityState={{ disabled: !allStepsDone }}
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: colors.primaryContainer, opacity: !allStepsDone ? 0.5 : pressed ? 0.9 : 1 },
        ]}>
        <ThemedText variant="labelLg" colorRole="onPrimary">
          Terminé esta sesión
        </ThemedText>
      </Pressable>
    </View>
  );
}

function SesionCompletada({
  area,
  levelAtStart,
  newLevel,
  aciertos,
  aciertosTotal,
  onVolver,
  onRepetir,
}: {
  area: ActivityArea;
  levelAtStart: number;
  newLevel: number;
  aciertos: number;
  aciertosTotal: number;
  onVolver: () => void;
  onRepetir: () => void;
}) {
  const colors = useThemeColors();
  const leveledUp = newLevel > levelAtStart;
  const aciertosRatio = aciertosTotal > 0 ? aciertos / aciertosTotal : 0;

  return (
    <View style={styles.block} testID="actividad-sesion-completada">
      <View style={styles.completedHeader}>
        <View style={[styles.completedIconCircle, { backgroundColor: colors.surfaceContainer }]}>
          <MaterialIcons name="eco" size={36} color={colors.primaryContainer} />
        </View>
        <ThemedText variant="headlineMd" accessibilityRole="header" style={styles.completedTitle}>
          Sesión completada
        </ThemedText>
        <ThemedText variant="bodyMd" colorRole="secondary" style={styles.completedTitle}>
          {area === 'movimiento'
            ? `Hiciste ${aciertos} de ${aciertosTotal} pasos. Cada práctica cuenta.`
            : `Acertaste ${aciertos} de ${aciertosTotal} rondas. Cada práctica cuenta.`}
        </ThemedText>
        <SpeakButton
          text={completedScript(area, aciertos, aciertosTotal, newLevel)}
          label="Escuchar"
          accessibilityLabel="Escuchar el resumen de la sesión"
          testID="actividad-escuchar-resumen"
        />
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceContainer }]}>
          <View style={styles.statHeader}>
            <MaterialIcons name="check-circle" size={18} color={colors.primary} />
            <ThemedText variant="labelSm" colorRole="secondary">
              Aciertos
            </ThemedText>
          </View>
          <ThemedText variant="headlineSm">
            {aciertos} de {aciertosTotal}
          </ThemedText>
          <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
            {aciertosRatio >= 0.66 ? 'Gran concentración' : 'Vas progresando'}
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.surfaceContainer }]}>
          <View style={styles.statHeader}>
            <MaterialIcons name="psychology" size={18} color={colors.primary} />
            <ThemedText variant="labelSm" colorRole="secondary">
              Nivel actual
            </ThemedText>
          </View>
          <ThemedText variant="headlineSm">
            Nivel {newLevel} de {MAX_LEVEL[area]}
          </ThemedText>
          <ThemedText variant="bodySm" colorRole="onSurfaceVariant">
            {leveledUp ? `${AREA_META[area].title} subió de nivel` : `${AREA_META[area].title} activa`}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.tipBanner, { backgroundColor: colors.tertiaryFixed }]}>
        <MaterialIcons name="spa" size={20} color={colors.onTertiaryFixed} />
        <ThemedText variant="bodySm" colorRole="onTertiaryFixed" style={styles.tipText}>
          Tu constancia ayuda a fortalecer tus conexiones sin agotarte.
        </ThemedText>
      </View>

      <Pressable
        onPress={onVolver}
        testID="actividad-volver-a-actividades"
        accessibilityRole="button"
        accessibilityLabel="Volver a actividades"
        style={({ pressed }) => [
          styles.primaryButton,
          styles.primaryButtonRow,
          { backgroundColor: colors.primaryContainer, opacity: pressed ? 0.9 : 1 },
        ]}>
        <MaterialIcons name="grid-view" size={20} color={colors.onPrimary} />
        <ThemedText variant="labelLg" colorRole="onPrimary">
          Volver a actividades
        </ThemedText>
      </Pressable>
      <Pressable
        onPress={onRepetir}
        testID="actividad-repetir"
        accessibilityRole="button"
        accessibilityLabel="Repetir esta actividad"
        hitSlop={8}
        style={({ pressed }) => [styles.repeatButton, { opacity: pressed ? 0.7 : 1 }]}>
        <MaterialIcons name="replay" size={18} color={colors.primary} />
        <ThemedText variant="labelLg" colorRole="primary">
          Repetir
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.margin,
    paddingTop: Spacing.md,
    gap: Spacing.lg,
  },
  volverButton: {
    minHeight: MinTouchSize,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  scroll: {
    gap: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  block: {
    gap: Spacing.md,
  },
  instructionCard: {
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.lg,
  },
  instructionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  instructionHeadline: {
    textAlign: 'center',
  },
  instructionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginTop: 2,
  },
  sequenceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'space-between',
  },
  liveFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
  },
  liveFeedbackIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveFeedbackText: {
    flexShrink: 1,
    gap: 2,
  },
  replayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
  },
  stepsList: {
    gap: Spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    minHeight: MinTouchSize,
    borderRadius: Radius.default,
    padding: Spacing.sm,
  },
  stepText: {
    flexShrink: 1,
  },
  primaryButton: {
    minHeight: MinTouchSize,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  completedHeader: {
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  completedIconCircle: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  completedTitle: {
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: Radius.default,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.default,
  },
  tipText: {
    flexShrink: 1,
  },
  repeatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    minHeight: MinTouchSize,
  },
});
