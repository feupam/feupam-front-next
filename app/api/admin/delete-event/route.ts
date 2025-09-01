import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'https://us-central1-federa-api.cloudfunctions.net/api';

export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const body = await request.json();
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json({ error: 'ID do evento é obrigatório' }, { status: 400 });
    }

    const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json({ error: data.message || 'Erro ao excluir evento' }, { status: response.status });
    }

    return NextResponse.json({ message: 'Evento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir evento:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
