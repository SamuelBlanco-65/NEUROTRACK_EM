import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { createReminder, listReminders, markReminderDone } from '@/features/reminders/api';
import type { Reminder, ReminderDraft, RemindersError } from '@/features/reminders/types';
import type { RootState } from '@/store/store';

type RemindersState = {
  items: Reminder[];
  status: 'idle' | 'cargando' | 'listo' | 'error';
  error: RemindersError | null;
  creating: boolean;
};

const initialState: RemindersState = {
  items: [],
  status: 'idle',
  error: null,
  creating: false,
};

/** `patientId` explícito: el cuidador consulta los recordatorios del paciente que acompaña, no los propios. */
export const fetchReminders = createAsyncThunk<Reminder[], string, { rejectValue: RemindersError }>(
  'reminders/fetch',
  async (patientId, { rejectWithValue }) => {
    try {
      return await listReminders(patientId);
    } catch (error) {
      return rejectWithValue(error as RemindersError);
    }
  }
);

export const addReminder = createAsyncThunk<
  Reminder,
  ReminderDraft,
  { state: RootState; rejectValue: RemindersError }
>('reminders/add', async (draft, { getState, rejectWithValue }) => {
  const createdBy = getState().auth.session?.userId;
  if (!createdBy) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });

  try {
    return await createReminder(createdBy, draft);
  } catch (error) {
    return rejectWithValue(error as RemindersError);
  }
});

export const completeReminder = createAsyncThunk<Reminder, string, { rejectValue: RemindersError }>(
  'reminders/complete',
  async (reminderId, { rejectWithValue }) => {
    try {
      return await markReminderDone(reminderId);
    } catch (error) {
      return rejectWithValue(error as RemindersError);
    }
  }
);

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReminders.pending, (state) => {
        state.status = 'cargando';
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.status = 'listo';
        state.items = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(addReminder.pending, (state) => {
        state.creating = true;
      })
      .addCase(addReminder.fulfilled, (state, action) => {
        state.creating = false;
        state.items = [...state.items, action.payload].sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
      })
      .addCase(addReminder.rejected, (state, action) => {
        state.creating = false;
        state.error = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(completeReminder.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      });
  },
});

export default remindersSlice.reducer;
