'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
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
} from '@/store/chatSlice';
import {
  appendMetricsLog,
  recordMessageProcessed,
  recordResponseTime,
  setMetricsActiveInput,
  setMetricsConnectionStatus,
  setMetricsFlowStep,
  setMetricsKnowledgeStep,
  setMetricsRetryCount,
  setMetricsWorkflowStep
} from '@/store/metricsSlice';
import { getWorkflowResponse } from '@/lib/rules-engine/workflow';
import { MockSocket } from '@/lib/websocket/mockSocket';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import CopilotPanel from '@/modules/copilot/CopilotPanel';
import ConnectionBanner from '@/components/ConnectionBanner';

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
const randomBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export default function ChatConsole() {
  const dispatch = useAppDispatch();
  const { messages, connection, latency, retryCount, loading, workflowContext, suggestions, feedback } = useAppSelector(
    (state) => state.chat
  );
  const socketRef = useRef<MockSocket | null>(null);
  const retryTextRef = useRef<string>('');
  const [lastInteraction, setLastInteraction] = useState('Ready to process live battery telemetry.');
  const [failureModeEnabled, setFailureModeEnabled] = useState(false);

  function updateObservedLatency(startedAt: number) {
    dispatch(setLatency(Math.round(performance.now() - startedAt)));
  }

  async function waitWithLatency(ms: number, startedAt: number) {
    await wait(ms);
    updateObservedLatency(startedAt);
  }

  async function handleEscalation(stepId: string, startedAt: number) {
    dispatch(updateMessageText({ id: stepId, text: 'Diagnostic prediction failed. Escalating to system operator...' }));
    dispatch(markMessageStatus({ id: stepId, status: 'failed' }));
    dispatch(addMessage({
      role: 'system',
      text: 'Escalating this battery event to a system operator for further analysis.',
      status: 'sent'
    }));
    dispatch(recordMessageProcessed());
    dispatch(recordResponseTime(Math.round(performance.now() - startedAt)));
    dispatch(appendMetricsLog({ label: 'Operator escalation triggered', tone: 'error' }));
    dispatch(setMetricsFlowStep('response'));
    dispatch(setMetricsWorkflowStep('output'));
    dispatch(setMetricsKnowledgeStep('response'));
    updateObservedLatency(startedAt);
    dispatch(setLoading(false));
    setLastInteraction('Operator escalation path triggered.');
  }

  async function runFailureScenario(stepId: string, startedAt: number) {
    dispatch(appendMetricsLog({ label: 'Battery fault simulation triggered', tone: 'warn' }));

    const scenario = randomBetween(0, 2);

    if (scenario === 0) {
      const retryAttempts = randomBetween(1, 2);

      for (let attempt = 1; attempt <= retryAttempts; attempt += 1) {
        dispatch(incrementRetry());
        dispatch(setMetricsRetryCount(attempt));
        dispatch(updateMessageText({ id: stepId, text: `Reconnecting telemetry pipeline (${attempt}/3)...` }));
        dispatch(appendMetricsLog({ label: `Reconnection attempt initiated (${attempt}/3)`, tone: 'warn' }));
        await waitWithLatency(randomBetween(2000, 4000), startedAt);
      }

      if (Math.random() < 0.5) {
        await handleEscalation(stepId, startedAt);
        return 'failed' as const;
      }

      dispatch(markMessageStatus({ id: stepId, status: 'sent' }));
      return 'recovered' as const;
    }

    if (scenario === 1) {
      dispatch(updateMessageText({ id: stepId, text: 'Diagnostic processing taking longer than expected...' }));
      dispatch(appendMetricsLog({ label: 'Recalibrating prediction model', tone: 'warn' }));
      await waitWithLatency(randomBetween(3000, 5000), startedAt);
      dispatch(markMessageStatus({ id: stepId, status: 'sent' }));
      return 'delayed' as const;
    }

    await handleEscalation(stepId, startedAt);
    return 'failed' as const;
  }

  useEffect(() => {
    const socket = new MockSocket({
      onStatus: (status) => {
        dispatch(setConnection(status));
        dispatch(setMetricsConnectionStatus(status));
        if (status === 'connected') {
          setLastInteraction('Real-time telemetry stream is healthy.');
          dispatch(appendMetricsLog({ label: 'Telemetry stream restored', tone: 'success' }));
        }
        if (status === 'disconnected') {
          dispatch(setLatency(0));
          dispatch(appendMetricsLog({ label: 'Fallback diagnostic model engaged: telemetry lost', tone: 'error' }));
        }
      },
      onMessage: (text) => {
        dispatch(addMessage({ role: 'system', text, status: 'sent' }));
        dispatch(appendMetricsLog({ label: 'Telemetry event received: system notification' }));
      },
      onLatency: (latency) => {
        dispatch(setLatency(latency));
      },
      onRetry: (attempt, backoff) => {
        dispatch(setMetricsRetryCount(attempt));
        dispatch(setMetricsConnectionStatus('reconnecting'));
        dispatch(appendMetricsLog({ label: `Reconnection attempt initiated (${backoff / 1000}s backoff)`, tone: 'warn' }));
      }
    });

    socket.connect();
    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, [dispatch]);

  async function streamResponse(text: string, responseId: string) {
    const words = text.split(' ');
    let accumulated = '';

    for (const word of words) {
      accumulated += (accumulated ? ' ' : '') + word;
      dispatch(updateMessageText({ id: responseId, text: accumulated }));
      await wait(randomBetween(50, 150));
    }

    dispatch(markMessageStatus({ id: responseId, status: 'sent' }));
  }

  async function processUserMessage(messageText: string) {
    const responseStartedAt = performance.now();
    let responseHandled = false;
    dispatch(setLoading(true));
    dispatch(resetRetry());
    dispatch(setMetricsRetryCount(0));
    const workflow = getWorkflowResponse(workflowContext);
    dispatch(setMetricsActiveInput(messageText));
    dispatch(setMetricsFlowStep('user'));
    dispatch(setMetricsWorkflowStep('intent'));
    dispatch(setMetricsKnowledgeStep('data'));
    dispatch(appendMetricsLog({ label: `Telemetry event received: ${messageText}` }));
    dispatch(
      setSuggestions({
        replies: workflow.suggestedReplies,
        knowledge: workflow.knowledge,
        action: workflow.actionLabel
      })
    );
    retryTextRef.current = messageText;

    const thinkingSteps = [
      'Ingesting sensor data...',
      'Extracting pack-level features...',
      'Running predictive diagnostics...',
      'Computing recommended action...'
    ];

    const sampleResponses = [
      'Battery telemetry review complete. The system detected abnormal behavior in the latest event window and prepared a recommended stabilization sequence for the vehicle.',
      'Diagnostic review complete. The battery event has been correlated with recent telemetry, and the system recommends the next mitigation steps for the pack.',
      'The anomaly model has identified the likely fault condition and generated a resolution path. Review the recommended action before applying it to the system.'
    ];

    const stepId = crypto.randomUUID();
    dispatch(
      addMessage({
        id: stepId,
        role: 'system',
        text: thinkingSteps[0],
        status: 'pending',
        isThinking: true
      })
    );
    dispatch(setMetricsFlowStep('copilot'));
    dispatch(setMetricsKnowledgeStep('context'));
    dispatch(appendMetricsLog({ label: 'Diagnostic model triggered' }));

    // Show thinking steps one at a time, replacing previous line
    for (let i = 1; i < thinkingSteps.length; i++) {
      await wait(randomBetween(700, 900));
      dispatch(updateMessageText({ id: stepId, text: thinkingSteps[i] }));
      updateObservedLatency(responseStartedAt);
    }

    await waitWithLatency(randomBetween(700, 900), responseStartedAt);

    dispatch(setMetricsFlowStep('workflow'));
    dispatch(setMetricsWorkflowStep('routing'));
    dispatch(setMetricsKnowledgeStep('decision'));
    dispatch(appendMetricsLog({ label: `Diagnostic model selected -> ${workflow.actionLabel}` }));

    if (failureModeEnabled && Math.random() < 0.5) {
      const outcome = await runFailureScenario(stepId, responseStartedAt);
      if (outcome === 'failed') {
        return;
      }
      responseHandled = true;
    }

    // Mark thinking as complete and add the final response
    if (!responseHandled) {
      dispatch(markMessageStatus({ id: stepId, status: 'sent' }));
    }
    const responseId = crypto.randomUUID();
    const selectedResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
    dispatch(addMessage({ id: responseId, role: 'system', text: '', status: 'pending' }));
    await waitWithLatency(randomBetween(300, 600), responseStartedAt);
    await streamResponse(selectedResponse, responseId);
    dispatch(setMetricsFlowStep('response'));
    dispatch(setMetricsWorkflowStep('output'));
    dispatch(setMetricsKnowledgeStep('response'));
    dispatch(recordMessageProcessed());
    dispatch(recordResponseTime(Math.round(performance.now() - responseStartedAt)));
    dispatch(appendMetricsLog({ label: 'Prediction generated', tone: 'success' }));
    dispatch(appendMetricsLog({ label: 'Anomaly detected: temperature spike' }));
    updateObservedLatency(responseStartedAt);
    dispatch(setLoading(false));
    setLastInteraction('Diagnostic resolution delivered.');
  }

  function handleSend(text: string) {
    if (!text.trim()) {
      return;
    }
    dispatch(addMessage({ role: 'user', text, status: 'sent' }));
    dispatch(recordMessageProcessed());
    socketRef.current?.send(text);
    processUserMessage(text);
  }

  function handleRetry() {
    if (!retryTextRef.current) {
      return;
    }
    dispatch(incrementRetry());
    dispatch(appendMetricsLog({ label: 'Reconnection attempt initiated', tone: 'warn' }));
    processUserMessage(retryTextRef.current);
  }

  function handleEscalate() {
    dispatch(addMessage({ role: 'system', text: 'Escalation requested. The battery event has been forwarded to the system operator.', status: 'sent' }));
    dispatch(resetRetry());
    setLastInteraction('Operator escalation path triggered.');
  }

  function handleFeedback(messageId: string, value: 'up' | 'down') {
    dispatch(recordFeedback({ messageId, feedback: value }));
  }

  const headerNote = connection === 'disconnected' ? 'Telemetry lost: some diagnostic actions may queue until reconnect.' : lastInteraction;

  return (
    <div className="grid gap-4 lg:grid-cols-[1.75fr_0.95fr]">
      <div className="space-y-4">
        <div className="rounded-3xl bg-white p-5 shadow-panel">
          <ConnectionBanner connection={connection} />
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-panel">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-slate-500">Battery event stream</p>
              <h2 className="text-xl font-semibold text-slate-900">Telemetry console</h2>
            </div>
            <p className="text-sm text-slate-500">{headerNote}</p>
          </div>

          <MessageList
            messages={messages}
            loading={loading}
            feedback={feedback}
            onRetry={handleRetry}
            onEscalate={handleEscalate}
            onFeedback={handleFeedback}
          />

          <div className="mt-4 grid gap-4">
            <ChatInput onSend={handleSend} disabled={loading || connection === 'disconnected'} />
          </div>
        </div>
      </div>

      <CopilotPanel 
        suggestions={suggestions} 
        workflowContext={workflowContext}
        onSendReply={handleSend}
        onWorkflowContextChange={(context) => dispatch(setWorkflowContext(context))}
        failureModeEnabled={failureModeEnabled}
        onFailureModeChange={setFailureModeEnabled}
        connection={connection}
        latency={latency}
        retryCount={retryCount}
      />
    </div>
  );
}
