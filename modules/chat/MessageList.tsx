'use client';

import { useEffect, useState } from 'react';
import type { ChatMessage, FeedbackRecord } from '@/types/chat';

interface MessageListProps {
  messages: ChatMessage[];
  loading: boolean;
  feedback: Record<string, FeedbackRecord>;
  onRetry: () => void;
  onEscalate: () => void;
  onFeedback: (messageId: string, feedback: FeedbackRecord) => void;
}

function formatTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function MessageList({ messages, loading, feedback, onRetry, onEscalate, onFeedback }: MessageListProps) {
  const [visibleThankYouId, setVisibleThankYouId] = useState<string | null>(null);

  // Auto-hide thank you message after 3 seconds
  useEffect(() => {
    if (visibleThankYouId) {
      const timer = setTimeout(() => {
        setVisibleThankYouId(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [visibleThankYouId]);

  function handleFeedback(messageId: string, feedbackValue: FeedbackRecord) {
    onFeedback(messageId, feedbackValue);
    setVisibleThankYouId(messageId);
  }

  return (
    <div style={{overflow:'scroll'}} className="flex h-[420px] flex-col gap-4 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 p-4">
      {messages.map((message) => {
        const isUser = message.role === 'user';
        const statusFailed = message.status === 'failed';
        const recordedFeedback = feedback[message.id];
        const isThinking = message.isThinking;

        return (
          <div key={message.id} className={`space-y-2 ${isUser ? 'self-end max-w-[85%] text-right' : 'self-start max-w-[92%]'}`}>
            {isThinking ? (
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <span>{message.text}</span>
              </div>
            ) : (
              <div className={`rounded-3xl border px-4 py-3 ${isUser ? 'bg-sky-600 text-white' : 'bg-white text-slate-900 shadow-sm'} ${statusFailed ? 'border-rose-200' : 'border-transparent'}`}>
                <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.text}</p>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{formatTime(message.timestamp)}</span>
                  {message.status === 'pending' && <span>Processing…</span>}
                  {message.status === 'failed' && <span className="text-rose-600">Failed</span>}
                </div>
              </div>
            )}

            {!isThinking && !isUser && statusFailed ? (
              <div className="flex flex-wrap gap-2 text-sm">
                <button onClick={onRetry} className="rounded-full bg-slate-900 px-3 py-1 text-white transition hover:bg-slate-700">
                  Retry
                </button>
                <button onClick={onEscalate} className="rounded-full border border-slate-300 bg-white px-3 py-1 text-slate-700 transition hover:bg-slate-100">
                  Escalate to human
                </button>
              </div>
            ) : null}

            {!isThinking && !isUser && message.status === 'sent' ? (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                {!recordedFeedback ? (
                  <>
                    <button onClick={() => handleFeedback(message.id, 'up')} className="rounded-full border border-slate-300 bg-white px-2 py-1 transition hover:bg-slate-100">
                      👍
                    </button>
                    <button onClick={() => handleFeedback(message.id, 'down')} className="rounded-full border border-slate-300 bg-white px-2 py-1 transition hover:bg-slate-100">
                      👎
                    </button>
                  </>
                ) : null}
                {visibleThankYouId === message.id ? (
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">Thanks for your feedback!</span>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}

      {loading ? (
        <div className="animate-pulse rounded-3xl bg-white p-4 text-slate-600 shadow-sm">
          <div className="mb-2 h-3 w-24 rounded-full bg-slate-200" />
          <div className="grid gap-2">
            <div className="h-3 w-full rounded-full bg-slate-200" />
            <div className="h-3 w-5/6 rounded-full bg-slate-200" />
          </div>
        </div>
      ) : null}
    </div>
  );
}