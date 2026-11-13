import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { listActivitySessionsBetween, listAreaProgress } from '@/features/activities/api';
import type { ActivityArea, AreaProgress } from '@/features/activities/types';
import {
  claimInviteCode,
  createObservation,
  fetchLatestUnreadCheer,
  getOrCreatePatientInvite,
  listAcceptedCaregivers,
  listIncomingRequests,
  listMyLinksAsCaregiver,
  listMyObservations,
  markCheerRead,
  regeneratePatientInvite,
  respondToRequest,
  revokeCaregiverAccess,
  sendCheer,
} from '@/features/caregiver/api';
import type {
  CaregiverCheer,
  CaregiverError,
  CaregiverLink,
  CaregiverObservation,
  CaregiverObservationDraft,
  CaregiverPermissions,
} from '@/features/caregiver/types';
import { listSharedSymptomLogs } from '@/features/symptoms/api';
import type { SymptomLog } from '@/features/symptoms/types';
import type { RootState } from '@/store/store';

function startOfWeekISO(): string {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const mondayFirstWeekday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - mondayFirstWeekday);
  return start.toISOString();
}

type LoadStatus = 'idle' | 'cargando' | 'listo' | 'error';

type CaregiverState = {
  // Lado paciente: gestiona su propia invitación y a quién le da acceso.
  myInvite: CaregiverLink | null;
  incomingRequests: CaregiverLink[];
  myCaregivers: CaregiverLink[];
  patientStatus: LoadStatus;
  patientError: CaregiverError | null;
  respondingToId: string | null;
  // Lado cuidador: a quién acompaña y en qué estado va esa relación.
  myLinksAsCaregiver: CaregiverLink[];
  caregiverStatus: LoadStatus;
  caregiverError: CaregiverError | null;
  claimStatus: 'idle' | 'enviando' | 'listo' | 'error';
  claimError: CaregiverError | null;
  // Bitácora privada del cuidador (RF-006).
  myObservations: CaregiverObservation[];
  observationsStatus: LoadStatus;
  observationsError: CaregiverError | null;
  savingObservation: boolean;
  // Mensaje de ánimo visto por el paciente (RF-006).
  latestCheer: CaregiverCheer | null;
  cheerStatus: LoadStatus;
  // Vista del cuidador sobre el progreso de actividades del paciente (RF-006, pantalla Acompañar).
  viewedProgress: AreaProgress[];
  viewedWeekSessionCount: number;
  viewedLastPracticeByArea: Record<ActivityArea, string | null>;
  viewStatus: LoadStatus;
  // Síntomas de la semana del paciente acompañado (sin notas), solo si compartió `share_sintomas`.
  viewedSymptoms: SymptomLog[];
  symptomsStatus: LoadStatus;
};

const initialState: CaregiverState = {
  myInvite: null,
  incomingRequests: [],
  myCaregivers: [],
  patientStatus: 'idle',
  patientError: null,
  respondingToId: null,
  myLinksAsCaregiver: [],
  caregiverStatus: 'idle',
  caregiverError: null,
  claimStatus: 'idle',
  claimError: null,
  myObservations: [],
  observationsStatus: 'idle',
  observationsError: null,
  savingObservation: false,
  latestCheer: null,
  cheerStatus: 'idle',
  viewedProgress: [],
  viewedWeekSessionCount: 0,
  viewedLastPracticeByArea: { memoria: null, atencion: null, logica: null, movimiento: null },
  viewStatus: 'idle',
  viewedSymptoms: [],
  symptomsStatus: 'idle',
};

export const fetchPatientCaregiverData = createAsyncThunk<
  { invite: CaregiverLink; incomingRequests: CaregiverLink[]; myCaregivers: CaregiverLink[] },
  void,
  { state: RootState; rejectValue: CaregiverError }
>('caregiver/fetchPatientData', async (_, { getState, rejectWithValue }) => {
  const patientId = getState().auth.session?.userId;
  if (!patientId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });

  try {
    const [invite, incomingRequests, myCaregivers] = await Promise.all([
      getOrCreatePatientInvite(),
      listIncomingRequests(patientId),
      listAcceptedCaregivers(patientId),
    ]);
    return { invite, incomingRequests, myCaregivers };
  } catch (error) {
    return rejectWithValue(error as CaregiverError);
  }
});

export const regenerateMyInvite = createAsyncThunk<
  CaregiverLink,
  void,
  { state: RootState; rejectValue: CaregiverError }
>('caregiver/regenerateInvite', async (_, { getState, rejectWithValue }) => {
  const patientId = getState().auth.session?.userId;
  const inviteId = getState().caregiver.myInvite?.id;
  if (!patientId || !inviteId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay invitación activa' });

  try {
    return await regeneratePatientInvite(inviteId);
  } catch (error) {
    return rejectWithValue(error as CaregiverError);
  }
});

export const respondToIncomingRequest = createAsyncThunk<
  CaregiverLink,
  { linkId: string; accept: boolean; permissions: CaregiverPermissions },
  { rejectValue: CaregiverError }
>('caregiver/respondToRequest', async ({ linkId, accept, permissions }, { rejectWithValue }) => {
  try {
    return await respondToRequest(linkId, accept, permissions);
  } catch (error) {
    return rejectWithValue(error as CaregiverError);
  }
});

export const revokeMyCaregiver = createAsyncThunk<CaregiverLink, string, { rejectValue: CaregiverError }>(
  'caregiver/revoke',
  async (linkId, { rejectWithValue }) => {
    try {
      return await revokeCaregiverAccess(linkId);
    } catch (error) {
      return rejectWithValue(error as CaregiverError);
    }
  }
);

export const fetchMyLinksAsCaregiver = createAsyncThunk<
  CaregiverLink[],
  void,
  { state: RootState; rejectValue: CaregiverError }
>('caregiver/fetchMyLinksAsCaregiver', async (_, { getState, rejectWithValue }) => {
  const caregiverId = getState().auth.session?.userId;
  if (!caregiverId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });

  try {
    return await listMyLinksAsCaregiver(caregiverId);
  } catch (error) {
    return rejectWithValue(error as CaregiverError);
  }
});

export const claimPatientInviteCode = createAsyncThunk<
  CaregiverLink,
  string,
  { state: RootState; rejectValue: CaregiverError }
>('caregiver/claimCode', async (code, { getState, rejectWithValue }) => {
  if (!getState().auth.session) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });

  try {
    return await claimInviteCode(code);
  } catch (error) {
    return rejectWithValue(error as CaregiverError);
  }
});

export const fetchMyObservations = createAsyncThunk<
  CaregiverObservation[],
  void,
  { state: RootState; rejectValue: CaregiverError }
>('caregiver/fetchMyObservations', async (_, { getState, rejectWithValue }) => {
  const caregiverId = getState().auth.session?.userId;
  if (!caregiverId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });

  try {
    return await listMyObservations(caregiverId);
  } catch (error) {
    return rejectWithValue(error as CaregiverError);
  }
});

export const addObservation = createAsyncThunk<
  CaregiverObservation,
  CaregiverObservationDraft,
  { state: RootState; rejectValue: CaregiverError }
>('caregiver/addObservation', async (draft, { getState, rejectWithValue }) => {
  const caregiverId = getState().auth.session?.userId;
  if (!caregiverId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });

  try {
    return await createObservation(caregiverId, draft);
  } catch (error) {
    return rejectWithValue(error as CaregiverError);
  }
});

export const sendCheerMessage = createAsyncThunk<
  CaregiverCheer,
  { linkId: string; patientId: string; message: string },
  { state: RootState; rejectValue: CaregiverError }
>('caregiver/sendCheer', async ({ linkId, patientId, message }, { getState, rejectWithValue }) => {
  const caregiverId = getState().auth.session?.userId;
  if (!caregiverId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });

  try {
    return await sendCheer(caregiverId, linkId, patientId, message);
  } catch (error) {
    return rejectWithValue(error as CaregiverError);
  }
});

export const fetchMyLatestCheer = createAsyncThunk<
  CaregiverCheer | null,
  void,
  { state: RootState; rejectValue: CaregiverError }
>('caregiver/fetchLatestCheer', async (_, { getState, rejectWithValue }) => {
  const patientId = getState().auth.session?.userId;
  if (!patientId) return rejectWithValue({ errorClass: 'inesperado', message: 'No hay sesión activa' });

  try {
    return await fetchLatestUnreadCheer(patientId);
  } catch (error) {
    return rejectWithValue(error as CaregiverError);
  }
});

export const dismissCheer = createAsyncThunk<string, string, { rejectValue: CaregiverError }>(
  'caregiver/dismissCheer',
  async (cheerId, { rejectWithValue }) => {
    try {
      await markCheerRead(cheerId);
      return cheerId;
    } catch (error) {
      return rejectWithValue(error as CaregiverError);
    }
  }
);

export const fetchCaregiverPatientActivity = createAsyncThunk<
  { progress: AreaProgress[]; weekSessionCount: number; lastPracticeByArea: Record<ActivityArea, string | null> },
  string,
  { rejectValue: CaregiverError }
>('caregiver/fetchPatientActivity', async (patientId, { rejectWithValue }) => {
  try {
    const [progress, sessions] = await Promise.all([
      listAreaProgress(patientId),
      listActivitySessionsBetween(patientId, startOfWeekISO(), new Date().toISOString()),
    ]);
    const lastPracticeByArea: Record<ActivityArea, string | null> = {
      memoria: null,
      atencion: null,
      logica: null,
      movimiento: null,
    };
    for (const session of sessions) {
      const current = lastPracticeByArea[session.area];
      if (!current || session.completedAt > current) {
        lastPracticeByArea[session.area] = session.completedAt;
      }
    }
    return { progress, weekSessionCount: sessions.length, lastPracticeByArea };
  } catch (error) {
    return rejectWithValue(error as CaregiverError);
  }
});

/** Síntomas de la semana en curso del paciente acompañado, vía `shared_symptom_logs` (sin notas). */
export const fetchCaregiverPatientSymptoms = createAsyncThunk<
  SymptomLog[],
  string,
  { rejectValue: CaregiverError }
>('caregiver/fetchPatientSymptoms', async (patientId, { rejectWithValue }) => {
  try {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();
    return await listSharedSymptomLogs(patientId, startOfWeekISO(), endOfToday);
  } catch (error) {
    const known = error as { message?: string };
    return rejectWithValue({
      errorClass: 'servidor',
      message: known.message ?? 'No pudimos cargar los síntomas',
    });
  }
});

const caregiverSlice = createSlice({
  name: 'caregiver',
  initialState,
  reducers: {
    claimErrorCleared(state) {
      state.claimError = null;
      state.claimStatus = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientCaregiverData.pending, (state) => {
        state.patientStatus = 'cargando';
        state.patientError = null;
      })
      .addCase(fetchPatientCaregiverData.fulfilled, (state, action) => {
        state.patientStatus = 'listo';
        state.myInvite = action.payload.invite;
        state.incomingRequests = action.payload.incomingRequests;
        state.myCaregivers = action.payload.myCaregivers;
      })
      .addCase(fetchPatientCaregiverData.rejected, (state, action) => {
        state.patientStatus = 'error';
        state.patientError = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(regenerateMyInvite.fulfilled, (state, action) => {
        state.myInvite = action.payload;
      })
      .addCase(respondToIncomingRequest.pending, (state, action) => {
        state.respondingToId = action.meta.arg.linkId;
      })
      .addCase(respondToIncomingRequest.fulfilled, (state, action) => {
        state.respondingToId = null;
        state.incomingRequests = state.incomingRequests.filter((link) => link.id !== action.payload.id);
        if (action.payload.status === 'aceptado') {
          state.myCaregivers = [action.payload, ...state.myCaregivers];
        }
      })
      .addCase(respondToIncomingRequest.rejected, (state, action) => {
        state.respondingToId = null;
        state.patientError = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(revokeMyCaregiver.fulfilled, (state, action) => {
        state.myCaregivers = state.myCaregivers.filter((link) => link.id !== action.payload.id);
      })
      .addCase(fetchMyLinksAsCaregiver.pending, (state) => {
        state.caregiverStatus = 'cargando';
        state.caregiverError = null;
      })
      .addCase(fetchMyLinksAsCaregiver.fulfilled, (state, action: PayloadAction<CaregiverLink[]>) => {
        state.caregiverStatus = 'listo';
        state.myLinksAsCaregiver = action.payload;
      })
      .addCase(fetchMyLinksAsCaregiver.rejected, (state, action) => {
        state.caregiverStatus = 'error';
        state.caregiverError = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(claimPatientInviteCode.pending, (state) => {
        state.claimStatus = 'enviando';
        state.claimError = null;
      })
      .addCase(claimPatientInviteCode.fulfilled, (state, action) => {
        state.claimStatus = 'listo';
        state.myLinksAsCaregiver = [action.payload, ...state.myLinksAsCaregiver];
      })
      .addCase(claimPatientInviteCode.rejected, (state, action) => {
        state.claimStatus = 'error';
        state.claimError = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(fetchMyObservations.pending, (state) => {
        state.observationsStatus = 'cargando';
        state.observationsError = null;
      })
      .addCase(fetchMyObservations.fulfilled, (state, action) => {
        state.observationsStatus = 'listo';
        state.myObservations = action.payload;
      })
      .addCase(fetchMyObservations.rejected, (state, action) => {
        state.observationsStatus = 'error';
        state.observationsError = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(addObservation.pending, (state) => {
        state.savingObservation = true;
      })
      .addCase(addObservation.fulfilled, (state, action) => {
        state.savingObservation = false;
        state.myObservations = [action.payload, ...state.myObservations];
      })
      .addCase(addObservation.rejected, (state, action) => {
        state.savingObservation = false;
        state.observationsError = action.payload ?? { errorClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(fetchMyLatestCheer.pending, (state) => {
        state.cheerStatus = 'cargando';
      })
      .addCase(fetchMyLatestCheer.fulfilled, (state, action) => {
        state.cheerStatus = 'listo';
        state.latestCheer = action.payload;
      })
      .addCase(fetchMyLatestCheer.rejected, (state) => {
        state.cheerStatus = 'error';
      })
      .addCase(dismissCheer.fulfilled, (state) => {
        state.latestCheer = null;
      })
      .addCase(fetchCaregiverPatientActivity.pending, (state) => {
        state.viewStatus = 'cargando';
      })
      .addCase(fetchCaregiverPatientActivity.fulfilled, (state, action) => {
        state.viewStatus = 'listo';
        state.viewedProgress = action.payload.progress;
        state.viewedWeekSessionCount = action.payload.weekSessionCount;
        state.viewedLastPracticeByArea = action.payload.lastPracticeByArea;
      })
      .addCase(fetchCaregiverPatientActivity.rejected, (state) => {
        state.viewStatus = 'error';
      })
      .addCase(fetchCaregiverPatientSymptoms.pending, (state) => {
        state.symptomsStatus = 'cargando';
      })
      .addCase(fetchCaregiverPatientSymptoms.fulfilled, (state, action) => {
        state.symptomsStatus = 'listo';
        state.viewedSymptoms = action.payload;
      })
      .addCase(fetchCaregiverPatientSymptoms.rejected, (state) => {
        state.symptomsStatus = 'error';
      });
  },
});

export const { claimErrorCleared } = caregiverSlice.actions;
export default caregiverSlice.reducer;
