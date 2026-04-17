'use client';

interface ConnectionBannerProps {
  connection: string;
}

export default function ConnectionBanner({ connection }: ConnectionBannerProps) {
  const statusText =
    connection === 'connected'
      ? 'Live connection established'
      : connection === 'reconnecting'
      ? 'Reconnecting to the message stream…'
      : 'Connection lost. Auto reconnect in progress.';

  const statusClass =
    connection === 'connected'
      ? 'bg-emerald-100 text-emerald-800'
      : connection === 'reconnecting'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-rose-100 text-rose-800';

  return (
    <div className={`rounded-3xl px-4 py-3 text-sm font-medium ${statusClass}`}>
      {statusText}
    </div>
  );
}
