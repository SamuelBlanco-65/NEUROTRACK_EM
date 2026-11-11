import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import {
  consumeAuthLink,
  deleteAccount,
  getActiveSession,
  setNewPassword,
  signIn,
  signOut,
  signUp,
} from '@/features/auth/api';
import type { AuthError, Session } from '@/features/auth/types';

type AuthStatus = 'bootstrapping' | 'unauthenticated' | 'authenticating' | 'authenticated';

/** Flujo de los enlaces que llegan por correo (confirmar cuenta / recuperar contraseña). */
type LinkFlowStatus = 'idle' | 'verificando' | 'listo' | 'error' | 'guardando' | 'hecho';

type LinkFlow = {
  status: LinkFlowStatus;
  message: string | null;
  /** Último enlace procesado: el `code` es de un solo uso, así que no se canjea dos veces. */
  handledUrl: string | null;
};

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  error: AuthError | null;
  pendingConfirmationEmail: string | null;
  linkFlow: LinkFlow;
};

const initialState: AuthState = {
  status: 'bootstrapping',
  session: null,
  error: null,
  pendingConfirmationEmail: null,
  linkFlow: { status: 'idle', message: null, handledUrl: null },
};

export const bootstrapSession = createAsyncThunk<Session | null>('auth/bootstrap', async () => {
  try {
    return await getActiveSession();
  } catch {
    return null;
  }
});

export const login = createAsyncThunk<Session, { email: string; password: string }, { rejectValue: AuthError }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      return await signIn(email, password);
    } catch (error) {
      return rejectWithValue(error as AuthError);
    }
  }
);

export const register = createAsyncThunk<
  Session | null,
  { name: string; email: string; password: string },
  { rejectValue: AuthError }
>('auth/register', async ({ name, email, password }, { rejectWithValue }) => {
  try {
    return await signUp(name, email, password);
  } catch (error) {
    return rejectWithValue(error as AuthError);
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await signOut();
});

export const removeAccount = createAsyncThunk<void, void, { rejectValue: AuthError }>(
  'auth/removeAccount',
  async (_, { rejectWithValue }) => {
    try {
      await deleteAccount();
    } catch (error) {
      return rejectWithValue(error as AuthError);
    }
  }
);

export const openAuthLink = createAsyncThunk<void, string, { state: { auth: AuthState }; rejectValue: AuthError }>(
  'auth/openLink',
  async (url, { rejectWithValue }) => {
    try {
      await consumeAuthLink(url);
    } catch (error) {
      return rejectWithValue(error as AuthError);
    }
  },
  { condition: (url, { getState }) => getState().auth.linkFlow.handledUrl !== url }
);

export const changePasswordFromLink = createAsyncThunk<void, string, { rejectValue: AuthError }>(
  'auth/changePasswordFromLink',
  async (password, { rejectWithValue }) => {
    try {
      await setNewPassword(password);
    } catch (error) {
      return rejectWithValue(error as AuthError);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authErrorCleared(state) {
      state.error = null;
    },
    sessionEnded(state) {
      state.session = null;
      state.status = 'unauthenticated';
    },
    confirmationNoticeCleared(state) {
      state.pendingConfirmationEmail = null;
    },
    linkFlowReset(state) {
      state.linkFlow = { status: 'idle', message: null, handledUrl: null };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapSession.fulfilled, (state, action) => {
        state.session = action.payload;
        state.status = action.payload ? 'authenticated' : 'unauthenticated';
      })
      .addCase(login.pending, (state) => {
        state.status = 'authenticating';
        state.error = null;
        state.pendingConfirmationEmail = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.session = action.payload;
        state.status = 'authenticated';
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload ?? { authClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(register.pending, (state) => {
        state.status = 'authenticating';
        state.error = null;
        state.pendingConfirmationEmail = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.session = action.payload;
        if (action.payload) {
          state.status = 'authenticated';
        } else {
          state.status = 'unauthenticated';
          state.pendingConfirmationEmail = action.meta.arg.email;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'unauthenticated';
        state.error = action.payload ?? { authClass: 'inesperado', message: 'Algo salió mal' };
      })
      .addCase(logout.fulfilled, (state) => {
        state.session = null;
        state.status = 'unauthenticated';
      })
      .addCase(removeAccount.fulfilled, (state) => {
        state.session = null;
        state.status = 'unauthenticated';
      })
      .addCase(openAuthLink.pending, (state, action) => {
        state.linkFlow = { status: 'verificando', message: null, handledUrl: action.meta.arg };
      })
      .addCase(openAuthLink.fulfilled, (state) => {
        state.linkFlow.status = 'listo';
      })
      .addCase(openAuthLink.rejected, (state, action) => {
        if (action.meta.condition) return; // enlace ya procesado: no se toca el estado
        state.linkFlow.status = 'error';
        state.linkFlow.message = action.payload?.message ?? 'No pudimos abrir el enlace';
      })
      .addCase(changePasswordFromLink.pending, (state) => {
        state.linkFlow.status = 'guardando';
        state.linkFlow.message = null;
      })
      .addCase(changePasswordFromLink.fulfilled, (state) => {
        state.linkFlow.status = 'hecho';
      })
      .addCase(changePasswordFromLink.rejected, (state, action) => {
        // Se vuelve al formulario con el motivo; el enlace sigue abierto para reintentar.
        state.linkFlow.status = 'listo';
        state.linkFlow.message = action.payload?.message ?? 'No pudimos cambiar la contraseña';
      });
  },
});

export const { authErrorCleared, sessionEnded, confirmationNoticeCleared, linkFlowReset } = authSlice.actions;
export default authSlice.reducer;
