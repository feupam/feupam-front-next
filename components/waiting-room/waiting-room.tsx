"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getTimeRemaining } from '@/lib/utils';
// import { Event } from '@/lib/types';
import AnimatedBackground from '@/components/ui/animated-background';
import { Ticket, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WaitingRoomProps {
  event: Event;
}

export default function WaitingRoom({ event }: WaitingRoomProps) {
  const router = useRouter();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [isPulsing, setIsPulsing] = useState(false);
  const [message, setMessage] = useState('');
  const [isReady, setIsReady] = useState(false);

}