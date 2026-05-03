import { createAdminClient } from '@/lib/core/supabase-server';
import { notificationDispatcher } from './dispatcher';
import { TelegramChannel } from './channels/telegram';
import { BrowserChannel } from './channels/browser';
import { remoteConfigService } from '@/services/config/remote-config';

/**
 * Task Reminder Cron Job.
 * Fetches today's incomplete tasks and dispatches notifications.
 */
export async function runTaskReminders() {
  console.log('[Cron] Starting task reminders...');

  // 1. Fetch Remote Config
  const enableTelegram = await remoteConfigService.getConfigValue('enable_telegram_notifications');
  const enableBrowser = await remoteConfigService.getConfigValue('enable_browser_notifications');

  // 2. Initialize Channels (Pluggable & Condition-based)
  if (enableTelegram) {
    notificationDispatcher.registerChannel(new TelegramChannel());
  } else {
    console.log('[Cron] Telegram notifications disabled via Remote Config.');
  }

  if (enableBrowser) {
    notificationDispatcher.registerChannel(new BrowserChannel());
  } else {
    console.log('[Cron] Browser notifications disabled via Remote Config.');
  }

  // 3. Fetch Tasks from Supabase (Service Role to bypass RLS)
  const supabase = await createAdminClient();
  const todayStr = new Date().toISOString().split('T')[0];

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('id, title, due_date, reschedule_count, priority')
    .eq('is_completed', false)
    .eq('due_date', todayStr);

  if (error) {
    console.error('[Cron] Error fetching tasks:', error);
    return;
  }

  if (!tasks || tasks.length === 0) {
    console.log('[Cron] No pending tasks for today.');
    return;
  }

  console.log(`[Cron] Found ${tasks.length} tasks. Dispatching...`);

  // 4. Process each task and notify
  for (const task of tasks) {
    const payload = {
      title: 'Task Reminder',
      body: `Objective pending: ${task.title}`,
      data: {
        taskId: task.id,
        dueDate: task.due_date,
        rescheduleCount: task.reschedule_count || 0,
        priority: task.priority,
      },
    };

    await notificationDispatcher.dispatch(payload);
  }

  console.log('[Cron] Task reminders complete.');
}
