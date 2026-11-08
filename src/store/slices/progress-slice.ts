import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { listActivitySessionsBetween } from '@/features/activities/api';
import type { ActivitySession } from '@/features/activities/types';
import { getPeriodRange, getPreviousPeriodRange, shiftReference } from '@/features/progress/logic';
import type { ProgressError, ProgressPeriod, ProgressView } from '@/features/progress/types';
import { listSymptomLogsBetween } from '@/features/symptoms/api';
import type { SymptomLog } from '@/features/symptoms/types';
import type { RootState } from '@/store/store';

type ProgressState = {
  period: ProgressPeriod;
  referenceISO: string;
  view: ProgressView;
  status: 'idle' | 'cargando' | 'listo' | 'error';
  error: ProgressError | null;
  symptomLogs: SymptomLog[];
  activitySessions: ActivitySession[];
};

function todayISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

const initialState: ProgressState = {
  period: 'mes',
  referenceISO: todayISO(),
  view: 'grafico',
  status: 'idle',
  error: null,
  symptomLogs: [],
  activitySessions: [],
};

export const fetchProgressData = createAsyncThunk<
  { symptomLogs: SymptomLog[]; activitySessions: ActivitySession[] },
  void,
  { state: RootState; rejectValue: ProgressError }
>('progress/fetch', async (_, { getState, rejectWithValue }) => {
  const patientId = getState().auth.session?.userId;
  if (!patientId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });

  const { period, referenceISO } = getState().progress;
  const reference = new Date(referenceISO);
  const currentRange = getPeriodRange(period, reference);
  const previousRange = getPreviousPeriodRange(period, reference);
  const startISO = previousRange.start.toISOString();
  const endISO = currentRange.end.toISOString();

  try {
    const [symptomLogs, activitySessions] = await Promise.all([
      listSymptomLogsBetween(patientId, startISO, endISO),
      listActivitySessionsBetween(patientId, startISO, endISO),
    ]);
    return { symptomLogs, activitySessions };
  } catch (error) {
    return rejectWithValue(error as ProgressError);
  }
});

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    periodChanged(state, action: PayloadAction<ProgressPeriod>) {
      state.period = action.payload;
      state.referenceISO = todayISO();
    },
    referenceShifted(state, action: PayloadAction<1 | -1>) {
      state.referenceISO = shiftReference(state.period, new Date(state.referenceISO), action.payload).toISOString();
    },
    viewToggled(state) {
      state.view = state.view === 'grafico' ? 'tabla' : 'grafico';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProgressData.pending, (state) => {
        state.status = 'cargando';
        state.error = null;
      })
      .addCase(fetchProgressData.fulfilled, (state, action) => {
        state.status = 'listo';
        state.symptomLogs = action.payload.symptomLogs;
        state.activitySessions = action.payload.activitySessions;
      })
      .addCase(fetchProgressData.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      });
  },
});

export const { periodChanged, referenceShifted, viewToggled } = progressSlice.actions;
export default progressSlice.reducer;
