'use client';

import { useEffect, useRef, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import type { MetricsFlowStep, MetricsKnowledgeStep, MetricsLogTone, MetricsWorkflowStep } from '@/store/metricsSlice';

const FLOW_STEPS: Array<{ key: MetricsFlowStep; label: string }> = [
	{ key: 'user', label: 'User' },
	{ key: 'copilot', label: 'Copilot' },
	{ key: 'workflow', label: 'Workflow' },
	{ key: 'response', label: 'Response' }
];

const KNOWLEDGE_STEPS: Array<{ key: MetricsKnowledgeStep; label: string }> = [
	{ key: 'data', label: 'Data' },
	{ key: 'context', label: 'Context' },
	{ key: 'decision', label: 'Decision' },
	{ key: 'response', label: 'Response' }
];

const WORKFLOW_STEPS: Array<{ key: MetricsWorkflowStep; label: string }> = [
	{ key: 'intent', label: 'Intent detected' },
	{ key: 'routing', label: 'Workflow selected' },
	{ key: 'output', label: 'Output prepared' }
];

function badgeClasses(status: 'connected' | 'reconnecting' | 'disconnected') {
	if (status === 'connected') {
		return 'border-emerald-200 bg-emerald-50 text-emerald-700';
	}

	if (status === 'reconnecting') {
		return 'border-amber-200 bg-amber-50 text-amber-700';
	}

	return 'border-rose-200 bg-rose-50 text-rose-700';
}

function logClasses(tone: MetricsLogTone) {
	if (tone === 'success') {
		return 'text-emerald-300';
	}

	if (tone === 'warn') {
		return 'text-amber-300';
	}

	if (tone === 'error') {
		return 'text-rose-300';
	}

	return 'text-slate-300';
}

export default function MetricPage() {
	const metrics = useAppSelector((state) => state.metrics);
	const [previousMessageCount, setPreviousMessageCount] = useState(metrics.messageCount);
	const [previousResponseTime, setPreviousResponseTime] = useState(metrics.avgResponseTime);
	const [messagePulse, setMessagePulse] = useState(false);
	const [latencyPulse, setLatencyPulse] = useState(false);
	const logsEndRef = useRef<HTMLDivElement | null>(null);
	const { messageCount, avgResponseTime, connection, logs, flow } = metrics;

	useEffect(() => {
		if (messageCount !== previousMessageCount) {
			setMessagePulse(true);
			setPreviousMessageCount(messageCount);
		}
	}, [messageCount, previousMessageCount]);

	useEffect(() => {
		const timer = window.setTimeout(() => setMessagePulse(false), 320);
		return () => window.clearTimeout(timer);
	}, [messagePulse]);

	useEffect(() => {
		if (avgResponseTime !== previousResponseTime) {
			setLatencyPulse(true);
			setPreviousResponseTime(avgResponseTime);
		}
	}, [avgResponseTime, previousResponseTime]);

	useEffect(() => {
		const timer = window.setTimeout(() => setLatencyPulse(false), 320);
		return () => window.clearTimeout(timer);
	}, [latencyPulse]);

	useEffect(() => {
		logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [logs]);

	const statusLabel =
		connection.status === 'connected'
			? 'Connected'
			: connection.status === 'reconnecting'
				? 'Reconnecting'
				: 'Disconnected';

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.16),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#eef2f7_100%)] px-4 py-6 sm:px-6 lg:px-8">
			<div className="mx-auto max-w-7xl space-y-6">
				<section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
						<div>
							<p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">Metrics & system insights</p>
							<h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Live behavior dashboard</h1>
							<p className="mt-2 max-w-2xl text-sm text-slate-600">
								Lightweight telemetry for message flow, retry behavior, routing, and response generation.
							</p>
						</div>

						<div className="flex flex-wrap items-center gap-3">
							<span className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-medium ${badgeClasses(connection.status)}`}>
								{statusLabel}
							</span>
							<span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
								Live app events
							</span>
						</div>
					</div>
				</section>

				<section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					<div className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 ${messagePulse ? 'scale-[1.02] border-sky-300 shadow-[0_12px_30px_rgba(14,165,233,0.12)]' : ''}`}>
						<p className="text-xs uppercase tracking-[0.24em] text-slate-500">Messages processed</p>
						<p className="mt-3 text-3xl font-semibold text-slate-950">{messageCount}</p>
						<p className="mt-2 text-sm text-slate-500">Increments on user send and copilot response.</p>
					</div>

					<div className={`rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition duration-300 ${latencyPulse ? 'scale-[1.02] border-emerald-300 shadow-[0_12px_30px_rgba(16,185,129,0.12)]' : ''}`}>
						<p className="text-xs uppercase tracking-[0.24em] text-slate-500">Avg response time</p>
						<p className="mt-3 text-3xl font-semibold text-slate-950">{avgResponseTime} ms</p>
						<p className="mt-2 text-sm text-slate-500">Derived from simulated response delays.</p>
					</div>

					<div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-xs uppercase tracking-[0.24em] text-slate-500">Retry count</p>
						<p className="mt-3 text-3xl font-semibold text-slate-950">{connection.retryCount}</p>
						<p className="mt-2 text-sm text-slate-500">Backoff steps: 1s, 2s, 4s on disconnect.</p>
					</div>

					<div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
						<p className="text-xs uppercase tracking-[0.24em] text-slate-500">Current input</p>
						<p className="mt-3 text-lg font-semibold text-slate-950">{flow.activeInput}</p>
						<p className="mt-2 text-sm text-slate-500">Latest request routed through the workflow.</p>
					</div>
				</section>

				<section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
					{/* <div className="grid gap-4"> */}
						<div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
							<p className="text-xs uppercase tracking-[0.24em] text-slate-500">Workflow visualization</p>
							<h2 className="mt-2 text-lg font-semibold text-slate-950">Routing logic</h2>
							<p className="mt-2 text-sm text-slate-500">Input: {flow.activeInput}</p>

							<ol className="mt-5 space-y-3">
								{WORKFLOW_STEPS.map((step) => {
									const active = flow.workflowStep === step.key;

									return (
										<li
											key={step.key}
											className={`rounded-2xl border px-4 py-4 transition ${
												active
													? 'border-violet-300 bg-violet-50 shadow-[0_12px_30px_rgba(139,92,246,0.12)]'
													: 'border-slate-200 bg-slate-50'
											}`}
										>
											<p className="text-sm font-medium text-slate-900">{step.label}</p>
											<p className="mt-1 text-sm text-slate-500">
												{step.key === 'intent' && 'classified from latest input'}
												{step.key === 'routing' && 'mapped to the active support workflow'}
												{step.key === 'output' && 'response prepared for delivery'}
											</p>
										</li>
									);
								})}
							</ol>
						</div>

						<div className="rounded-[24px] border border-slate-200 bg-[#0f172a] p-5 shadow-sm">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="text-xs uppercase tracking-[0.24em] text-slate-400">Mini logs</p>
									<h2 className="mt-2 text-lg font-semibold text-white">Event stream</h2>
								</div>
								<p className="text-xs uppercase tracking-[0.18em] text-slate-500">Max 20 entries</p>
							</div>

							<div className="mt-5 h-[320px] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/70 p-4 font-mono text-xs leading-6">
								{logs.length === 0 ? (
									<p className="text-slate-500">Waiting for events...</p>
								) : (
									logs.map((entry) => (
										<div key={entry.id} className="flex items-start gap-3">
											<span className="text-slate-500">{entry.timestamp}</span>
											<span className={logClasses(entry.tone)}>{entry.label}</span>
										</div>
									))
								)}
								<div ref={logsEndRef} />
							</div>
						</div>
					{/* </div> */}
				</section>
			</div>
		</main>
	);
}
