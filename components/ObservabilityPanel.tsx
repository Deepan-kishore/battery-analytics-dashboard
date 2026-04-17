'use client';

interface ObservabilityPanelProps {
  connection: string;
  latency: number;
  retryCount: number;
}

export default function ObservabilityPanel({ connection, latency, retryCount }: ObservabilityPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Observability</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-4 text-sm shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Connection</p>
          <p className="mt-2 font-semibold text-slate-900">{connection}</p>
        </div>
        <div className="rounded-3xl bg-white p-4 text-sm shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Latency</p>
          <p className="mt-2 font-semibold text-slate-900">{latency} ms</p>
        </div>
        <div className="rounded-3xl bg-white p-4 text-sm shadow-sm">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Retry count</p>
          <p className="mt-2 font-semibold text-slate-900">{retryCount}</p>
        </div>
      </div>
    </div>
  );
}
