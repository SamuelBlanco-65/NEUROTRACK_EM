import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { listAreaProgress, logActivitySession, saveAreaLevel } from '@/features/activities/api';
import { MAX_LEVEL, ROUNDS_PER_SESSION } from '@/features/activities/constants';
import {
  checkAtencionAnswer,
  checkLogicaAnswer,
  generateAtencionRound,
  generateLogicaRound,
  generateMemoriaRound,
  generateMovimientoRound,
  nextLevel,
} from '@/features/activities/logic';
import type {
  ActivitiesError,
  ActivityArea,
  AtencionRound,
  LogicaRound,
  MemoriaRound,
  MovimientoRound,
  RoundResult,
  ShapeId,
} from '@/features/activities/types';
import type { RootState } from '@/store/store';

export type SessionPhase = 'memorizar' | 'responder' | 'resultado' | 'completada';

export type SessionState = {
  area: ActivityArea;
  levelAtStart: number;
  roundIndex: number;
  roundsCorrect: number;
  phase: SessionPhase;
  memoriaRound: MemoriaRound | null;
  atencionRound: AtencionRound | null;
  logicaRound: LogicaRound | null;
  movimientoRound: MovimientoRound | null;
  memoriaAnswer: ShapeId[];
  completedStepIndices: number[];
  lastResult: RoundResult | null;
  newLevel: number | null;
};

type ActivitiesState = {
  progress: Record<ActivityArea, number>;
  progressStatus: 'idle' | 'cargando' | 'listo' | 'error';
  progressError: ActivitiesError | null;
  session: SessionState | null;
  saveStatus: 'idle' | 'guardando' | 'error';
};

const initialState: ActivitiesState = {
  progress: { memoria: 1, atencion: 1, logica: 1, movimiento: 1 },
  progressStatus: 'idle',
  progressError: null,
  session: null,
  saveStatus: 'idle',
};

export const fetchAreaProgress = createAsyncThunk<
  Record<ActivityArea, number>,
  void,
  { state: RootState; rejectValue: ActivitiesError }
>('activities/fetchProgress', async (_, { getState, rejectWithValue }) => {
  const patientId = getState().auth.session?.userId;
  if (!patientId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });
  try {
    const rows = await listAreaProgress(patientId);
    const progress: Record<ActivityArea, number> = { memoria: 1, atencion: 1, logica: 1, movimiento: 1 };
    rows.forEach((row) => {
      progress[row.area] = row.level;
    });
    return progress;
  } catch (error) {
    return rejectWithValue(error as ActivitiesError);
  }
}, {
  // Al cerrar sesión el store se reinicia con la pestaña aún montada: sin esta condición la carga
  // se lanzaba sin sesión y dejaba un error fijo («No hay sesión activa») para la cuenta siguiente.
  condition: (_, { getState }) => Boolean(getState().auth.session),
});

export const persistAreaLevel = createAsyncThunk<
  { area: ActivityArea; level: number },
  { area: ActivityArea; level: number },
  { state: RootState; rejectValue: ActivitiesError }
>('activities/persistLevel', async ({ area, level }, { getState, rejectWithValue }) => {
  const patientId = getState().auth.session?.userId;
  if (!patientId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });
  try {
    await saveAreaLevel(patientId, area, level);
    return { area, level };
  } catch (error) {
    return rejectWithValue(error as ActivitiesError);
  }
});

/** Historial de sesiones completadas, para la pantalla de Progreso (RF-005). Intento único:
 * si falla por offline, se pierde esa sesión del historial pero no bloquea nada (RNF-012). */
export const recordActivitySession = createAsyncThunk<
  void,
  { area: ActivityArea },
  { state: RootState; rejectValue: ActivitiesError }
>('activities/recordSession', async ({ area }, { getState, rejectWithValue }) => {
  const patientId = getState().auth.session?.userId;
  if (!patientId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });
  try {
    await logActivitySession(patientId, area);
  } catch (error) {
    return rejectWithValue(error as ActivitiesError);
  }
});

function buildRoundState(area: ActivityArea, level: number) {
  return {
    memoriaRound: area === 'memoria' ? generateMemoriaRound(level) : null,
    atencionRound: area === 'atencion' ? generateAtencionRound(level) : null,
    logicaRound: area === 'logica' ? generateLogicaRound(level) : null,
    movimientoRound: area === 'movimiento' ? generateMovimientoRound(level) : null,
  };
}

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    sessionStarted(state, action: PayloadAction<ActivityArea | { area: ActivityArea; level: number }>) {
      const area = typeof action.payload === 'string' ? action.payload : action.payload.area;
      const level = typeof action.payload === 'string' ? state.progress[area] : action.payload.level;
      state.session = {
        area,
        levelAtStart: level,
        roundIndex: 0,
        roundsCorrect: 0,
        phase: area === 'memoria' ? 'memorizar' : 'responder',
        memoriaAnswer: [],
        completedStepIndices: [],
        lastResult: null,
        newLevel: null,
        ...buildRoundState(area, level),
      };
    },
    sessionEnded(state) {
      state.session = null;
    },
    memorizeConfirmed(state) {
      if (!state.session || state.session.phase !== 'memorizar') return;
      state.session.phase = 'responder';
    },
    memorizeReplayRequested(state) {
      const session = state.session;
      if (!session || session.area !== 'memoria') return;
      session.phase = 'memorizar';
      session.memoriaAnswer = [];
      session.lastResult = null;
    },
    memoriaShapeTapped(state, action: PayloadAction<ShapeId>) {
      const session = state.session;
      if (!session || session.area !== 'memoria' || session.phase !== 'responder' || !session.memoriaRound) return;
      const expectedShape = session.memoriaRound.sequence[session.memoriaAnswer.length];
      session.memoriaAnswer.push(action.payload);
      // Falla rápido: un toque fuera de orden termina la ronda de inmediato en vez de
      // esperar a que se agoten los toques, así el resaltado de la figura y el veredicto
      // final siempre coinciden (RF-003: importa la precisión del paso, no solo el resultado).
      if (action.payload !== expectedShape) {
        session.lastResult = 'incorrecto';
        session.phase = 'resultado';
        return;
      }
      if (session.memoriaAnswer.length < session.memoriaRound.sequence.length) return;
      session.roundsCorrect += 1;
      session.lastResult = 'correcto';
      session.phase = 'resultado';
    },
    atencionOptionTapped(state, action: PayloadAction<string>) {
      const session = state.session;
      if (!session || session.area !== 'atencion' || session.phase !== 'responder' || !session.atencionRound) return;
      const correct = checkAtencionAnswer(session.atencionRound, action.payload);
      session.lastResult = correct ? 'correcto' : 'incorrecto';
      if (correct) session.roundsCorrect += 1;
      session.phase = 'resultado';
    },
    logicaOptionTapped(state, action: PayloadAction<number>) {
      const session = state.session;
      if (!session || session.area !== 'logica' || session.phase !== 'responder' || !session.logicaRound) return;
      const correct = checkLogicaAnswer(session.logicaRound, action.payload);
      session.lastResult = correct ? 'correcto' : 'incorrecto';
      if (correct) session.roundsCorrect += 1;
      session.phase = 'resultado';
    },
    movimientoStepToggled(state, action: PayloadAction<number>) {
      const session = state.session;
      if (!session || session.area !== 'movimiento') return;
      const index = session.completedStepIndices.indexOf(action.payload);
      if (index >= 0) session.completedStepIndices.splice(index, 1);
      else session.completedStepIndices.push(action.payload);
    },
    movimientoSessionFinished(state) {
      const session = state.session;
      if (!session || session.area !== 'movimiento') return;
      session.lastResult = 'correcto';
      session.newLevel = Math.min(session.levelAtStart + 1, MAX_LEVEL.movimiento);
      session.phase = 'completada';
    },
    roundContinued(state) {
      const session = state.session;
      if (!session || session.phase !== 'resultado') return;
      const isLastRound = session.roundIndex + 1 >= ROUNDS_PER_SESSION;
      if (isLastRound) {
        session.newLevel = nextLevel(session.levelAtStart, MAX_LEVEL[session.area], session.roundsCorrect);
        session.phase = 'completada';
        return;
      }
      session.roundIndex += 1;
      session.memoriaAnswer = [];
      session.phase = session.area === 'memoria' ? 'memorizar' : 'responder';
      Object.assign(session, buildRoundState(session.area, session.levelAtStart));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAreaProgress.pending, (state) => {
        state.progressStatus = 'cargando';
        state.progressError = null;
      })
      .addCase(fetchAreaProgress.fulfilled, (state, action) => {
        state.progressStatus = 'listo';
        state.progress = action.payload;
      })
      .addCase(fetchAreaProgress.rejected, (state, action) => {
        state.progressStatus = 'error';
        state.progressError = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(persistAreaLevel.pending, (state) => {
        state.saveStatus = 'guardando';
      })
      .addCase(persistAreaLevel.fulfilled, (state, action) => {
        state.saveStatus = 'idle';
        state.progress[action.payload.area] = action.payload.level;
      })
      .addCase(persistAreaLevel.rejected, (state) => {
        // El nivel ya se refleja en la sesión local; si falla el guardado remoto, se
        // reintentará en la próxima sincronización (RNF-012: tolerar estado offline).
        state.saveStatus = 'error';
      });
  },
});

export const {
  sessionStarted,
  sessionEnded,
  memorizeConfirmed,
  memorizeReplayRequested,
  memoriaShapeTapped,
  atencionOptionTapped,
  logicaOptionTapped,
  movimientoStepToggled,
  movimientoSessionFinished,
  roundContinued,
} = activitiesSlice.actions;
export default activitiesSlice.reducer;
