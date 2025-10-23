"use client"

import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export type ReservationStatusType = 'pending' | 'confirmed' | 'expired' | 'cancelled' | 'payment_pending';

interface ReservationStatusProps {
  status: ReservationStatusType;
  className?: string;
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  confirmed: {
    label: 'Confirmada',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 border-green-300',
  },
  expired: {
    label: 'Expirada',
    icon: XCircle,
    className: 'bg-red-100 text-red-800 border-red-300',
  },
  cancelled: {
    label: 'Cancelada',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-800 border-gray-300',
  },
  payment_pending: {
    label: 'Aguardando Pagamento',
    icon: AlertCircle,
    className: 'bg-orange-100 text-orange-800 border-orange-300',
  },
};

export function ReservationStatus({ status, className = '' }: ReservationStatusProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`flex items-center gap-1.5 ${config.className} ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      <span>{config.label}</span>
    </Badge>
  );
}
