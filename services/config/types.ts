export interface RemoteConfigSchema {
  enable_telegram_notifications: boolean;
  enable_browser_notifications: boolean;
  cron_interval_minutes: number;
  notification_pnl_threshold: number;
}

export const DefaultConfig: RemoteConfigSchema = {
  enable_telegram_notifications: false,
  enable_browser_notifications: false,
  cron_interval_minutes: 60,
  notification_pnl_threshold: -5,
};
