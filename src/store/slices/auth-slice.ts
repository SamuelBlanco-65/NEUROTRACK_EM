import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import { getActiveSession, signIn, signOut, signUp } from '@/features/auth/api';
import type { AuthError, Session } from '@/features/auth/types';

type AuthStatus = 'bootstrapping' | 'unauthenticated' | 'authenticating' | 'authenticated';

type AuthState = {
  status: AuthStatus;
  session: Session | null;
  error: AuthError | null;
  pendingConfirmationEmail: string | null;
};

const initialState: AuthState = {
  status: 'bootstrapping',
  session: null,
  error: null,
  pendingConfirmationEmail: null,
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
      });
  },
});

export const { authErrorCleared, sessionEnded, confirmationNoticeCleared } = authSlice.actions;
export default authSlice.reducer;
