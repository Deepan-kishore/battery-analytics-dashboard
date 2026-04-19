'use client';

import { useEffect, useMemo, useState } from 'react';
import { Mic, Send } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

const mockAudioPhrases = [
  'Voltage spike detected across the rear battery pack.',
  'Battery overheating event observed after the latest drive cycle.',
  'Cell imbalance detected in module three during charging.',
  'Telemetry indicates an unexpected current surge in the powertrain battery.'
];

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [statusText, setStatusText] = useState('');

  const mockText = useMemo(
    () => mockAudioPhrases[Math.floor(Math.random() * mockAudioPhrases.length)],
    []
  );

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  async function startRecording() {
    if (disabled || !navigator.mediaDevices?.getUserMedia) {
      setStatusText('Audio capture unavailable in this browser.');
      return;
    }

    try {
      setStatusText('Initializing microphone…');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        setStatusText('Processing telemetry note...');
        window.setTimeout(() => {
          setText(mockText);
          setStatusText('Event transcript added. Review and dispatch.');
        }, 1500);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setStatusText('Recording operator note...');
    } catch (error) {
      setStatusText('Unable to start audio capture. Please check permissions.');
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
    }
    setRecording(false);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        <label className="sr-only" htmlFor="chat-input">
          Battery event
        </label>
        <input
          id="chat-input"
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              if (text.trim()) {
                onSend(text.trim());
                setText('');
                setStatusText('');
              }
            }
          }}
          placeholder="Type a battery event or diagnostic note…"
          className="min-h-[52px] flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled}
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl transition ${
            recording
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-slate-200 hover:bg-slate-300'
          } disabled:cursor-not-allowed disabled:bg-slate-200`}
          aria-label={recording ? 'Stop recording' : 'Start voice recording'}
        >
          <Mic
            size={20}
            className={recording ? 'text-white' : 'text-slate-700'}
          />
        </button>
        <button
          type="button"
          onClick={() => {
            if (!text.trim()) return;
            onSend(text.trim());
            setText('');
            setStatusText('');
          }}
          disabled={disabled}
          className="inline-flex h-12 items-center rounded-2xl bg-sky-600 px-5 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <Send size={16} />
        </button>
      </div>
      {statusText && (
        <p className="mt-3 text-sm text-slate-600">{statusText}</p>
      )}
      {!statusText && (
        <p className="mt-3 text-xs text-slate-500">
          Telemetry workflows expect exact fault classification and system context. Keep event descriptions concise.
        </p>
      )}
    </div>
  );
}
