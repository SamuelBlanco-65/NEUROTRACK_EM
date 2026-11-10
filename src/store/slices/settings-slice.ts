import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { loadSettings } from '@/features/settings/persistence';

export type ColorSchemePreference = 'auto' | 'light' | 'dark';
export type TextScalePreference = 'normal' | 'grande' | 'extra-grande';

/** Forma persistida en disco (ver `features/settings/persistence.ts`); no incluye `_hydrated`. */
export type SettingsState = {
  colorScheme: ColorSchemePreference;
  highContrast: boolean;
  reduceMotion: boolean;
  textScale: TextScalePreference;
};

type SettingsSliceState = SettingsState & { _hydrated: boolean };

export const DEFAULT_SETTINGS: SettingsState = {
  colorScheme: 'auto',
  highContrast: false,
  reduceMotion: false,
  textScale: 'normal',
};

export const TEXT_SCALE_MULTIPLIER: Record<TextScalePreference, number> = {
  normal: 1,
  grande: 1.15,
  'extra-grande': 1.3,
};

/** Carga las preferencias guardadas en este dispositivo (no son datos de salud, van sin cifrar). */
export const hydrateSettings = createAsyncThunk('settings/hydrate', async () => {
  return loadSettings();
});

const initialState: SettingsSliceState = { ...DEFAULT_SETTINGS, _hydrated: false };

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    colorSchemeChanged(state, action: PayloadAction<ColorSchemePreference>) {
      state.colorScheme = action.payload;
    },
    highContrastToggled(state) {
      state.highContrast = !state.highContrast;
    },
    reduceMotionToggled(state) {
      state.reduceMotion = !state.reduceMotion;
    },
    textScaleChanged(state, action: PayloadAction<TextScalePreference>) {
      state.textScale = action.payload;
    },
    settingsReset(state) {
      Object.assign(state, DEFAULT_SETTINGS);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateSettings.fulfilled, (state, action) => {
        if (action.payload) Object.assign(state, action.payload);
        state._hydrated = true;
      })
      .addCase(hydrateSettings.rejected, (state) => {
        state._hydrated = true;
      });
  },
});

export const { colorSchemeChanged, highContrastToggled, reduceMotionToggled, textScaleChanged, settingsReset } =
  settingsSlice.actions;
export default settingsSlice.reducer;
