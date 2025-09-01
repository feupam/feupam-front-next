import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'https://us-central1-federa-api.cloudfunctions.net/api';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });

    const data = await response.json();
    
    console.log('[API list-events] Response status:', response.status);
    console.log('[API list-events] Response data:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json({ error: data.message || 'Erro ao listar eventos' }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
