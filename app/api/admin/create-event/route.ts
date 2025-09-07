import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Iniciando criação de evento...');
    
    const token = request.headers.get('authorization');
    if (!token) {
      console.error('[API] Token não fornecido');
      return NextResponse.json({ error: 'Token não fornecido' }, { status: 401 });
    }

    // Obter o FormData (multipart/form-data)
    const formData = await request.formData();
    
    // Validar se as imagens obrigatórias estão presentes
    const logoEvento = formData.get('logo_evento');
    const imageCapa = formData.get('image_capa');
    
    if (!logoEvento || !(logoEvento instanceof File)) {
      console.error('[API] Logo do evento não foi enviado ou não é um arquivo');
      return NextResponse.json({ error: 'Logo do evento é obrigatório' }, { status: 400 });
    }
    
    if (!imageCapa || !(imageCapa instanceof File)) {
      console.error('[API] Imagem de capa não foi enviada ou não é um arquivo');
      return NextResponse.json({ error: 'Imagem de capa é obrigatória' }, { status: 400 });
    }

    // Validar tipos de arquivo (JPG/JPEG)
    const validImageTypes = ['image/jpeg', 'image/jpg'];
    
    if (!validImageTypes.includes(logoEvento.type)) {
      console.error(`[API] Tipo inválido para logo do evento: ${logoEvento.type}`);
      return NextResponse.json({ error: 'Logo do evento deve ser JPG/JPEG' }, { status: 400 });
    }
    
    if (!validImageTypes.includes(imageCapa.type)) {
      console.error(`[API] Tipo inválido para imagem de capa: ${imageCapa.type}`);
      return NextResponse.json({ error: 'Imagem de capa deve ser JPG/JPEG' }, { status: 400 });
    }

    console.log('[API] Criando FormData para API externa...');

    // Criar FormData exatamente como na requisição HTTP que funciona
    const apiFormData = new FormData();
    
    // Usar dados da requisição ou valores padrão
    const name = formData.get('name') || 'Evento criado via frontend';
    const date = formData.get('date') || '2025-09-21';
    const location = formData.get('location') || 'Local do evento';
    const description = formData.get('description') || 'Descrição do evento';
    
    // Adicionar campos na mesma ordem da requisição que funciona
    apiFormData.append('name', name.toString());
    apiFormData.append('date', date.toString());
    apiFormData.append('location', location.toString());
    apiFormData.append('description', description.toString());
    apiFormData.append('eventType', 'general');
    apiFormData.append('maxClientMale', formData.get('maxClientMale')?.toString() || '0');
    apiFormData.append('maxClientFemale', formData.get('maxClientFemale')?.toString() || '0');
    apiFormData.append('maxStaffMale', formData.get('maxStaffMale')?.toString() || '0');
    apiFormData.append('maxStaffFemale', formData.get('maxStaffFemale')?.toString() || '0');
    apiFormData.append('maxGeneralSpots', formData.get('maxGeneralSpots')?.toString() || '200');
    apiFormData.append('startDate', formData.get('startDate')?.toString() || '2024-08-19T00:00:00Z');
    apiFormData.append('endDate', formData.get('endDate')?.toString() || '2024-09-21T23:59:59Z');
    apiFormData.append('price', formData.get('price')?.toString() || '0');
    
    // Adicionar imagens com filename fixo como na requisição que funciona
    apiFormData.append('image_capa', imageCapa, 'O.jpg');
    apiFormData.append('logo_evento', logoEvento, 'O.jpg');

    console.log(`[API] Enviando evento "${name}" para API externa...`);

    // Enviar para a API externa
    const response = await fetch('http://localhost:3000/events', {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: apiFormData,
    });

    console.log(`[API] Resposta da API externa: ${response.status}`);

    const data = await response.json();

    if (!response.ok) {
      console.error('[API] Erro da API externa:', data);
      return NextResponse.json({ 
        error: data.message || 'Erro ao criar evento',
        details: data 
      }, { status: response.status });
    }

    console.log(`[API] Evento "${data.name}" criado com sucesso!`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Erro interno:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}
