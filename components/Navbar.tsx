'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, PanelLeft } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSidebarOpen } from '@/store/uiSlice';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-slate-100 bg-opacity-95 backdrop-blur-sm border-b border-slate-200 transition-all duration-300 ease-in-out">
      <div className="mx-auto max-w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle for desktop */}
            {!sidebarOpen && pathname.startsWith('/copilot') && (
              <button
                onClick={() => dispatch(setSidebarOpen(true))}
                className="hidden lg:flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors"
                aria-label="Open sidebar"
              >
                <PanelLeft size={20} />
              </button>
            )}

            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-slate-900 hover:text-slate-700 transition-colors duration-200">
                Cignaro
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: '/customers', label: 'Customers' },
              { href: '/copilot', label: 'Staff' },
              { href: '/metric', label: 'Metrics' },
            ].map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative group font-medium transition-colors duration-200 ${
                    isActive ? 'text-slate-900' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                  <span
                    className={`absolute bottom-0 left-0 h-0.5 bg-slate-900 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  ></span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X size={24} />
            ) : (
              <Menu size={24} />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 border-t border-slate-200 mt-1">
            {[
              { href: '/customers', label: 'Customers' },
              { href: '/copilot', label: 'Staff' },
              { href: '/metric', label: 'Metrics' },
            ].map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block px-2 py-2 font-medium rounded-md transition-colors duration-200 ${
                    isActive
                      ? 'text-slate-900 bg-slate-200'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
