import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ProfileKind = 'paciente' | 'cuidador';

type ProfileState = {
  selected: ProfileKind | null;
};

const initialState: ProfileState = {
  selected: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    profileSelected(state, action: PayloadAction<ProfileKind>) {
      state.selected = action.payload;
    },
    profileCleared(state) {
      state.selected = null;
    },
  },
});

export const { profileSelected, profileCleared } = profileSlice.actions;
export default profileSlice.reducer;
