import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  claimDoctorInvite,
  fetchPatientSummaryData,
  getOrCreateDoctorInvite,
  listAcceptedDoctors,
  listDoctorRequests,
  listMyPatients,
  markDoctorViewed,
  regenerateDoctorInvite,
  respondToDoctorRequest,
  revokeDoctorAccess,
} from '@/features/doctor/api';
import { expiresAtFromDuration } from '@/features/doctor/logic';
import type {
  DoctorAccessDuration,
  DoctorError,
  DoctorLink,
  DoctorPermissions,
  PatientSummaryData,
} from '@/features/doctor/types';
import type { RootState } from '@/store/store';

type LoadStatus = 'idle' | 'cargando' | 'listo' | 'error';

const NO_SESSION: DoctorError = { errorClass: 'inesperado', message: 'No hay sesión activa' };
const GENERIC_ERROR: DoctorError = { errorClass: 'inesperado', message: 'Algo salió mal' };

type DoctorState = {
  // Lado paciente: gestiona su invitación para el médico y a quién le da acceso.
  myInvite: DoctorLink | null;
  incomingRequests: DoctorLink[];
  myDoctors: DoctorLink[];
  patientStatus: LoadStatus;
  patientError: DoctorError | null;
  respondingToId: string | null;
  // Lado médico: sus pacientes vinculados.
  myPatients: DoctorLink[];
  doctorStatus: LoadStatus;
  doctorError: DoctorError | null;
  claimStatus: 'idle' | 'enviando' | 'listo' | 'error';
  claimError: DoctorError | null;
  // Resumen del paciente abierto.
  summary: PatientSummaryData | null;
  summaryStatus: LoadStatus;
  summaryError: DoctorError | null;
  /** Id de la última petición de resumen: una respuesta tardía de otro período se descarta. */
  summaryRequestId: string | null;
};

const initialState: DoctorState = {
  myInvite: null,
  incomingRequests: [],
  myDoctors: [],
  patientStatus: 'idle',
  patientError: null,
  respondingToId: null,
  myPatients: [],
  doctorStatus: 'idle',
  doctorError: null,
  claimStatus: 'idle',
  claimError: null,
  summary: null,
  summaryStatus: 'idle',
  summaryError: null,
  summaryRequestId: null,
};

export const fetchPatientDoctorData = createAsyncThunk<
  { invite: DoctorLink; incomingRequests: DoctorLink[]; myDoctors: DoctorLink[] },
  void,
  { state: RootState; rejectValue: DoctorError }
>('doctor/fetchPatientData', async (_, { getState, rejectWithValue }) => {
  const patientId = getState().auth.session?.userId;
  if (!patientId) return rejectWithValue(NO_SESSION);

  try {
    const [invite, incomingRequests, myDoctors] = await Promise.all([
      getOrCreateDoctorInvite(),
      listDoctorRequests(patientId),
      listAcceptedDoctors(patientId),
    ]);
    return { invite, incomingRequests, myDoctors };
  } catch (error) {
    return rejectWithValue(error as DoctorError);
  }
});

export const regenerateMyDoctorInvite = createAsyncThunk<
  DoctorLink,
  void,
  { state: RootState; rejectValue: DoctorError }
>('doctor/regenerateInvite', async (_, { getState, rejectWithValue }) => {
  const inviteId = getState().doctor.myInvite?.id;
  if (!getState().auth.session || !inviteId) {
    return rejectWithValue({ errorClass: 'inesperado', message: 'No hay invitación activa' });
  }

  try {
    return await regenerateDoctorInvite(inviteId);
  } catch (error) {
    return rejectWithValue(error as DoctorError);
  }
});

export const respondToIncomingDoctorRequest = createAsyncThunk<
  DoctorLink,
  { linkId: string; accept: boolean; permissions: DoctorPermissions; duration: DoctorAccessDuration },
  { rejectValue: DoctorError }
>('doctor/respondToRequest', async ({ linkId, accept, permissions, duration }, { rejectWithValue }) => {
  try {
    return await respondToDoctorRequest(linkId, accept, permissions, expiresAtFromDuration(duration));
  } catch (error) {
    return rejectWithValue(error as DoctorError);
  }
});

export const revokeMyDoctor = createAsyncThunk<DoctorLink, string, { rejectValue: DoctorError }>(
  'doctor/revoke',
  async (linkId, { rejectWithValue }) => {
    try {
      return await revokeDoctorAccess(linkId);
    } catch (error) {
      return rejectWithValue(error as DoctorError);
    }
  }
);

export const fetchMyPatients = createAsyncThunk<DoctorLink[], void, { state: RootState; rejectValue: DoctorError }>(
  'doctor/fetchMyPatients',
  async (_, { getState, rejectWithValue }) => {
    const doctorId = getState().auth.session?.userId;
    if (!doctorId) return rejectWithValue(NO_SESSION);

    try {
      return await listMyPatients(doctorId);
    } catch (error) {
      return rejectWithValue(error as DoctorError);
    }
  }
);

export const claimPatientCode = createAsyncThunk<
  DoctorLink,
  { code: string; professionalId: string },
  { state: RootState; rejectValue: DoctorError }
>('doctor/claimCode', async ({ code, professionalId }, { getState, rejectWithValue }) => {
  if (!getState().auth.session) return rejectWithValue(NO_SESSION);

  try {
    return await claimDoctorInvite(code, professionalId);
  } catch (error) {
    return rejectWithValue(error as DoctorError);
  }
});

export const fetchPatientSummary = createAsyncThunk<
  PatientSummaryData,
  { link: DoctorLink; fromISO: string; toISO: string },
  { rejectValue: DoctorError }
>('doctor/fetchSummary', async ({ link, fromISO, toISO }, { rejectWithValue }) => {
  try {
    return await fetchPatientSummaryData(link, fromISO, toISO);
  } catch (error) {
    return rejectWithValue(error as DoctorError);
  }
});

/** «Último acceso» para el paciente. Si falla no estorba al médico: solo se ignora. */
export const markPatientViewed = createAsyncThunk<void, string>('doctor/markViewed', async (linkId) => {
  try {
    await markDoctorViewed(linkId);
  } catch (error) {
    console.warn('[doctor] no se pudo registrar la visita', error);
  }
});

const doctorSlice = createSlice({
  name: 'doctor',
  initialState,
  reducers: {
    claimErrorCleared(state) {
      state.claimError = null;
      state.claimStatus = 'idle';
    },
    summaryCleared(state) {
      state.summary = null;
      state.summaryStatus = 'idle';
      state.summaryError = null;
      state.summaryRequestId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatientDoctorData.pending, (state) => {
        state.patientStatus = 'cargando';
        state.patientError = null;
      })
      .addCase(fetchPatientDoctorData.fulfilled, (state, action) => {
        state.patientStatus = 'listo';
        state.myInvite = action.payload.invite;
        state.incomingRequests = action.payload.incomingRequests;
        state.myDoctors = action.payload.myDoctors;
      })
      .addCase(fetchPatientDoctorData.rejected, (state, action) => {
        state.patientStatus = 'error';
        state.patientError = action.payload ?? GENERIC_ERROR;
      })
      .addCase(regenerateMyDoctorInvite.fulfilled, (state, action) => {
        state.myInvite = action.payload;
      })
      .addCase(respondToIncomingDoctorRequest.pending, (state, action) => {
        state.respondingToId = action.meta.arg.linkId;
        state.patientError = null;
      })
      .addCase(respondToIncomingDoctorRequest.fulfilled, (state, action) => {
        state.respondingToId = null;
        state.incomingRequests = state.incomingRequests.filter((link) => link.id !== action.payload.id);
        if (action.payload.status === 'aceptado') {
          state.myDoctors = [action.payload, ...state.myDoctors];
        }
      })
      .addCase(respondToIncomingDoctorRequest.rejected, (state, action) => {
        state.respondingToId = null;
        state.patientError = action.payload ?? GENERIC_ERROR;
      })
      .addCase(revokeMyDoctor.fulfilled, (state, action) => {
        state.myDoctors = state.myDoctors.filter((link) => link.id !== action.payload.id);
      })
      .addCase(revokeMyDoctor.rejected, (state, action) => {
        state.patientError = action.payload ?? GENERIC_ERROR;
      })
      .addCase(fetchMyPatients.pending, (state) => {
        state.doctorStatus = 'cargando';
        state.doctorError = null;
      })
      .addCase(fetchMyPatients.fulfilled, (state, action) => {
        state.doctorStatus = 'listo';
        state.myPatients = action.payload;
      })
      .addCase(fetchMyPatients.rejected, (state, action) => {
        state.doctorStatus = 'error';
        state.doctorError = action.payload ?? GENERIC_ERROR;
      })
      .addCase(claimPatientCode.pending, (state) => {
        state.claimStatus = 'enviando';
        state.claimError = null;
      })
      .addCase(claimPatientCode.fulfilled, (state, action) => {
        state.claimStatus = 'listo';
        state.myPatients = [action.payload, ...state.myPatients];
      })
      .addCase(claimPatientCode.rejected, (state, action) => {
        state.claimStatus = 'error';
        state.claimError = action.payload ?? GENERIC_ERROR;
      })
      .addCase(fetchPatientSummary.pending, (state, action) => {
        state.summaryStatus = 'cargando';
        state.summaryError = null;
        // Se descartan los datos del período anterior: mostrarlos mientras llegan los nuevos daría
        // cifras de un rango bajo la etiqueta de otro.
        state.summary = null;
        state.summaryRequestId = action.meta.requestId;
      })
      .addCase(fetchPatientSummary.fulfilled, (state, action) => {
        if (state.summaryRequestId !== action.meta.requestId) return;
        state.summaryStatus = 'listo';
        state.summary = action.payload;
      })
      .addCase(fetchPatientSummary.rejected, (state, action) => {
        if (state.summaryRequestId !== action.meta.requestId) return;
        state.summaryStatus = 'error';
        state.summaryError = action.payload ?? GENERIC_ERROR;
      });
  },
});

export const { claimErrorCleared, summaryCleared } = doctorSlice.actions;
export default doctorSlice.reducer;
