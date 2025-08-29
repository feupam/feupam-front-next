'use client';

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

interface EventClosedDialogProps {
  open: boolean;
  onClose: () => void;
  startDate: string;
  endDate: string;
}

export function EventClosedDialog({ open, onClose, startDate, endDate }: EventClosedDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Inscrições ainda não abertas</AlertDialogTitle>
          <AlertDialogDescription>
            As inscrições para este evento estarão disponíveis de{" "}
            <strong>{formatDate(startDate)}</strong> até{" "}
            <strong>{formatDate(endDate)}</strong>.
            <br />
            <br />
            Fique atento às datas!
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex justify-end space-x-2">
          <AlertDialogCancel asChild>
            <Button variant="outline">Entendi</Button>
          </AlertDialogCancel>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
