import { createSlice, nanoid, PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage, ConnectionState, FeedbackRecord, WorkflowContext, SuggestionState } from '@/types/chat';

interface ChatState {
  messages: ChatMessage[];
  connection: ConnectionState;
  latency: number;
  retryCount: number;
  loading: boolean;
  workflowContext: WorkflowContext;
  suggestions: SuggestionState;
  feedback: Record<string, FeedbackRecord>;
}

const initialState: ChatState = {
  messages: [
    {
      id: nanoid(),
      role: 'system',
      text: 'Welcome to Cignaro support. Select a workflow and begin the interaction to trigger enterprise-style handling.',
      timestamp: new Date().toISOString(),
      status: 'sent'
    }
  ],
  connection: 'connected',
  latency: 0,
  retryCount: 0,
  loading: false,
  workflowContext: {
    issueType: 'payment',
    userType: 'basic',
    region: 'US'
  },
  suggestions: {
    replies: ['Ask for transaction ID', 'Confirm account details', 'Request billing statement'],
    knowledge: ['Premium customers get priority review.', 'US billing follows a standard authorization process.'],
    action: 'Review the payment workflow.'
  },
  feedback: {}
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: {
      reducer(state, action: PayloadAction<ChatMessage>) {
        state.messages.push(action.payload);
      },
      prepare(message: Omit<ChatMessage, 'timestamp' | 'id'> & { id?: string }) {
        const id = message.id ?? nanoid();
        return {
          payload: {
            ...message,
            id,
            timestamp: new Date().toISOString()
          }
        };
      }
    },
    updateMessageText(state, action: PayloadAction<{ id: string; text: string }>) {
      const item = state.messages.find((message) => message.id === action.payload.id);
      if (item) {
        item.text = action.payload.text;
      }
    },
    markMessageStatus(state, action: PayloadAction<{ id: string; status: ChatMessage['status'] }>) {
      const item = state.messages.find((message) => message.id === action.payload.id);
      if (item) {
        item.status = action.payload.status;
      }
    },
    setConnection(state, action: PayloadAction<ConnectionState>) {
      state.connection = action.payload;
    },
    setLatency(state, action: PayloadAction<number>) {
      state.latency = action.payload;
    },
    incrementRetry(state) {
      state.retryCount += 1;
    },
    resetRetry(state) {
      state.retryCount = 0;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setWorkflowContext(state, action: PayloadAction<WorkflowContext>) {
      state.workflowContext = action.payload;
    },
    setSuggestions(state, action: PayloadAction<SuggestionState>) {
      state.suggestions = action.payload;
    },
    recordFeedback(state, action: PayloadAction<{ messageId: string; feedback: FeedbackRecord }>) {
      state.feedback[action.payload.messageId] = action.payload.feedback;
    }
  }
});

export const {
  addMessage,
  updateMessageText,
  markMessageStatus,
  setConnection,
  setLatency,
  incrementRetry,
  resetRetry,
  setLoading,
  setWorkflowContext,
  setSuggestions,
  recordFeedback
} = chatSlice.actions;

export default chatSlice.reducer;
