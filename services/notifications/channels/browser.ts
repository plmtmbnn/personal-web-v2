import { NotificationChannel, NotificationPayload } from '../types';

/**
 * Browser Notification Channel.
 * Wrapper for the native Web Notification API.
 */
export class BrowserChannel implements NotificationChannel {
  id = 'browser';

  async send(payload: NotificationPayload): Promise<void> {
    // Only works in browser environment
    if (typeof window === 'undefined') {
      // console.warn('[BrowserChannel] Skipped: Not in a browser environment.');
      return;
    }

    if (!('Notification' in window)) {
      console.warn('[BrowserChannel] Notifications not supported by this browser.');
      return;
    }

    if (Notification.permission === 'granted') {
      new Notification(payload.title, {
        body: payload.body,
        icon: '/favicon.ico', // Optional: customize icon
      });
    } else {
      console.warn('[BrowserChannel] Permission not granted.');
    }
  }
}
