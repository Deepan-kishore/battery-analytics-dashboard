'use client';

import { useEffect, useMemo, useState } from 'react';

interface VoiceControlsProps {
  onTranscript: (text: string) => void;
  disabled: boolean;
}

const mockAudioPhrases = [
  'Customer reports payment not reflecting in the ledger.',
  'The application is failing after the latest update.',
  'User cannot access billing statements in the portal.',
  'Support ticket indicates a transaction authorization error.'
];

export default function VoiceControls({ onTranscript, disabled }: VoiceControlsProps) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [statusText, setStatusText] = useState('');
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

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
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setStatusText('Processing audio...');

        window.setTimeout(() => {
          setStatusText('Sending transcript to conversation.');
          onTranscript(mockText);
        }, 1500);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
      setStatusText('Recording voice input...');
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Voice capture</p>
          <p className="text-sm leading-6 text-slate-500">Record and transcribe a customer request with a mock voice workflow.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            disabled={disabled}
            className="inline-flex items-center rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {recording ? 'Stop' : 'Record'}
          </button>
          {audioUrl ? (
            <audio controls className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-2" src={audioUrl} />
          ) : null}
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{statusText || 'Use voice capture for a simulated customer audio path.'}</p>
      {audioUrl ? <p className="mt-2 text-xs text-slate-400">Recorded audio playback available.</p> : null}
    </div>
  );
}
