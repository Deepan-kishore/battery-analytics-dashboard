'use client';

import type { SuggestionState, WorkflowContext } from '@/types/chat';

interface CopilotPanelProps {
  suggestions: SuggestionState;
  workflowContext: WorkflowContext;
  onSendReply?: (reply: string) => void;
  onWorkflowContextChange?: (context: WorkflowContext) => void;
  failureModeEnabled?: boolean;
  onFailureModeChange?: (enabled: boolean) => void;
  connection?: string;
  latency?: number;
  retryCount?: number;
}

export default function CopilotPanel({ 
  suggestions, 
  workflowContext, 
  onSendReply,
  onWorkflowContextChange,
  failureModeEnabled = false,
  onFailureModeChange,
  connection = 'connected',
  latency = 0,
  retryCount = 0
}: CopilotPanelProps) {
  
  const handleIssueTypeChange = (issueType: string) => {
    onWorkflowContextChange?.({
      ...workflowContext,
      issueType: issueType as 'payment' | 'technical'
    });
  };

  const handleUserTypeChange = (userType: string) => {
    onWorkflowContextChange?.({
      ...workflowContext,
      userType: userType as 'premium' | 'basic'
    });
  };

  const handleRegionChange = (region: string) => {
    onWorkflowContextChange?.({
      ...workflowContext,
      region: region as 'IN' | 'US'
    });
  };

  const connectionColor = connection === 'connected' ? 'text-green-600' : 'text-red-600';

  return (
    <aside className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4">
        <p className="text-sm uppercase tracking-[0.25em] text-slate-500">Copilot briefing</p>
        <h2 className="mt-3 text-xl font-semibold text-slate-900">Next best actions</h2>
      </div>

      <div className="space-y-4">
        {/* Connection Status */}
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Connection status</p>
          <div className="mt-3 flex items-center gap-2">
            <div className={`h-2.5 w-2.5 rounded-full ${connectionColor === 'text-green-600' ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={`text-sm font-medium ${connectionColor}`}>
              {connection === 'connected' ? 'Live connection' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Workflow Context Input */}
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Workflow context</p>
          <div className="mt-3 space-y-2">
            <label className="block text-sm text-slate-700">
              Issue type
              <select
                value={workflowContext.issueType}
                onChange={(e) => handleIssueTypeChange(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="payment">Payment</option>
                <option value="technical">Technical</option>
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              User type
              <select
                value={workflowContext.userType}
                onChange={(e) => handleUserTypeChange(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="premium">Premium</option>
                <option value="basic">Basic</option>
              </select>
            </label>
            <label className="block text-sm text-slate-700">
              Region
              <select
                value={workflowContext.region}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
              >
                <option value="US">US</option>
                <option value="IN">IN</option>
              </select>
            </label>
          </div>
        </div>

        {/* Observability */}
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Observability</p>
          <div className="mt-3 space-y-2 text-sm text-slate-700">
            <div className="flex justify-between">
              <span className="uppercase tracking-[0.15em] text-xs">Connection</span>
              <span className="font-semibold">{connection}</span>
            </div>
            <div className="flex justify-between">
              <span className="uppercase tracking-[0.15em] text-xs">Latency</span>
              <span className="font-semibold">{latency} ms</span>
            </div>
            <div className="flex justify-between">
              <span className="uppercase tracking-[0.15em] text-xs">Retry Count</span>
              <span className="font-semibold">{retryCount}</span>
            </div>
            <label className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
              <span className="text-sm font-medium text-slate-700">Enable failure mode</span>
              <input
                type="checkbox"
                checked={failureModeEnabled}
                onChange={(event) => onFailureModeChange?.(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-400"
              />
            </label>
          </div>
        </div>

        {/* Suggested Replies */}
        <div className="rounded-3xl bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Suggested replies</p>
          <ul className="mt-3 space-y-2">
            {suggestions.replies.map((reply) => (
              <li key={reply}>
                <button
                  onClick={() => onSendReply?.(reply)}
                  className="w-full rounded-2xl bg-white px-3 py-2 text-left text-sm text-slate-700 shadow-sm transition hover:bg-slate-50 hover:shadow-md active:bg-slate-100"
                  type="button"
                  aria-label={`Send reply: ${reply}`}
                >
                  {reply}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
