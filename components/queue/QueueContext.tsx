import React, { createContext, useContext, useState, useEffect } from 'react';

interface QueueContextType {
  position: number;
  estimatedTime: number;
  isReady: boolean;
}

const QueueContext = createContext<QueueContextType | undefined>(undefined);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [position, setPosition] = useState(Math.floor(Math.random() * 1) + 3);
  const [estimatedTime, setEstimatedTime] = useState(position * 0.5);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((prev) => {
        if (prev <= 1) {
          setIsReady(true);
          clearInterval(interval);
          return 0;
        }
        return prev - Math.floor(Math.random() * 3 + 1);
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setEstimatedTime(position * 0.5);
  }, [position]);

  return (
    <QueueContext.Provider value={{ position, estimatedTime, isReady }}>
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (context === undefined) {
    throw new Error('useQueue must be used within a QueueProvider');
  }
  return context;
}