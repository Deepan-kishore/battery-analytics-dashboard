import rules from './workflowRules.json';
import type { WorkflowContext } from '@/types/chat';

export type WorkflowResponse = {
  response: string[];
  suggestedReplies: string[];
  knowledge: string[];
  actionLabel: string;
};

const fallback: WorkflowResponse = {
  response: [
    'Reviewing standard handling flow...',
    'The issue has been mapped to an enterprise support path.',
    'Recommended resolution: continue with the customer engagement and capture details.'
  ],
  suggestedReplies: ['Clarify account details', 'Confirm issue severity', 'Offer escalation'],
  knowledge: ['Standard workflows are used when no exact rule matches.', 'Support teams should capture issue classification early.'],
  actionLabel: 'Validate customer intent'
};

export function getWorkflowResponse(context: WorkflowContext): WorkflowResponse {
  const matched = rules.find((rule) =>
    Object.entries(rule.conditions).every(([key, value]) => {
      const typedKey = key as keyof WorkflowContext;
      return context[typedKey] === value;
    })
  );

  return matched ?? fallback;
}
