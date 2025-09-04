import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_URL || 'https://us-central1-federa-api.cloudfunctions.net/api';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');
    if (!token) {
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    // Obter o FormData (multipart/form-data)
    const formData = await request.formData();
    
    // Validar se as imagens obrigatórias estão presentes
    const logoEvento = formData.get('logo_evento');
    const imageCapa = formData.get('image_capa');
    
    if (!logoEvento || !(logoEvento instanceof File)) {
      return NextResponse.json({ error: 'Logo do evento é obrigatório' }, { status: 400 });
    }
    
    if (!imageCapa || !(imageCapa instanceof File)) {
      return NextResponse.json({ error: 'Imagem de capa é obrigatória' }, { status: 400 });
    }

    // Validar tipos de arquivo (JPG/JPEG)
    const validImageTypes = ['image/jpeg', 'image/jpg'];
    
    if (!validImageTypes.includes(logoEvento.type)) {
      return NextResponse.json({ error: 'Logo do evento deve ser JPG/JPEG' }, { status: 400 });
    }
    
    if (!validImageTypes.includes(imageCapa.type)) {
      return NextResponse.json({ error: 'Imagem de capa deve ser JPG/JPEG' }, { status: 400 });
    }

    // Encaminhar o FormData para a API externa
    const response = await fetch(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: {
        'Authorization': token,
        // Note: Não incluir Content-Type, deixar o fetch definir automaticamente para FormData
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ 
        error: data.message || 'Erro ao criar evento',
        details: data 
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erro ao criar evento:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
