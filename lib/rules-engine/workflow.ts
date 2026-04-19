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
    'Reviewing baseline battery diagnostic flow...',
    'The event has been mapped to the default anomaly analysis path.',
    'Recommended action: continue telemetry inspection and capture pack-level fault details.'
  ],
  suggestedReplies: ['Inspect pack telemetry', 'Confirm anomaly severity', 'Recommend system isolation'],
  knowledge: ['Baseline diagnostics are used when no exact rule matches.', 'Fault classification should be captured as early as possible in the analysis flow.'],
  actionLabel: 'Validate fault signature'
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
