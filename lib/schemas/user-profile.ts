import { z } from 'zod';

// Função auxiliar para validar e logar valores
const createValidatorWithLogs = (fieldName: string, validator: (val: any) => boolean, errorMessage: string) => {
  return (val: any) => {
    console.log(`Validando ${fieldName}:`, {
      valor: val,
      tipo: typeof val,
      tamanho: val?.length,
      bytesUTF8: val ? new TextEncoder().encode(val).length : 0
    });
    
    const isValid = validator(val);
    if (!isValid) {
      console.error(`Erro na validação de ${fieldName}:`, errorMessage);
    }
    return isValid || errorMessage;
  };
};

export const userProfileSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  church: z.string().min(2, 'Nome da igreja é obrigatório'),
  pastor: z.string().min(2, 'Nome do pastor é obrigatório'),
  ddd: z.string().refine(
    createValidatorWithLogs(
      'ddd',
      (val) => /^\d{2}$/.test(val),
      'DDD deve conter exatamente 2 dígitos'
    )
  ),
  cellphone: z.string().refine(
    createValidatorWithLogs(
      'cellphone',
      (val) => /^\d{9}$/.test(val),
      'Celular deve conter 9 dígitos'
    )
  ),
  gender: z.enum(['male', 'female'], {
    required_error: 'Gênero é obrigatório',
    invalid_type_error: 'Gênero inválido'
  }),
  cep: z.string().refine(
    createValidatorWithLogs(
      'cep',
      (val) => /^\d{8}$/.test(val),
      'CEP deve conter 8 dígitos'
    )
  ),
  cpf: z.string().refine(
    createValidatorWithLogs(
      'cpf',
      (val) => /^\d{11}$/.test(val),
      'CPF deve conter 11 dígitos'
    )
  ),
  data_nasc: z.string().refine(
    createValidatorWithLogs(
      'data_nasc',
      (val) => {
        const [day, month, year] = val.split('/').map(Number);
        const date = new Date(year, month - 1, day);
        return date instanceof Date && !isNaN(date.getTime());
      },
      'Data de nascimento inválida'
    )
  ),
  idade: z.number()
    .min(0, 'Idade não pode ser negativa')
    .max(120, 'Idade inválida'),
  responsavel: z.string()
    .min(3, 'Nome do responsável deve ter no mínimo 3 caracteres')
    .or(z.literal('')),
  documento_responsavel: z.string()
    .refine(
      (val) => !val || /^\d{11}$/.test(val),
      'CPF do responsável deve conter 11 dígitos'
    )
    .or(z.literal('')),
  ddd_responsavel: z.string()
    .refine(
      (val) => !val || /^\d{2}$/.test(val),
      'DDD do responsável deve conter 2 dígitos'
    )
    .or(z.literal('')),
  cellphone_responsavel: z.string()
    .refine(
      (val) => !val || /^\d{9}$/.test(val),
      'Celular do responsável deve conter 9 dígitos'
    )
    .or(z.literal('')),
  address: z.string().min(5, 'Endereço deve ter no mínimo 5 caracteres'),
  complemento: z.string().min(1, 'Complemento é obrigatório'),
  cidade: z.string().min(2, 'Cidade é obrigatória'),
  estado: z.string().length(2, 'Estado inválido'),
  alergia: z.string().refine(
    (val) => {
      if (val === 'Não') return true;
      if (val.startsWith('Sim - ')) return val.length > 6;
      return false;
    },
    'Se marcou que tem alergia, por favor especifique qual'
  ),
  medicamento: z.string().refine(
    (val) => {
      if (val === 'Não') return true;
      if (val.startsWith('Sim - ')) return val.length > 6;
      return false;
    },
    'Se marcou que toma medicamento, por favor especifique qual'
  ),
  info_add: z.string().min(1, 'Informações adicionais são obrigatórias'),
}).refine((data) => {
  console.log('Validando dados de menor de idade:', {
    idade: data.idade,
    temResponsavel: !!data.responsavel,
    temDocumentoResponsavel: !!data.documento_responsavel,
    temDDDResponsavel: !!data.ddd_responsavel,
    temCellphoneResponsavel: !!data.cellphone_responsavel
  });
  
  if (data.idade < 18) {
    return !!data.responsavel && 
           !!data.documento_responsavel && 
           !!data.ddd_responsavel && 
           !!data.cellphone_responsavel;
  }
  return true;
}, {
  message: 'Dados do responsável são obrigatórios para menores de idade',
  path: ['responsavel'],
});