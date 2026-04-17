'use client';

import { X, LayoutGrid, MessageSquare, Zap, Settings, Menu, ChevronDown, ChevronRight, MessageCircle } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSidebarOpen, toggleRecentChats } from '@/store/uiSlice';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const recentChatsOpen = useAppSelector((state) => state.ui.recentChatsOpen);
  const pathname = usePathname();

  const recentChats = [
    "Customer Support Query",
    "API Integration Help",
    "Billing Issue",
    "Feature Request",
    "Technical Troubleshooting"
  ];

  // Only show sidebar on copilot page as per original design
  if (!pathname.startsWith('/copilot')) return null;

  return (
    <>
      {/* Sidebar Overlay for mobile */}
      {!sidebarOpen && pathname === '/copilot' && (
        <button
          onClick={() => dispatch(setSidebarOpen(true))}
          className="fixed bottom-6 left-6 z-40 rounded-full bg-slate-900 p-4 text-white shadow-lg transition hover:bg-slate-800 lg:hidden"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-slate-200 bg-white transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Copilot sidebar</p>
            <h1 className="mt-1 text-lg font-semibold text-slate-900">Workspace</h1>
          </div>
          <button
            type="button"
            onClick={() => dispatch(setSidebarOpen(false))}
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-5 py-6 space-y-2">
          <Link
            href="/copilot"
            className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
              pathname === '/copilot' && !recentChatsOpen
                ? 'bg-slate-100 text-slate-900 border border-slate-200'
                : 'text-slate-700 hover:bg-slate-50'
            }`}
          >
            <LayoutGrid size={16} />
            Dashboard
          </Link>

          <div>
            <button
              type="button"
              onClick={() => dispatch(toggleRecentChats())}
              className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm transition ${
                recentChatsOpen ? 'bg-slate-50 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare size={16} />
                Recent chats
              </div>
              {recentChatsOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {recentChatsOpen && (
              <ul className="mt-1 space-y-1 pl-11">
                {recentChats.map((chat, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-xl py-2 text-left text-xs text-slate-500 transition hover:text-slate-900"
                    >
                      <MessageCircle size={12} className="opacity-40" />
                      <span className="truncate">{chat}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Zap size={16} />
            Prompts
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <Settings size={16} />
            Settings
          </button>
        </nav>

        <div className="border-t border-slate-200 px-5 py-4">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Need help?</p>
          <p className="mt-2 text-sm text-slate-700">Use Copilot to generate suggestions, replies, and workflow context.</p>
        </div>
      </aside>
    </>
  );
}
