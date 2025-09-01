'use client';

import { UserReservationsList } from '@/components/profile/UserReservationsList';

// Dados mockados para teste
const mockReservations = [
  {
    charges: [{
      amount: 36500,
      chargeId: "ch_n5VygLGiei8r6bWo",
      email: "test@test.com",
      envioWhatsapp: false,
      event: "federa",
      lote: 0,
      meio: "pix",
      payLink: "00020101021226820014br.gov.bcb.pix2560pix.stone.com.br/pix/v2/20dc5196-0e2a-4b58-afad-a8ca3807932c5204000053039865406365.005802BR5925PRESBITERIO VALE DO RIO G6014RIO DE JANEIRO6229052592afd6f91d7c032f8be5536c66304323E",
      qrcodePix: "https://api.pagar.me/core/v5/transactions/tran_7MoWA9PtKt3Laxe4/qrcode?payment_method=pix",
      status: "Pago"
    }],
    email: "test@test.com",
    eventId: "federa",
    gender: "male",
    price: 36500,
    spotId: "h25JtbI4iSbIvtAeKkoB",
    status: "Pago",
    ticketKind: "full",
    updatedAt: new Date(),
    userType: "client"
  },
  {
    charges: [{
      amount: 25000,
      chargeId: "ch_pendente123",
      email: "test@test.com",
      envioWhatsapp: false,
      event: "evento2",
      lote: 1,
      meio: "credit_card",
      payLink: "",
      qrcodePix: "",
      status: "Pendente"
    }],
    email: "test@test.com",
    eventId: "evento2",
    gender: "female",
    price: 25000,
    spotId: "spot123",
    status: "Pendente",
    ticketKind: "day",
    updatedAt: new Date(),
    userType: "client"
  }
];

export default function TestReservationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Teste - Lista de Reservas</h1>
        
        <UserReservationsList
          reservations={mockReservations}
          loading={false}
          error={null}
          onRefetch={() => console.log('Refetch triggered')}
        />
      </div>
    </div>
  );
}
