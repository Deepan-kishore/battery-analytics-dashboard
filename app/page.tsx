import { BotMessageSquare,MonitorCheck, Sparkles } from 'lucide-react';
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
            Bridging AI and customer support
          </p>
          
        </div>

        {/* Feature Cards Grid */}
        <div className="grid gap-8 md:grid-cols-2">
          <FeatureCard
            icon={<BotMessageSquare size={32} />}
            title="AI Agents for your Customers"
            description="Conversational AI agents that talk to your customers on phone and chat and resolve common requests end to end."
            href="/customers"
          />
          <FeatureCard
            icon={<Sparkles size={32} />}
            title="AI Copilot for your Human Staff"
            description="Provide real time assistance to your existing staff for faster and accurate customer support."
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
