"use client";

import { forwardRef, useState, useImperativeHandle } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, Bell } from 'lucide-react';

export type NotificationType = 'info' | 'success' | 'error' | 'warning';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

export interface NotificationToastRef {
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
}

const iconMap = {
  info: <Info className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <Bell className="h-5 w-5" />,
};

const bgColorMap = {
  info: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300',
  success: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-300',
  error: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-300',
  warning: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-300',
};

const iconColorMap = {
  info: 'text-blue-500 dark:text-blue-400',
  success: 'text-green-500 dark:text-green-400',
  error: 'text-red-500 dark:text-red-400',
  warning: 'text-amber-500 dark:text-amber-400',
};

export const NotificationToast = forwardRef<NotificationToastRef>((_, ref) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };
  
  const showNotification = (
    message: string,
    type: NotificationType = 'info',
    duration = 5000
  ) => {
    const id = Date.now().toString();
    
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
  };
  
  useImperativeHandle(ref, () => ({
    showNotification,
  }));
  
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`rounded-md border p-4 shadow-md pointer-events-auto ${bgColorMap[notification.type]}`}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${iconColorMap[notification.type]}`}>
                {iconMap[notification.type]}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                type="button"
                className={`ml-3 flex-shrink-0 rounded-md inline-flex items-center justify-center h-5 w-5 ${iconColorMap[notification.type]} focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={() => removeNotification(notification.id)}
              >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
});

NotificationToast.displayName = 'NotificationToast';