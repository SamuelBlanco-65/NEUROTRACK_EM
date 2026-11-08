import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

type ColorSchemePreference = 'auto' | 'light' | 'dark';

type SettingsState = {
  colorScheme: ColorSchemePreference;
};

const initialState: SettingsState = {
  colorScheme: 'auto',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    colorSchemeChanged(state, action: PayloadAction<ColorSchemePreference>) {
      state.colorScheme = action.payload;
    },
  },
});

export const { colorSchemeChanged } = settingsSlice.actions;
export default settingsSlice.reducer;
