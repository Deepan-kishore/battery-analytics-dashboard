import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  sidebarOpen: boolean;
  recentChatsOpen: boolean;
}

const initialState: UIState = {
  sidebarOpen: true,
  recentChatsOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setRecentChatsOpen(state, action: PayloadAction<boolean>) {
      state.recentChatsOpen = action.payload;
    },
    toggleRecentChats(state) {
      state.recentChatsOpen = !state.recentChatsOpen;
    },
  },
});

export const { setSidebarOpen, toggleSidebar, setRecentChatsOpen, toggleRecentChats } = uiSlice.actions;
export default uiSlice.reducer;
