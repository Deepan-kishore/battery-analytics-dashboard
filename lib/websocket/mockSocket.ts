/* eslint-disable no-unused-vars */
import type { ConnectionState } from '@/types/chat';

export type SocketCallbacks = {
  onStatus: (_status: ConnectionState) => void;
  onMessage: (_text: string) => void;
  onLatency: (_latency: number) => void;
  onRetry: (_attempt: number, _backoff: number) => void;
};

export class MockSocket {
  private callbacks: SocketCallbacks;
  private connected = false;
  private attempts = 0;
  private timeouts: number[] = [];
  private connectionStartTime = 0;

  constructor(callbacks: SocketCallbacks) {
    this.callbacks = callbacks;
  }

  connect() {
    this.clearTimers();
    this.connectionStartTime = performance.now();
    this.callbacks.onStatus('reconnecting');
    this.scheduleReconnect(false);
  }

  private scheduleReconnect(reportRetry = true) {
    if (this.attempts >= 3) {
      this.callbacks.onStatus('disconnected');
      return;
    }

    const backoff = [1000, 2000, 4000][this.attempts] ?? 4000;
    if (reportRetry) {
      this.callbacks.onRetry(this.attempts + 1, backoff);
    }

    const timeoutId = window.setTimeout(() => {
      this.attempts += 1;
      const success = Math.random() > 0.25;

      if (success) {
        this.connected = true;
        this.attempts = 0;
        this.callbacks.onStatus('connected');
        const latency = Math.round(performance.now() - this.connectionStartTime);
        this.callbacks.onLatency(latency);
        this.scheduleIncoming();
      } else {
        this.callbacks.onStatus('reconnecting');
        this.scheduleReconnect(reportRetry);
      }
    }, backoff);

    this.timeouts.push(timeoutId);
  }

  send(_message: string) {
    if (!this.connected) {
      this.callbacks.onStatus('disconnected');
      return;
    }

    const timeoutId = window.setTimeout(() => {
      if (Math.random() < 0.16) {
        this.connected = false;
        this.callbacks.onStatus('disconnected');
        this.callbacks.onMessage('Network interruption detected. Attempting auto-reconnect.');
        this.connectionStartTime = performance.now();
        this.scheduleReconnect();
      }
    }, 300);

    this.timeouts.push(timeoutId);
  }

  private scheduleIncoming() {
    const delay = 18000 + Math.random() * 12000;
    const timeoutId = window.setTimeout(() => {
      if (!this.connected) {
        return;
      }

      this.callbacks.onMessage(
        'System notification: a batch review is being prepared for high-priority accounts.'
      );
    }, delay);

    this.timeouts.push(timeoutId);
  }

  close() {
    this.connected = false;
    this.clearTimers();
    this.callbacks.onStatus('disconnected');
  }

  private clearTimers() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts = [];
  }
}
