import { configureStore } from '@reduxjs/toolkit';
import chatReducer from './chatSlice';
import staffCopilotReducer from './staffCopilotSlice';
import metricsReducer from './metricsSlice';
import uiReducer from './uiSlice';

export const store = configureStore({
  reducer: {
    chat: chatReducer,
    staffCopilot: staffCopilotReducer,
    metrics: metricsReducer,
    ui: uiReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
