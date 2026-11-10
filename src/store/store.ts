import { configureStore } from '@reduxjs/toolkit';

import { saveSettings } from '@/features/settings/persistence';
import activitiesReducer from './slices/activities-slice';
import authReducer from './slices/auth-slice';
import caregiverReducer from './slices/caregiver-slice';
import profileReducer from './slices/profile-slice';
import progressReducer from './slices/progress-slice';
import remindersReducer from './slices/reminders-slice';
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
    caregiver: caregiverReducer,
    reminders: remindersReducer,
  },
});

// Persiste las preferencias de accesibilidad/apariencia en este dispositivo cada vez que cambian
// (hidratadas al abrir la app en src/app/_layout.tsx vía `hydrateSettings`).
let lastPersistedSettings = store.getState().settings;
store.subscribe(() => {
  const settings = store.getState().settings;
  if (settings !== lastPersistedSettings) {
    lastPersistedSettings = settings;
    saveSettings(settings);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
