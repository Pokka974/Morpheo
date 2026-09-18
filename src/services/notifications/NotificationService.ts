export interface NotificationService {
  requestPermission(): Promise<boolean>;
  scheduleReminder(hour: number, minute: number, title: string, body: string): Promise<void>;
  cancelReminder(): Promise<void>;
  registerPushToken(): Promise<void>;
}
