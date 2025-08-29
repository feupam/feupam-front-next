import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    const body = await request.json();
    const { ticket_kind } = body;

    // Aqui você faria a chamada para seu backend real
    // Por enquanto vamos simular uma resposta
    return NextResponse.json(
      {
        spotId: `spot_${Math.random().toString(36).substr(2, 9)}`,
        email: 'user@example.com', // Aqui viria o email do usuário autenticado
        eventId: params.uuid
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error reserving spot:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 