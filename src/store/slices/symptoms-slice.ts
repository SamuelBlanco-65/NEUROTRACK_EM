import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { createSymptomLog, listSymptomLogsForMonth } from '@/features/symptoms/api';
import {
  CUSTOM_LABEL_MAX_LENGTH,
  type Severity,
  type SymptomLog,
  type SymptomsError,
  type SymptomType,
} from '@/features/symptoms/types';
import type { RootState } from '@/store/store';

type MonthKey = string; // `${year}-${month}`, month 0-indexado

type MonthEntry = {
  status: 'cargando' | 'listo' | 'error';
  logs: SymptomLog[];
  error: SymptomsError | null;
};

type SymptomsState = {
  draft: {
    symptomType: SymptomType | null;
    /** Nombre propio, solo se usa si el tipo es «otro». */
    customLabel: string;
    severity: Severity | null;
    note: string;
  };
  submitStatus: 'idle' | 'guardando' | 'error';
  submitError: SymptomsError | null;
  monthsByKey: Record<MonthKey, MonthEntry>;
};

const initialState: SymptomsState = {
  draft: { symptomType: null, customLabel: '', severity: null, note: '' },
  submitStatus: 'idle',
  submitError: null,
  monthsByKey: {},
};

export function monthKey(year: number, month: number): MonthKey {
  return `${year}-${month}`;
}

export const fetchMonthLogs = createAsyncThunk<
  { key: MonthKey; logs: SymptomLog[] },
  { year: number; month: number },
  { state: RootState; rejectValue: SymptomsError }
>('symptoms/fetchMonthLogs', async ({ year, month }, { getState, rejectWithValue }) => {
  const patientId = getState().auth.session?.userId;
  if (!patientId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });
  try {
    const logs = await listSymptomLogsForMonth(patientId, year, month);
    return { key: monthKey(year, month), logs };
  } catch (error) {
    return rejectWithValue(error as SymptomsError);
  }
});

export const submitSymptomLog = createAsyncThunk<SymptomLog, void, { state: RootState; rejectValue: SymptomsError }>(
  'symptoms/submit',
  async (_, { getState, rejectWithValue }) => {
    const { draft } = getState().symptoms;
    const patientId = getState().auth.session?.userId;
    if (!patientId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });
    if (!draft.symptomType || !draft.severity) {
      return rejectWithValue({ errorClass: 'validacion', message: 'Falta elegir el tipo o la severidad' });
    }
    try {
      return await createSymptomLog(patientId, {
        symptomType: draft.symptomType,
        // Solo un síntoma «otro» lleva nombre propio; si no lo escribió, queda como «Otro».
        customLabel:
          draft.symptomType === 'otro' && draft.customLabel.trim().length > 0
            ? draft.customLabel.trim().slice(0, CUSTOM_LABEL_MAX_LENGTH)
            : null,
        severity: draft.severity,
        note: draft.note.trim().length > 0 ? draft.note.trim() : null,
      });
    } catch (error) {
      return rejectWithValue(error as SymptomsError);
    }
  }
);

const symptomsSlice = createSlice({
  name: 'symptoms',
  initialState,
  reducers: {
    draftSymptomTypeSet(state, action: { payload: SymptomType }) {
      state.draft.symptomType = action.payload;
    },
    draftCustomLabelSet(state, action: { payload: string }) {
      state.draft.customLabel = action.payload;
    },
    draftSeveritySet(state, action: { payload: Severity }) {
      state.draft.severity = action.payload;
    },
    draftNoteSet(state, action: { payload: string }) {
      state.draft.note = action.payload;
    },
    draftReset(state) {
      state.draft = { symptomType: null, customLabel: '', severity: null, note: '' };
      state.submitStatus = 'idle';
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthLogs.pending, (state, action) => {
        const key = monthKey(action.meta.arg.year, action.meta.arg.month);
        state.monthsByKey[key] = { status: 'cargando', logs: state.monthsByKey[key]?.logs ?? [], error: null };
      })
      .addCase(fetchMonthLogs.fulfilled, (state, action) => {
        state.monthsByKey[action.payload.key] = { status: 'listo', logs: action.payload.logs, error: null };
      })
      .addCase(fetchMonthLogs.rejected, (state, action) => {
        const key = monthKey(action.meta.arg.year, action.meta.arg.month);
        state.monthsByKey[key] = {
          status: 'error',
          logs: [],
          error: action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' },
        };
      })
      .addCase(submitSymptomLog.pending, (state) => {
        state.submitStatus = 'guardando';
        state.submitError = null;
      })
      .addCase(submitSymptomLog.fulfilled, (state, action) => {
        state.submitStatus = 'idle';
        const occurred = new Date(action.payload.occurredAt);
        const key = monthKey(occurred.getFullYear(), occurred.getMonth());
        const entry = state.monthsByKey[key];
        if (entry) entry.logs = [...entry.logs, action.payload];
      })
      .addCase(submitSymptomLog.rejected, (state, action) => {
        state.submitStatus = 'error';
        state.submitError = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      });
  },
});

export const { draftSymptomTypeSet, draftCustomLabelSet, draftSeveritySet, draftNoteSet, draftReset } =
  symptomsSlice.actions;
export default symptomsSlice.reducer;
