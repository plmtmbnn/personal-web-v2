export interface NotificationPayload {
  title: string;
  body: string;
  data?: {
    taskId?: string;
    priority?: string;
    dueDate?: string;
    rescheduleCount?: number;
    punctualityRate?: string;
  };
}

export interface NotificationChannel {
  id: string;
  send(payload: NotificationPayload): Promise<void>;
}
