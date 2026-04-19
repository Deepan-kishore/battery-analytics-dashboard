import { BotMessageSquare, Sparkles } from 'lucide-react';
import FeatureCard from '@/components/FeatureCard';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Cignaro
          </h1>
          {/* <p className="mt-4 text-lg text-slate-600">
            Explore our AI-powered solutions for customer support and staff assistance
          </p> */}
          <p className="mt-4 text-lg text-slate-600">
            Real-time battery analytics and observability
          </p>
          
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          <FeatureCard
            icon={<BotMessageSquare size={32} />}
            title="Battery Event Monitor"
            description="Monitor live battery telemetry, diagnose fault events, and simulate resolution flows across connected systems."
            href="/customers"
          />
          <FeatureCard
            icon={<Sparkles size={32} />}
            title="Diagnostic Copilot for Analysts"
            description="Provide real-time diagnostic assistance for operators reviewing battery anomalies, predictions, and recovery actions."
            href="/copilot"
          />
           {/* <FeatureCard
            icon={< MonitorCheck size={32} />}
            title="Metrics"
            description="Real-time system behavior, reliability, and flow visibility"
            href="/metric"
          /> */}
        </div>

        
      </div>
    </main>
  );
}
