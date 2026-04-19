'use client';

import { useRef, useState, useEffect } from 'react';
import { Sparkles, Copy, SendHorizonal, MoreHorizontal, Search } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  addStaffMessage,
  setCopilotLoading,
  setCopilotQuery,
  setCopilotStep,
  setCopilotResponse,
  setCopilotError,
  resetCopilot,
  triggerCopilot
} from '@/store/staffCopilotSlice';
import {
  appendMetricsLog,
  recordMessageProcessed,
  recordResponseTime,
  setMetricsActiveInput,
  setMetricsFlowStep,
  setMetricsKnowledgeStep,
  setMetricsWorkflowStep
} from '@/store/metricsSlice';

const THINKING_STEPS = [
  'Ingesting telemetry traces...',
  'Analyzing battery event...',
  'Triggering diagnostic model...',
  'Generating prediction...'
];

function getMockResponse(lastCustomerText: string): { response: string; followUp: string } {
  const lower = lastCustomerText.toLowerCase();

  if (lower.includes('reschedule')) {
    return {
      response:
        'Diagnostic summary: the event window can be reprocessed in the next available analysis slot tomorrow between 10 AM and 12 PM. The system can queue a fresh telemetry replay for the vehicle immediately.',
      followUp: 'Would you like me to schedule a replay and notify the operations team?'
    };
  }

  if (lower.includes('brackets') || lower.includes('mounting')) {
    return {
      response:
        'Diagnostic summary: the standard battery service kit includes the default mounting hardware and vibration isolation components used for most supported vehicle platforms.',
      followUp: 'Would you like me to verify whether this vehicle requires a specialized mounting assembly?'
    };
  }

  if (lower.includes('ir') || lower.includes('protocol')) {
    return {
      response:
        'Suggested diagnostic output based on current telemetry:\nThe battery control path is broadcasting a 32-bit control frame with thermal commands encoded in the final 8 bits. I can also provide the complete command map if needed.',
      followUp: 'Note: This is a demo. Predictions are fixed to simulate observability workflows.'
    };
  }

  return {
    response:
      'Based on the latest battery event, I recommend checking the diagnostic knowledge base for similar fault signatures and preparing a detailed mitigation plan.',
    followUp: 'Would you like me to search for similar resolved battery events?'
  };
}

export default function StaffCopilotPanel() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.staffCopilot.messages);
  const copilot = useAppSelector((state) => state.staffCopilot.copilot);
  const [inputText, setInputText] = useState('');
  const [copied, setCopied] = useState(false);
  const retryQueryRef = useRef<string>('');

  useEffect(() => {
    if (copilot.triggerId && !copilot.isLoading) {
      runCopilot(copilot.query);
    }
  }, [copilot.triggerId]);

  async function runCopilot(query: string) {
    const startedAt = performance.now();
    retryQueryRef.current = query;

    // Reset previous result, set query + loading
    dispatch(resetCopilot());
    dispatch(setCopilotQuery(query));
    dispatch(setCopilotLoading(true));
    dispatch(setMetricsActiveInput(query));
    dispatch(setMetricsFlowStep('user'));
    dispatch(setMetricsWorkflowStep('intent'));
    dispatch(setMetricsKnowledgeStep('data'));
    dispatch(appendMetricsLog({ label: `Telemetry event received: ${query}` }));

    // Get the last system event from the left panel
    const lastCustomerMsg = [...messages].reverse().find((m) => m.sender === 'customer');

    dispatch(setMetricsFlowStep('copilot'));
    dispatch(setMetricsKnowledgeStep('context'));
    dispatch(appendMetricsLog({ label: 'Diagnostic model triggered' }));

    // Cycle through thinking steps (~800ms each ≈ 3.2s total)
    for (let i = 0; i < THINKING_STEPS.length; i++) {
      dispatch(setCopilotStep({ stepIndex: i, currentStep: THINKING_STEPS[i] }));
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
    }

    dispatch(setMetricsFlowStep('workflow'));
    dispatch(setMetricsWorkflowStep('routing'));
    dispatch(setMetricsKnowledgeStep('decision'));
    dispatch(appendMetricsLog({ label: 'Diagnostic model triggered -> operator guidance' }));

    // 5% failure rate
    if (Math.random() < 0.05) {
      dispatch(setCopilotError());
      dispatch(appendMetricsLog({ label: 'Fallback diagnostic model engaged', tone: 'error' }));
      return;
    }

    const { response, followUp } = getMockResponse(lastCustomerMsg?.text ?? '');
    dispatch(setCopilotResponse({ response, followUp }));
    dispatch(setMetricsFlowStep('response'));
    dispatch(setMetricsWorkflowStep('output'));
    dispatch(setMetricsKnowledgeStep('response'));
    dispatch(recordMessageProcessed());
    dispatch(recordResponseTime(Math.round(performance.now() - startedAt)));
    dispatch(appendMetricsLog({ label: 'Prediction generated', tone: 'success' }));
    dispatch(appendMetricsLog({ label: 'Voltage irregularity detected' }));
  }

  function handleSend() {
    if (!inputText.trim() || copilot.isLoading) return;
    dispatch(recordMessageProcessed());
    runCopilot(inputText.trim());
    setInputText('');
  }

  function handleSendInChat() {
    if (!copilot.response) return;
    dispatch(addStaffMessage({ sender: 'staff', text: copilot.response }));
  }

  async function handleCopy() {
    if (!copilot.response) return;
    await navigator.clipboard.writeText(copilot.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleRetry() {
    if (retryQueryRef.current) {
      runCopilot(retryQueryRef.current);
    }
  }

  const showResponse = !copilot.isLoading && copilot.response !== null && !copilot.error;
  const showDefaultPrompt = !copilot.isLoading && !copilot.response && !copilot.error;
  const defaultPrompt = 'Ask for guidance on this battery event and I’ll help craft a diagnostic response.';

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Sparkles size={18} className="text-yellow-400" fill="currentColor" />
          <span className="font-semibold text-slate-900 text-base">Diagnostics Copilot</span>
        </div>
        <button
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
        {/* Diagnostic query bubble — shown once query is set */}
        {copilot.query && (
          <div className="flex justify-end">
            <div className="max-w-[80%] bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm text-slate-800 leading-relaxed">
              {copilot.query}
            </div>
          </div>
        )}

        {/* Thinking indicator — single step, replaces previous */}
        {copilot.isLoading && copilot.currentStep && (
          <div className="flex items-center gap-2 text-slate-400 text-sm">
            <Search size={14} className="flex-shrink-0" />
            <span>{copilot.currentStep}</span>
          </div>
        )}

        {/* Initial diagnostics prompt */}
        {showDefaultPrompt && (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-700">
            {defaultPrompt}
          </div>
        )}

        {/* Completed trace + response cards */}
        {showResponse && (
          <>
            {/* Diagnostic trace */}
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Search size={14} className="flex-shrink-0" />
              <span>diagnostic trace captured</span>
            </div>

            {/* Main response card */}
            <div className="bg-slate-100 rounded-2xl px-4 py-4 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
              {copilot.response}
            </div>

            {/* Follow-up card */}
            {copilot.followUp && (
              <div className="bg-slate-100 rounded-2xl px-4 py-4 text-sm text-slate-800 leading-relaxed">
                {copilot.followUp}
              </div>
            )}
          </>
        )}

        {/* Error state */}
        {copilot.error && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-rose-500">Failed to generate diagnostic prediction</p>
            <button
              onClick={handleRetry}
              type="button"
              className="self-start bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-slate-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Action Bar — visible only when response is ready */}
      {showResponse && (
        <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-5">
          <button
            onClick={handleCopy}
            type="button"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Copy diagnostic output"
          >
            <Copy size={15} />
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <button
            onClick={handleSendInChat}
            type="button"
            className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
            aria-label="Send diagnostic output to event log"
          >
            <SendHorizonal size={15} />
            <span>Send to event log</span>
          </button>
        </div>
      )}

      {/* Diagnostics Input */}
      <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-3">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Ask diagnostics copilot..."
          disabled={copilot.isLoading}
          aria-label="Ask diagnostics copilot"
          className="flex-1 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none disabled:opacity-50"
        />
        <button
          onClick={handleSend}
          disabled={copilot.isLoading || !inputText.trim()}
          type="button"
          aria-label="Send to diagnostics copilot"
          className="flex-shrink-0 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 transition-colors text-slate-700 rounded-full p-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SendHorizonal size={16} />
        </button>
      </div>
    </div>
  );
}
