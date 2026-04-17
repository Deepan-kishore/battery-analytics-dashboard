'use client';

import { useRef, useEffect, useState } from 'react';
import { Paperclip, Image, Send, Sparkles } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { addStaffMessage, triggerCopilot } from '@/store/staffCopilotSlice';
import { MoreHorizontal } from 'lucide-react';

export default function StaffChatPanel() {
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.staffCopilot.messages);
  const copilotLoading = useAppSelector((state) => state.staffCopilot.copilot.isLoading);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const lastCustomerMessageIndex = [...messages].reverse().findIndex(m => m.sender === 'customer');
  const lastCustomerMessageId = lastCustomerMessageIndex !== -1 ? messages[messages.length - 1 - lastCustomerMessageIndex].id : null;

  function handleSend() {
    if (!input.trim()) return;
    dispatch(addStaffMessage({ sender: 'staff', text: input.trim() }));
    setInput('');
  }

  function handleSendToCopilot(text: string) {
    dispatch(triggerCopilot(text));
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <img
            src="https://i.pravatar.cc/40?u=john-staff"
            alt="John"
            className="w-9 h-9 rounded-full object-cover"
          />
          <span className="font-semibold text-slate-900 text-base">John</span>
        </div>
        <button
          className="text-slate-400 hover:text-slate-600 transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3">
        {messages.map((msg) => (
          <div key={msg.id} className="flex flex-col">
            <div
              className={`flex ${msg.sender === 'staff' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed text-slate-800 ${
                  msg.sender === 'customer'
                    ? 'bg-white border border-slate-200'
                    : 'bg-slate-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
            {msg.id === lastCustomerMessageId && (
              <div className="mt-2 flex justify-start">
                <button
                  onClick={() => handleSendToCopilot(msg.text)}
                  disabled={copilotLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium text-slate-500 bg-slate-50 border border-slate-100 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <Sparkles size={12} className="text-yellow-500" fill="currentColor" />
                  Send to Copilot
                </button>
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="px-5 pt-3 pb-4 border-t border-slate-100">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Start typing...."
          className="w-full text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none mb-3"
          aria-label="Type a message"
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Attach file"
              type="button"
            >
              <Paperclip size={18} />
            </button>
            <button
              className="text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Attach image"
              type="button"
            >
              <Image size={18} />
            </button>
          </div>
          <button
            onClick={handleSend}
            type="button"
            aria-label="Send message"
            className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 active:bg-slate-400 transition-colors text-slate-700 text-sm font-medium rounded-full px-4 py-2"
          >
            Send
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
