import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';

export type MessageSender = 'customer' | 'staff';

export interface StaffMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: string;
}

interface CopilotSliceState {
  isLoading: boolean;
  stepIndex: number;
  currentStep: string;
  response: string | null;
  followUp: string | null;
  error: boolean;
  query: string;
  triggerId: string;
}


interface StaffCopilotState {
  messages: StaffMessage[];
  copilot: CopilotSliceState;
}

const now = Date.now();

const INITIAL_MESSAGES: StaffMessage[] = [
  {
    id: nanoid(),
    sender: 'customer',
    text: 'Voltage spike detected on the rear battery pack during charging. Can the diagnostic window be replayed?',
    timestamp: new Date(now - 300000).toISOString()
  },
  {
    id: nanoid(),
    sender: 'staff',
    text: 'Yes, share the preferred replay window and I will queue the diagnostic run.',
    timestamp: new Date(now - 240000).toISOString()
  },
  {
    id: nanoid(),
    sender: 'customer',
    text: 'Does the field kit include the standard battery mounting hardware?',
    timestamp: new Date(now - 180000).toISOString()
  },
  {
    id: nanoid(),
    sender: 'staff',
    text: 'Yes, the standard mounting kit is included by default for supported battery platforms.',
    timestamp: new Date(now - 120000).toISOString()
  },
  {
    id: nanoid(),
    sender: 'customer',
    text: 'The vehicle controller needs the battery module command format. Do you know which protocol the pack uses?',
    timestamp: new Date(now - 60000).toISOString()
  },
  {
    id: nanoid(),
    sender: 'staff',
    text: 'Let me review the diagnostic references and get back to you.',
    timestamp: new Date(now - 30000).toISOString()
  }
];

const initialCopilot: CopilotSliceState = {
  isLoading: false,
  stepIndex: 0,
  currentStep: '',
  response: null,
  followUp: null,
  error: false,
  query: '',
  triggerId: '',
};

const initialState: StaffCopilotState = {
  messages: INITIAL_MESSAGES,
  copilot: initialCopilot
};

const staffCopilotSlice = createSlice({
  name: 'staffCopilot',
  initialState,
  reducers: {
    addStaffMessage: {
      reducer(state, action: PayloadAction<StaffMessage>) {
        state.messages.push(action.payload);
      },
      prepare(message: Omit<StaffMessage, 'id' | 'timestamp'>) {
        return {
          payload: {
            ...message,
            id: nanoid(),
            timestamp: new Date().toISOString()
          }
        };
      }
    },
    setCopilotQuery(state, action: PayloadAction<string>) {
      state.copilot.query = action.payload;
    },
    triggerCopilot(state, action: PayloadAction<string>) {
      state.copilot.query = action.payload;
      state.copilot.triggerId = nanoid();
    },
    setCopilotLoading(state, action: PayloadAction<boolean>) {
      state.copilot.isLoading = action.payload;
    },
    setCopilotStep(state, action: PayloadAction<{ stepIndex: number; currentStep: string }>) {
      state.copilot.stepIndex = action.payload.stepIndex;
      state.copilot.currentStep = action.payload.currentStep;
    },
    setCopilotResponse(state, action: PayloadAction<{ response: string; followUp: string }>) {
      state.copilot.response = action.payload.response;
      state.copilot.followUp = action.payload.followUp;
      state.copilot.isLoading = false;
      state.copilot.error = false;
    },
    setCopilotError(state) {
      state.copilot.error = true;
      state.copilot.isLoading = false;
    },
    resetCopilot(state) {
      state.copilot.stepIndex = 0;
      state.copilot.currentStep = '';
      state.copilot.response = null;
      state.copilot.followUp = null;
      state.copilot.error = false;
      state.copilot.triggerId = '';
    }
  }
});

export const {
  addStaffMessage,
  setCopilotQuery,
  triggerCopilot,
  setCopilotLoading,
  setCopilotStep,
  setCopilotResponse,
  setCopilotError,
  resetCopilot
} = staffCopilotSlice.actions;

export default staffCopilotSlice.reducer;
