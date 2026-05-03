import { NotificationChannel, NotificationPayload } from './types';

/**
 * Orchestrates notification delivery across multiple pluggable channels.
 * Follows the Observer pattern for high extensibility.
 */
export class NotificationDispatcher {
  private channels: NotificationChannel[] = [];

  /**
   * Register a new delivery channel (e.g., Telegram, Browser, Email)
   */
  registerChannel(channel: NotificationChannel) {
    if (!this.channels.find(c => c.id === channel.id)) {
      this.channels.push(channel);
    }
    return this;
  }

  /**
   * Dispatches a notification to all registered channels.
   * Isolates failures so one channel failing doesn't block others.
   */
  async dispatch(payload: NotificationPayload): Promise<void> {
    const results = await Promise.allSettled(
      this.channels.map(channel => {
        // console.log(`[Dispatcher] Sending via ${channel.id}...`);
        return channel.send(payload);
      })
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `[Dispatcher] Channel "${this.channels[index].id}" failed:`, 
          result.reason
        );
      }
    });
  }
}

// Export a singleton instance for global use
export const notificationDispatcher = new NotificationDispatcher();
