import React, { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
  currentDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const calculateTimeLeft = (targetDate: Date, currentDate: Date): TimeLeft => {
  const difference = targetDate.getTime() - currentDate.getTime();
  
  if (difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / 1000 / 60) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const CountdownTimer: React.FC<CountdownTimerProps> = ({ targetDate, currentDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(targetDate, currentDate));
  const [serverTimeDiff, setServerTimeDiff] = useState<number>(currentDate.getTime() - new Date().getTime());

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const serverNow = new Date(now.getTime() + serverTimeDiff);
      setTimeLeft(calculateTimeLeft(targetDate, serverNow));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, serverTimeDiff]);

  const timeUnits = [
    { label: 'Dias', value: timeLeft.days },
    { label: 'Horas', value: timeLeft.hours },
    { label: 'Minutos', value: timeLeft.minutes },
    { label: 'Segundos', value: timeLeft.seconds },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-4 mt-6">
      {timeUnits.map((unit) => (
        <div 
          key={unit.label} 
          className="flex flex-col items-center"
        >
          <div className="relative">
            <div className="bg-emerald-900/40 backdrop-blur-sm text-emerald-300 text-4xl font-bold rounded-lg h-20 w-20 sm:h-24 sm:w-24 flex items-center justify-center shadow-lg border border-emerald-400/20">
              {unit.value.toString().padStart(2, '0')}
            </div>
            <div className="absolute -bottom-1 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-b-lg"></div>
          </div>
          <span className="text-emerald-200 text-sm mt-2 font-medium">{unit.label}</span>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;