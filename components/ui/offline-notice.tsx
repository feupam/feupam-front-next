'use client';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { Wifi, WifiOff } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function OfflineNotice() {
  const { isOnline } = useNetworkStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-destructive p-2"
        >
          <div className="flex items-center gap-2 text-sm text-white">
            <WifiOff size={16} />
            <span>Você está offline. Algumas funcionalidades podem estar indisponíveis.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 