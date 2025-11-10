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
          <AlertDialogTitle>As inscrições ainda não estão abertas</AlertDialogTitle>
            <AlertDialogDescription>
              Este evento estará disponível de{" "}
              <strong>
                {formatDate(startDate)} às {new Date(startDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })} 
              </strong>{" "}
              até{" "}
              <strong>
                {formatDate(endDate)} às {new Date(endDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}
              </strong>.
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
