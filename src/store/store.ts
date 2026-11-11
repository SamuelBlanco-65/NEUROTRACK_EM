import { combineReducers, configureStore } from '@reduxjs/toolkit';

import { saveSettings } from '@/features/settings/persistence';
import { resetAll } from './actions';
import activitiesReducer from './slices/activities-slice';
import authReducer from './slices/auth-slice';
import caregiverReducer from './slices/caregiver-slice';
import doctorReducer from './slices/doctor-slice';
import profileReducer from './slices/profile-slice';
import progressReducer from './slices/progress-slice';
import remindersReducer from './slices/reminders-slice';
import settingsReducer from './slices/settings-slice';
import symptomsReducer from './slices/symptoms-slice';

const appReducer = combineReducers({
  auth: authReducer,
  profile: profileReducer,
  settings: settingsReducer,
  symptoms: symptomsReducer,
  activities: activitiesReducer,
  progress: progressReducer,
  caregiver: caregiverReducer,
  doctor: doctorReducer,
  reminders: remindersReducer,
});

// Al terminar la sesión se descartan los datos de salud en memoria: solo se conservan las
// preferencias del dispositivo (`settings`) y `auth`. Los demás slices vuelven a su estado inicial.
const rootReducer: typeof appReducer = (state, action) => {
  if (resetAll.match(action) && state) {
    return appReducer({ settings: state.settings, auth: state.auth } as typeof state, action);
  }
  return appReducer(state, action);
};

export const store = configureStore({ reducer: rootReducer });

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
