export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationToastRef {
  showNotification: (message: string, type: NotificationType) => void;
} 