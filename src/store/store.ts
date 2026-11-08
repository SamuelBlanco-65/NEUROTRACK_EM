import { configureStore } from '@reduxjs/toolkit';

import activitiesReducer from './slices/activities-slice';
import authReducer from './slices/auth-slice';
import profileReducer from './slices/profile-slice';
import progressReducer from './slices/progress-slice';
import settingsReducer from './slices/settings-slice';
import symptomsReducer from './slices/symptoms-slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    settings: settingsReducer,
    symptoms: symptomsReducer,
    activities: activitiesReducer,
    progress: progressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
