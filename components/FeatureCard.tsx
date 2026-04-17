'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href: string;
  iconClassName?: string;
}

export default function FeatureCard({ icon, title, description, href, iconClassName }: FeatureCardProps) {
  return (
    <Link href={href}>
      <div className="group cursor-pointer rounded-2xl bg-white p-10 transition-all duration-300 hover:shadow-lg">
        {/* Icon */}
        <div className={`mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${iconClassName || 'text-slate-700 group-hover:text-slate-900'}`}>
          {icon}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-xl font-semibold text-slate-900">{title}</h3>

        {/* Description */}
        <p className="mb-6 text-slate-600">{description}</p>

        {/* Learn more link */}
        <div className="flex items-center gap-2 text-slate-700 transition-colors duration-300 group-hover:text-slate-900">
          <span className="text-sm font-medium">Learn more</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </div>
      </div>
    </Link>
  );
}
