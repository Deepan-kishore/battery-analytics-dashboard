import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from './providers';
import ShellLayout from '@/components/ShellLayout';

export const metadata: Metadata = {
  title: 'Cignaro Battery Analytics Console',
  description: 'Real-time battery analytics and observability dashboard'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased text-slate-900">
        <Providers>
          <ShellLayout>
            {children}
          </ShellLayout>
        </Providers>
      </body>
    </html>
  );
}
