import { configureStore } from '@reduxjs/toolkit';

import profileReducer from './slices/profile-slice';
import settingsReducer from './slices/settings-slice';

export const store = configureStore({
  reducer: {
    profile: profileReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
