// Formulário específico para eventos de acampamento
export interface AcampamentoFormData {
  name: string; // Nome completo
  idade_no_acampamento: number; // Idade que terá na data do acampamento
  nome_mae: string;
  nome_pai: string;
  contato_2: string;
  contato_3: string;
  alergia_alimentar: string; // Pode ser "Não" ou especificar
  alergia_insetos: string; // Pode ser "Não" ou especificar
  outra_alergia: string; // Pode ser "Não" ou especificar
  condicao_saude: string; // Asma, diabetes, sonambulismo, etc
  medicamento_continuado: string; // Especificar medicamento e modo de usar
  pode_atividade_fisica: 'sim' | 'nao';
  transtorno_desenvolvimento: string; // Pode ser "Não" ou especificar
  autoriza_fotos_videos: 'sim' | 'nao';
  informacoes_adicionais: string;
  termos_baixados: string; // Marcador de que o documento foi baixado
  // Campos obrigatórios do sistema
  email: string;
  cpf: string;
  data_nasc: string;
  idade: number;
  cellphone: string; // Telefone principal (serve como contato_1)
  ddd: string;
  gender: 'male' | 'female';
  lgpdConsentAccepted: boolean;
  // Campos de endereço
  cep: string;
  address: string;
  complemento?: string;
  cidade: string;
  estado: string;
}

export interface AcampamentoFormField {
  label: string;
  name: keyof AcampamentoFormData;
  type: 'text' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'radio';
  required: boolean;
  placeholder?: string;
  mask?: string;
  validation?: {
    pattern?: RegExp;
    message?: string;
    validate?: (value: any, context?: any) => boolean | string;
  };
  options?: { value: string; label: string; }[];
  helperText?: string;
}

export interface AcampamentoFormSection {
  title: string;
  fields: AcampamentoFormField[];
}

export const acampamentoFormSections: AcampamentoFormSection[] = [
  {
    title: '👤 Dados do Participante',
    fields: [
      {
        label: 'Nome Completo',
        name: 'name',
        type: 'text',
        required: true,
        placeholder: 'Nome completo do participante',
        validation: {
          pattern: /^[a-zA-ZÀ-ÿ\s]{2,}$/,
          message: 'Nome deve ter pelo menos 2 caracteres e apenas letras'
        }
      },
      {
        label: 'Data de Nascimento',
        name: 'data_nasc',
        type: 'date',
        required: true,
        placeholder: 'DD/MM/AAAA',
        validation: {
          validate: (value: string, context?: { idadeMinima?: number; idadeMaxima?: number }) => {
            if (!value) return 'Data de nascimento é obrigatória';
            
            const birthDate = new Date(value);
            const today = new Date();
            
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
            
            if (context?.idadeMinima !== undefined && context?.idadeMaxima !== undefined) {
              if (age < context.idadeMinima || age > context.idadeMaxima) {
                return `Este evento é para idades de ${context.idadeMinima} a ${context.idadeMaxima} anos (incluindo ${context.idadeMinima} e ${context.idadeMaxima}). Sua idade: ${age} anos.`;
              }
            }
            
            if (age < 0 || age > 120) {
              return 'Data de nascimento inválida';
            }
            
            return true;
          }
        }
      },
      {
        label: 'Idade que terá na data do acampamento',
        name: 'idade_no_acampamento',
        type: 'number',
        required: true,
        placeholder: 'Idade no acampamento',
        helperText: 'Informe a idade que o participante terá na data do acampamento'
      },
      {
        label: 'Gênero',
        name: 'gender',
        type: 'select',
        required: true,
        options: [
          { value: 'male', label: 'Masculino' },
          { value: 'female', label: 'Feminino' }
        ]
      }
    ]
  },
  {
    title: '👨‍👩‍👧 Dados dos Responsáveis',
    fields: [
      {
        label: 'Nome da Mãe',
        name: 'nome_mae',
        type: 'text',
        required: true,
        placeholder: 'Nome completo da mãe'
      },
      {
        label: 'Nome do Pai',
        name: 'nome_pai',
        type: 'text',
        required: true,
        placeholder: 'Nome completo do pai'
      },
      {
        label: 'CPF do Responsável',
        name: 'cpf',
        type: 'text',
        required: true,
        placeholder: '000.000.000-00',
        mask: '000.000.000-00',
        validation: {
          validate: (value: string) => {
            if (!value) return 'CPF é obrigatório';
            
            // Remove caracteres não numéricos
            const cleanCPF = value.replace(/\D/g, '');
            
            // Valida se tem 11 dígitos
            if (cleanCPF.length !== 11) {
              return 'CPF deve ter 11 dígitos';
            }
            
            // Aceita tanto formato com máscara quanto sem
            return true;
          }
        }
      }
    ]
  },
  {
    title: '📞 Contatos de Emergência',
    fields: [
      {
        label: 'Telefone Principal (Responsável)',
        name: 'cellphone',
        type: 'tel',
        required: true,
        placeholder: '(00) 00000-0000',
        mask: '(00) 00000-0000',
        helperText: 'Telefone principal para contato durante o acampamento'
      },
      {
        label: 'Contato 2',
        name: 'contato_2',
        type: 'tel',
        required: true,
        placeholder: '(00) 00000-0000',
        mask: '(00) 00000-0000'
      },
      {
        label: 'Contato 3',
        name: 'contato_3',
        type: 'tel',
        required: true,
        placeholder: '(00) 00000-0000',
        mask: '(00) 00000-0000'
      }
    ]
  },
  {
    title: '� Endereço',
    fields: [
      {
        label: 'CEP',
        name: 'cep',
        type: 'text',
        required: true,
        mask: '00.000-000',
        placeholder: '00.000-000',
        validation: {
          pattern: /^\d{2}\.\d{3}-\d{3}$/,
          message: 'Formato: 12.345-678'
        }
      },
      {
        label: 'Endereço Completo',
        name: 'address',
        type: 'text',
        required: true,
        placeholder: 'Rua, Avenida, número...'
      },
      {
        label: 'Complemento',
        name: 'complemento',
        type: 'text',
        required: false,
        placeholder: 'Apartamento, bloco, casa... (opcional)'
      },
      {
        label: 'Cidade',
        name: 'cidade',
        type: 'text',
        required: true,
        placeholder: 'Nome da cidade'
      },
      {
        label: 'Estado',
        name: 'estado',
        type: 'select',
        required: true,
        placeholder: 'Selecione o estado',
        options: [
          { value: 'MG', label: 'Minas Gerais' },
          { value: 'AC', label: 'Acre' },
          { value: 'AL', label: 'Alagoas' },
          { value: 'AP', label: 'Amapá' },
          { value: 'AM', label: 'Amazonas' },
          { value: 'BA', label: 'Bahia' },
          { value: 'CE', label: 'Ceará' },
          { value: 'DF', label: 'Distrito Federal' },
          { value: 'ES', label: 'Espírito Santo' },
          { value: 'GO', label: 'Goiás' },
          { value: 'MA', label: 'Maranhão' },
          { value: 'MT', label: 'Mato Grosso' },
          { value: 'MS', label: 'Mato Grosso do Sul' },
          { value: 'PA', label: 'Pará' },
          { value: 'PB', label: 'Paraíba' },
          { value: 'PR', label: 'Paraná' },
          { value: 'PE', label: 'Pernambuco' },
          { value: 'PI', label: 'Piauí' },
          { value: 'RJ', label: 'Rio de Janeiro' },
          { value: 'RN', label: 'Rio Grande do Norte' },
          { value: 'RS', label: 'Rio Grande do Sul' },
          { value: 'RO', label: 'Rondônia' },
          { value: 'RR', label: 'Roraima' },
          { value: 'SC', label: 'Santa Catarina' },
          { value: 'SP', label: 'São Paulo' },
          { value: 'SE', label: 'Sergipe' },
          { value: 'TO', label: 'Tocantins' }
        ]
      }
    ]
  },
  {
    title: '�🏥 Informações de Saúde - Alergias',
    fields: [
      {
        label: 'Tem alergia alimentar? Especifique',
        name: 'alergia_alimentar',
        type: 'textarea',
        required: true,
        placeholder: 'Ex: Não tem / Alergia a leite e derivados',
        helperText: 'Se não tiver, escreva "Não"'
      },
      {
        label: 'Tem alergia a picada de insetos? Especifique',
        name: 'alergia_insetos',
        type: 'textarea',
        required: true,
        placeholder: 'Ex: Não tem / Alergia a picada de abelha',
        helperText: 'Se não tiver, escreva "Não"'
      },
      {
        label: 'Tem alguma outra alergia? Especifique',
        name: 'outra_alergia',
        type: 'textarea',
        required: true,
        placeholder: 'Ex: Não tem / Alergia a pólen',
        helperText: 'Se não tiver, escreva "Não"'
      }
    ]
  },
  {
    title: '🏥 Informações de Saúde - Condições Médicas',
    fields: [
      {
        label: 'Tem asma, diabetes, sonambulismo ou outra condição de saúde? Em caso afirmativo, qual conduta esperada?',
        name: 'condicao_saude',
        type: 'textarea',
        required: true,
        placeholder: 'Ex: Não tem / Tem asma - usar bombinha quando necessário',
        helperText: 'Descreva a condição e a conduta esperada. Se não tiver, escreva "Não"'
      },
      {
        label: 'Usa medicamento continuado? Especifique (favor enviar a medicação e modo de usar por escrito)',
        name: 'medicamento_continuado',
        type: 'textarea',
        required: true,
        placeholder: 'Ex: Não usa / Ritalina 10mg - 1 comprimido pela manhã',
        helperText: 'Se não usa, escreva "Não"'
      },
      {
        label: 'Pode praticar atividade física?',
        name: 'pode_atividade_fisica',
        type: 'radio',
        required: true,
        options: [
          { value: 'sim', label: 'Sim' },
          { value: 'nao', label: 'Não' }
        ]
      },
      {
        label: 'Tem algum transtorno do desenvolvimento ou outro transtorno que necessite atenção especial? Especifique',
        name: 'transtorno_desenvolvimento',
        type: 'textarea',
        required: true,
        placeholder: 'Ex: Não tem / TEA - necessita acompanhamento',
        helperText: 'Se não tiver, escreva "Não"'
      }
    ]
  },
  {
    title: '📸 Autorização e Informações Adicionais',
    fields: [
      {
        label: 'Você autoriza a veiculação de fotos e vídeos de atividades do acampamento, em que seu filho(a) esteja presente? Serão postadas no Instagram do Acampamento Reino (@acampsreino). O objetivo é a divulgação deste trabalho e também para os pais acompanharem as notícias.',
        name: 'autoriza_fotos_videos',
        type: 'radio',
        required: true,
        options: [
          { value: 'sim', label: 'Sim, autorizo' },
          { value: 'nao', label: 'Não autorizo' }
        ]
      },
      {
        label: 'Informações Adicionais',
        name: 'informacoes_adicionais',
        type: 'textarea',
        required: false,
        placeholder: 'Alguma informação adicional que julgar importante'
      }
    ]
  },
  {
    title: '📄 Termos e Condições',
    fields: [
      {
        label: 'Baixar e ler o documento de termos',
        name: 'termos_baixados',
        type: 'text',
        required: true,
        placeholder: 'Clique no botão abaixo para baixar',
        helperText: `IMPORTANTE: Você deve baixar e ler o documento de termos e condições antes de prosseguir.

OBSERVAÇÕES IMPORTANTES:
        
1. OS QUARTOS SERÃO MONTADOS DE ACORDO COM A FAIXA ETÁRIA E NA ORDEM DE INSCRIÇÕES.

2. EM CASO DE DESISTÊNCIA ATÉ 01 DE DEZEMBRO DE 2025 SERÃO RETIDOS 20% DO VALOR DA INSCRIÇÃO. APÓS ESTE PERÍODO, NÃO HAVERÁ RESTITUIÇÃO DO VALOR.

3. DOCUMENTOS NECESSÁRIOS: RG OU CARTEIRA DE IDENTIDADE NACIONAL OU CERTIDÃO DE NASCIMENTO; AUTORIZAÇÃO DOS PAIS ASSINADA E AUTENTICADA (DOCUMENTO EM ANEXO). NÃO SERÁ PERMITIDO ENTRADA E PERMANÊNCIA NO ACAMPAMENTO SEM ESSA DOCUMENTAÇÃO.

CASO TENHA ALGUMA DÚVIDA, FAVOR ENTRAR EM CONTATO COM JOSIANE SOUZA – (35) 999651505 (SOMENTE WHATSAPP)`,
        validation: {
          validate: (value: any) => {
            return value === 'downloaded' ? true : 'Você deve baixar o documento de termos antes de prosseguir';
          }
        }
      },
      {
        label: 'Li e aceito os termos',
        name: 'lgpdConsentAccepted',
        type: 'radio',
        required: true,
        options: [
          { value: 'true', label: 'Aceito os termos e condições' },
          { value: 'false', label: 'Não aceito' }
        ]
      }
    ]
  }
];

// Função para verificar se o evento é um acampamento
export function isAcampamentoEvent(eventName: string): boolean {
  const acampamentoEvents = ['AcampsReinoKids', 'AcampsReinoPreAdole'];
  return acampamentoEvents.some(name => 
    eventName.toLowerCase().includes(name.toLowerCase())
  );
}

// Função para obter o nome do arquivo de termos baseado no evento
export function getTermosFileName(eventName: string): string {
  if (eventName.toLowerCase().includes('acampsreinokids')) {
    return 'AcampsReinoKids.docx';
  } else if (eventName.toLowerCase().includes('acampsreinopreadole')) {
    return 'AcampsReinoPreAdole.docx';
  }
  return '';
}

// Função para obter a URL de download do documento de termos
export function getTermosDownloadUrl(eventName: string): string {
  const fileName = getTermosFileName(eventName);
  return fileName ? `/docs/${fileName}` : '';
}

// Função para converter dados do formulário de acampamento para o formato do backend
export function convertAcampamentoToUserProfile(data: Partial<AcampamentoFormData>) {
  // Extrai DDD e número do telefone principal (cellphone)
  const mainPhone = data.cellphone ? extractPhoneData(data.cellphone) : { ddd: '', phone: '' };
  
  // Extrai DDD e número dos contatos adicionais
  const contato2Phone = data.contato_2 ? extractPhoneData(data.contato_2) : { ddd: '', phone: '' };
  const contato3Phone = data.contato_3 ? extractPhoneData(data.contato_3) : { ddd: '', phone: '' };
  
  // Converter lgpdConsentAccepted para boolean (pode vir como string 'true'/'false' do formulário)
  const lgpdConsent = typeof data.lgpdConsentAccepted === 'boolean' 
    ? data.lgpdConsentAccepted 
    : data.lgpdConsentAccepted === 'true' || data.lgpdConsentAccepted === true;
  
  return {
    // Campos padrão do sistema (mantém underscore)
    name: data.name || '',
    email: data.email || '',
    cpf: data.cpf ? data.cpf.replace(/\D/g, '') : '',
    data_nasc: data.data_nasc || '',
    idade: data.idade || 0,
    gender: data.gender || 'male',
    ddd: mainPhone.ddd,
    cellphone: mainPhone.phone,
    lgpdConsentAccepted: lgpdConsent,
    userType: 'client' as const,
    
    // Campos de acampamento em camelCase (conforme API externa)
    idadeNoAcampamento: data.idade_no_acampamento || 0,
    nomeMae: data.nome_mae || '',
    nomePai: data.nome_pai || '',
    contato2: contato2Phone.phone || '', // Apenas o número sem DDD
    contato3: contato3Phone.phone || '', // Apenas o número sem DDD
    alergiaAlimentar: data.alergia_alimentar || 'Não',
    alergiaPicadaInsetos: data.alergia_insetos || 'Não',
    outrasAlergias: data.outra_alergia || 'Não',
    condicoesSaude: data.condicao_saude || 'Não possui',
    medicamentoContinuado: data.medicamento_continuado || 'Não usa',
    podeAtisFisica: data.pode_atividade_fisica === 'sim',
    transtornosDesenvolvimento: data.transtorno_desenvolvimento || 'Não possui',
    autorizaFotosVideos: data.autoriza_fotos_videos === 'sim',
    
    // Info_add com informações adicionais (formato texto)
    info_add: data.informacoes_adicionais || 'Nenhuma informação adicional',
    
    // Campos obrigatórios do UserProfile
    photoURL: undefined,
    
    // Campos opcionais do sistema - valores default para campos não no formulário de acampamento
    wantShirt: false,
    isStaff: false,
    church: 'Não informado',
    pastor: 'Não informado',
    
    // Campos de endereço (agora vêm do formulário)
    cep: data.cep ? data.cep.replace(/\D/g, '') : '00000000',
    address: data.address || 'Não informado',
    number: '0', // Não coletado no formulário de acampamento
    neighborhood: 'Não informado', // Não coletado no formulário de acampamento
    complemento: data.complemento || '',
    city: data.cidade || 'Não informado',
    state: data.estado || 'MG',
    cidade: data.cidade || 'Não informado',
    estado: data.estado || 'MG',
    
    // Compatibilidade com campos antigos (deprecated mas mantidos)
    alergia: data.alergia_alimentar || 'Não',
    medicamento: data.medicamento_continuado || 'Não usa',
    responsavel: data.nome_mae || '', // Mãe como responsável principal
    documento_responsavel: data.cpf ? data.cpf.replace(/\D/g, '') : '',
    ddd_responsavel: mainPhone.ddd,
    cellphone_responsavel: mainPhone.phone
  };
}

// Helper para extrair DDD e telefone
function extractPhoneData(formattedPhone: string): { ddd: string; phone: string } {
  if (!formattedPhone) return { ddd: '', phone: '' };
  
  const numbersOnly = formattedPhone.replace(/\D/g, '');
  
  if (numbersOnly.length >= 10) {
    const ddd = numbersOnly.substring(0, 2);
    const phone = numbersOnly.substring(2);
    return { ddd, phone };
  }
  
  return { ddd: '', phone: numbersOnly };
}
