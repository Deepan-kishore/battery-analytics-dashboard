export type MessageRole = 'user' | 'system' | 'agent';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  text: string;
  timestamp: string;
  status?: 'pending' | 'failed' | 'sent';
  audioUrl?: string;
  isThinking?: boolean;
}

export type ConnectionState = 'connected' | 'disconnected' | 'reconnecting';

export type FeedbackRecord = 'up' | 'down';

export interface WorkflowContext {
  issueType: 'payment' | 'technical';
  userType: 'premium' | 'basic';
  region: 'IN' | 'US';
}

export interface SuggestionState {
  replies: string[];
  knowledge: string[];
  action: string;
}
