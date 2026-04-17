import './globals.css';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Providers from './providers';
import ShellLayout from '@/components/ShellLayout';

export const metadata: Metadata = {
  title: 'Cignaro Support Console',
  description: 'Enterprise AI customer support simulation dashboard'
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
