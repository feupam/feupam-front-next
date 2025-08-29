import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { uuid: string } }
) {
  try {
    // Aqui você faria a chamada para seu backend real
    // Por enquanto vamos simular uma resposta
    const isAvailable = Math.random() > 0.5; // Simulando 50% de chance de ter vaga

    if (!isAvailable) {
      return NextResponse.json(
        {
          isAvailable: false,
          waitingList: true
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        isAvailable: true,
        spotId: `spot_${Math.random().toString(36).substr(2, 9)}`
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error checking spot:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 