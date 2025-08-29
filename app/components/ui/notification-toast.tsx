import React, { forwardRef, useImperativeHandle, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface NotificationToastRef {
  show: (message: string, type?: 'success' | 'error') => void;
}

const NotificationToast = forwardRef<NotificationToastRef>((_, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error'>('success');

  useImperativeHandle(ref, () => ({
    show: (newMessage: string, newType: 'success' | 'error' = 'success') => {
      setMessage(newMessage);
      setType(newType);
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 3000);
    },
  }));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className={`fixed bottom-4 right-4 flex items-center gap-2 rounded-lg p-4 shadow-lg ${
            type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300'
          }`}
        >
          {type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
          )}
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={() => setIsVisible(false)}
            className="ml-2 rounded-full p-1 hover:bg-black/5 dark:hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

NotificationToast.displayName = 'NotificationToast';

export { NotificationToast }; 