'use client';

import { useAppSelector } from '@/store/hooks';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { usePathname } from 'next/navigation';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const pathname = usePathname();

  const isCopilotRoute = pathname.startsWith('/copilot');

  // On home page or non-copilot routes, we don't show the sidebar or the restricted layout
  if (pathname === '/' || !isCopilotRoute) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden relative">
      <Sidebar />
      <div 
        className="flex flex-1 flex-col transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarOpen ? '18rem' : '0' }}
      >
        <Navbar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
