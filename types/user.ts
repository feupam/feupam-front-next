export interface UserProfile {
  photoURL: string | undefined;
  city: string;
  number: string;
  neighborhood: string;
  state: string;
  userType: 'client' | 'staff';
  name: string;
  email: string;
  church: string;
  pastor: string;
  ddd: string;
  cellphone: string;
  gender: 'male' | 'female';
  cep: string;
  cpf: string;
  data_nasc: string;
  idade: number;
  responsavel?: string;
  documento_responsavel?: string;
  ddd_responsavel?: string;
  cellphone_responsavel?: string;
  address: string;
  complemento?: string;
  cidade: string;
  estado: string;
  alergia: string;
  medicamento: string;
  info_add?: string;
  lgpdConsentAccepted: boolean;
  wantShirt: boolean;
  isStaff?: boolean;
  staffPassword?: string;
}

export interface FormField {
  label: string;
  name: keyof UserProfile;
  type: 'text' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'radio';
  required: boolean;
  placeholder?: string;
  mask?: string;
  defaultValue?: string;
  validation?: {
    pattern?: RegExp;
    message?: string;
    validate?: (value: any) => boolean | string;
  };
  options?: { value: string; label: string; }[];
  dependsOn?: {
    field: keyof UserProfile;
    value: any;
  };
}

export interface UserFormFields {
  label: string;
  name: keyof UserProfile;
  type: 'text' | 'tel' | 'number' | 'date' | 'select' | 'textarea' | 'radio';
  required: boolean;
  placeholder?: string;
  mask?: string;
  defaultValue?: string;
  validation?: {
    pattern?: RegExp;
    message?: string;
    validate?: (value: any) => boolean | string;
  };
  options?: { value: string; label: string; }[];
  dependsOn?: {
    field: keyof UserProfile;
    value: any;
  };
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export const formSections: FormSection[] = [
  {
    title: '👤 Dados Pessoais',
    fields: [
      {
        label: 'Nome Completo',
        name: 'name',
        type: 'text',
        required: true,
        placeholder: 'Digite seu nome completo',
        validation: {
          pattern: /^[a-zA-ZÀ-ÿ\s]{2,}$/,
          message: 'Nome deve ter pelo menos 2 caracteres e apenas letras'
        }
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
      },
      {
        label: 'Data de Nascimento',
        name: 'data_nasc',
        type: 'date',
        required: true,
        placeholder: 'DD/MM/AAAA',
        validation: {
          validate: (value: string) => {
            const date = new Date(value.split('/').reverse().join('-'));
            const now = new Date();
            const age = now.getFullYear() - date.getFullYear();
            return age >= 6 && age <= 100 ? true : 'Idade deve estar entre 6 e 100 anos';
          }
        }
      }
    ]
  },
  {
    title: '⛪ Informações da Igreja',
    fields: [
      {
        label: 'Igreja',
        name: 'church',
        type: 'text',
        required: true,
        placeholder: 'Ex: Igreja Presbiteriana de São Paulo'
      },
      {
        label: 'Pastor',
        name: 'pastor',
        type: 'text',
        required: true,
        placeholder: 'Nome do pastor responsável'
      }
    ]
  },
  {
    title: '📱 Contato',
    fields: [
      {
        label: 'Telefone/Celular',
        name: 'cellphone',
        type: 'tel',
        required: true,
        mask: '(00) 00000-0000',
        placeholder: '(35) 99999-9999',
        validation: {
          pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
          message: 'Formato: (35) 99999-9999'
        }
      }
    ]
  },
  {
    title: '📄 Documentos',
    fields: [
      {
        label: 'CPF',
        name: 'cpf',
        type: 'text',
        required: true,
        mask: '000.000.000-00',
        placeholder: '000.000.000-00',
        validation: {
          validate: (value: string) => {
            const cpf = value.replace(/\D/g, '');
            if (cpf.length !== 11) return 'CPF deve ter 11 dígitos';
            // Validação básica de CPF
            if (/^(\d)\1{10}$/.test(cpf)) return 'CPF inválido';
            return true;
          }
        }
      },
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
      }
    ]
  },
  {
    title: '🏠 Endereço',
    fields: [
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
        defaultValue: 'MG',
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
    title: '👨‍👩‍👧‍👦 Contato de Emergência',
    fields: [
      {
        label: 'Nome para o contato de emergência',
        name: 'responsavel',
        type: 'text',
        required: true,
        placeholder: 'Nome completo do conto de emergência'
      },
      {
        label: 'CPF do contato de emergência',
        name: 'documento_responsavel',
        type: 'text',
        required: true,
        mask: '000.000.000-00',
        placeholder: '000.000.000-00'
      },
      {
        label: 'Telefone do contato de emergência',
        name: 'cellphone_responsavel',
        type: 'tel',
        required: true,
        mask: '(00) 00000-0000',
        placeholder: '(11) 99999-9999'
      }
    ]
  },
  {
    title: '🏥 Informações de Saúde',
    fields: [
      {
        label: 'Possui alguma alergia?',
        name: 'alergia',
        type: 'select',
        required: true,
        options: [
          { value: 'Não', label: 'Não possuo alergias' },
          { value: 'Sim', label: 'Sim, possuo alergias' }
        ]
      },
      {
        label: 'Faz uso de medicamentos?',
        name: 'medicamento',
        type: 'select',
        required: true,
        options: [
          { value: 'Não', label: 'Não tomo medicamentos' },
          { value: 'Sim', label: 'Sim, tomo medicamentos' }
        ]
      },
      {
        label: 'Informações Adicionais sobre Saúde',
        name: 'info_add',
        type: 'textarea',
        required: false,
        placeholder: 'Descreva alergias, medicamentos, condições especiais... (opcional)'
      }
    ]
  },
  {
    title: '📋 Termos e Condições',
    fields: [
      {
        label: 'Aceito os termos da LGPD',
        name: 'lgpdConsentAccepted',
        type: 'radio',
        required: true,
        options: [
          { value: 'true', label: '✅ Sim, aceito o tratamento dos meus dados pessoais' },
          { value: 'false', label: '❌ Não aceito' }
        ]
      }
    ]
  }
];

// Mantém o userFormFields para compatibilidade
export const userFormFields: UserFormFields[] = formSections.flatMap(section => section.fields);