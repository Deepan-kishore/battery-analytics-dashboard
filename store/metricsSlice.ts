import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import type { ConnectionState } from '@/types/chat';

export type MetricsFlowStep = 'user' | 'copilot' | 'workflow' | 'response';
export type MetricsKnowledgeStep = 'data' | 'context' | 'decision' | 'response';
export type MetricsWorkflowStep = 'intent' | 'routing' | 'output';
export type MetricsLogTone = 'neutral' | 'warn' | 'error' | 'success';

export interface MetricsLogEntry {
  id: string;
  label: string;
  tone: MetricsLogTone;
  timestamp: string;
}

interface MetricsState {
  messageCount: number;
  avgResponseTime: number;
  responseSampleCount: number;
  connection: {
    status: ConnectionState;
    retryCount: number;
  };
  logs: MetricsLogEntry[];
  flow: {
    currentStep: MetricsFlowStep;
    workflowStep: MetricsWorkflowStep;
    knowledgeStep: MetricsKnowledgeStep;
    activeInput: string;
  };
}

const initialState: MetricsState = {
  messageCount: 0,
  avgResponseTime: 0,
  responseSampleCount: 0,
  connection: {
    status: 'connected',
    retryCount: 0
  },
  logs: [
    {
      id: nanoid(),
      label: 'Metrics stream initialized',
      tone: 'success',
      timestamp: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  ],
  flow: {
    currentStep: 'user',
    workflowStep: 'intent',
    knowledgeStep: 'data',
    activeInput: 'Waiting for activity'
  }
};

const metricsSlice = createSlice({
  name: 'metrics',
  initialState,
  reducers: {
    recordMessageProcessed(state) {
      state.messageCount += 1;
    },
    recordResponseTime(state, action: PayloadAction<number>) {
      const nextCount = state.responseSampleCount + 1;
      const total = state.avgResponseTime * state.responseSampleCount + action.payload;
      state.responseSampleCount = nextCount;
      state.avgResponseTime = Math.round(total / nextCount);
    },
    setMetricsConnectionStatus(state, action: PayloadAction<ConnectionState>) {
      state.connection.status = action.payload;
      if (action.payload === 'connected') {
        state.connection.retryCount = 0;
      }
    },
    setMetricsRetryCount(state, action: PayloadAction<number>) {
      state.connection.retryCount = action.payload;
    },
    appendMetricsLog(state, action: PayloadAction<{ label: string; tone?: MetricsLogTone }>) {
      state.logs.push({
        id: nanoid(),
        label: action.payload.label,
        tone: action.payload.tone ?? 'neutral',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      });

      if (state.logs.length > 20) {
        state.logs = state.logs.slice(-20);
      }
    },
    setMetricsFlowStep(state, action: PayloadAction<MetricsFlowStep>) {
      state.flow.currentStep = action.payload;
    },
    setMetricsWorkflowStep(state, action: PayloadAction<MetricsWorkflowStep>) {
      state.flow.workflowStep = action.payload;
    },
    setMetricsKnowledgeStep(state, action: PayloadAction<MetricsKnowledgeStep>) {
      state.flow.knowledgeStep = action.payload;
    },
    setMetricsActiveInput(state, action: PayloadAction<string>) {
      state.flow.activeInput = action.payload;
    }
  }
});

export const {
  recordMessageProcessed,
  recordResponseTime,
  setMetricsConnectionStatus,
  setMetricsRetryCount,
  appendMetricsLog,
  setMetricsFlowStep,
  setMetricsWorkflowStep,
  setMetricsKnowledgeStep,
  setMetricsActiveInput
} = metricsSlice.actions;

export default metricsSlice.reducer;