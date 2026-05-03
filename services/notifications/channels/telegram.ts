import { NotificationChannel, NotificationPayload } from '../types';

/**
 * Telegram Notification Channel.
 * Uses Telegram Bot API to send messages to a specific Chat ID.
 */
export class TelegramChannel implements NotificationChannel {
  id = 'telegram';

  private botToken: string;
  private chatId: string;

  constructor(token?: string, chatId?: string) {
    // Priority: Explicit constructor args > Env variables
    this.botToken = token || process.env.TELEGRAM_BOT_TOKEN || '';
    this.chatId = chatId || process.env.TELEGRAM_CHAT_ID || '';
  }

  async send(payload: NotificationPayload): Promise<void> {
    if (!this.botToken || !this.chatId) {
      throw new Error('[TelegramChannel] Bot Token or Chat ID missing.');
    }

    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    
    // Formatting: HTML tags for bold and code blocks
    const message = `
<b>${payload.title}</b>
${payload.body}

${payload.data?.taskId ? `<code>Task ID: ${payload.data.taskId}</code>` : ''}
${payload.data?.dueDate ? `📅 <b>Due:</b> ${payload.data.dueDate}` : ''}
${payload.data?.rescheduleCount !== undefined ? `🔄 <b>Rescheduled:</b> ${payload.data.rescheduleCount} times` : ''}
    `.trim();

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`[TelegramChannel] API Error: ${errorData.description}`);
    }
  }
}
