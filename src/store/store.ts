import { configureStore } from '@reduxjs/toolkit';

import authReducer from './slices/auth-slice';
import profileReducer from './slices/profile-slice';
import settingsReducer from './slices/settings-slice';
import symptomsReducer from './slices/symptoms-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    settings: settingsReducer,
    symptoms: symptomsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
