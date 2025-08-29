export interface UserProfile {
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
}

export interface UserFormFields {
  label: string;
  name: keyof UserProfile;
  type: 'text' | 'tel' | 'number' | 'date' | 'select' | 'textarea';
  required: boolean;
  placeholder?: string;
  mask?: string;
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
  fields: UserFormFields[];
}

export const formSections: FormSection[] = [
  {
    title: 'Dados Pessoais',
    fields: [
      {
        label: 'Nome Completo',
        name: 'name',
        type: 'text',
        required: true,
        placeholder: 'Digite seu nome completo'
      },
      {
        label: 'Igreja',
        name: 'church',
        type: 'text',
        required: true,
        placeholder: 'Digite o nome da sua igreja'
      },
      {
        label: 'Pastor',
        name: 'pastor',
        type: 'text',
        required: true,
        placeholder: 'Digite o nome do seu pastor'
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
        type: 'text',
        required: true,
        mask: '00/00/0000',
        placeholder: 'DD/MM/AAAA'
      },
      {
        label: 'Idade',
        name: 'idade',
        type: 'number',
        required: true,
        placeholder: 'Digite sua idade'
      }
    ]
  },
  {
    title: 'Contato',
    fields: [
      {
        label: 'DDD',
        name: 'ddd',
        type: 'tel',
        required: true,
        mask: '00',
        placeholder: '00'
      },
      {
        label: 'Celular',
        name: 'cellphone',
        type: 'tel',
        required: true,
        mask: '00000-0000',
        placeholder: '00000-0000'
      }
    ]
  },
  {
    title: 'Documentos',
    fields: [
      {
        label: 'CPF',
        name: 'cpf',
        type: 'text',
        required: true,
        mask: '000.000.000-00',
        placeholder: '000.000.000-00'
      },
      {
        label: 'CEP',
        name: 'cep',
        type: 'text',
        required: true,
        mask: '00.000-000',
        placeholder: '00.000-000'
      }
    ]
  },
  {
    title: 'Endereço',
    fields: [
      {
        label: 'Endereço',
        name: 'address',
        type: 'text',
        required: true
      },
      {
        label: 'Complemento',
        name: 'complemento',
        type: 'text',
        required: true
      },
      {
        label: 'Cidade',
        name: 'cidade',
        type: 'text',
        required: true
      },
      {
        label: 'Estado',
        name: 'estado',
        type: 'select',
        required: true,
        options: [
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
          { value: 'MG', label: 'Minas Gerais' },
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
    title: 'Responsável (Todos devem ter um responsável)',
    fields: [
      {
        label: 'Nome do Responsável',
        name: 'responsavel',
        type: 'text',
        required: true,
        dependsOn: {
          field: 'idade',
          value: (idade: number) => idade < 18
        }
      },
      {
        label: 'CPF do Responsável',
        name: 'documento_responsavel',
        type: 'text',
        required: true,
        mask: '000.000.000-00',
        dependsOn: {
          field: 'idade',
          value: (idade: number) => idade < 18
        }
      },
      {
        label: 'DDD do Responsável',
        name: 'ddd_responsavel',
        type: 'tel',
        required: true,
        mask: '00',
        dependsOn: {
          field: 'idade',
          value: (idade: number) => idade < 18
        }
      },
      {
        label: 'Celular do Responsável',
        name: 'cellphone_responsavel',
        type: 'tel',
        required: true,
        mask: '00000-0000',
        dependsOn: {
          field: 'idade',
          value: (idade: number) => idade < 18
        }
      }
    ]
  },
  {
    title: 'Informações de Saúde',
    fields: [
      {
        label: 'Possui Alergia?',
        name: 'alergia',
        type: 'select',
        required: true,
        options: [
          { value: 'Sim', label: 'Sim' },
          { value: 'Não', label: 'Não' }
        ]
      },
      {
        label: 'Toma Medicamento?',
        name: 'medicamento',
        type: 'select',
        required: true,
        options: [
          { value: 'Sim', label: 'Sim' },
          { value: 'Não', label: 'Não' }
        ]
      },
      {
        label: 'Informações Adicionais',
        name: 'info_add',
        type: 'textarea',
        required: true
      }
    ]
  }
];

// Mantém o userFormFields para compatibilidade
export const userFormFields: UserFormFields[] = formSections.flatMap(section => section.fields);