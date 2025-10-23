/**
 * Validadores de formulário para garantir qualidade dos dados
 */

/**
 * Valida se um valor não está vazio e não contém placeholders inválidos
 * @param value - Valor do campo a ser validado
 * @param fieldName - Nome do campo (para mensagens de erro)
 * @returns true se válido, string com mensagem de erro se inválido
 */
export function validateRequiredField(value: any, fieldName: string = 'campo'): boolean | string {
  // Verifica se o valor existe e não está vazio
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} é obrigatório`;
  }

  const stringValue = String(value).trim();

  // Padrões inválidos que não devem ser aceitos
  const invalidPatterns = [
    /^não\s/i,                    // "Não informado", "Não especificado", etc.
    /^n[aã]o\s/i,                 // Variações com acentuação
    /^n\/a$/i,                    // "N/A"
    /^-+$/,                       // Apenas traços: "-", "--", "---"
    /^\.+$/,                      // Apenas pontos: ".", "..", "..."
    /^_+$/,                       // Apenas underscores: "_", "__"
    /^\s+$/,                      // Apenas espaços em branco
    /^sem\s/i,                    // "Sem informação", "Sem dados"
    /^vazio$/i,                   // "Vazio"
    /^indefinido$/i,              // "Indefinido"
    /^null$/i,                    // "null"
    /^undefined$/i,               // "undefined"
    /^nenhum/i,                   // "Nenhum", "Nenhuma"
    /^desconhecido/i,             // "Desconhecido"
  ];

  // Verifica se o valor corresponde a algum padrão inválido
  for (const pattern of invalidPatterns) {
    if (pattern.test(stringValue)) {
      return `${fieldName} não pode conter valores como "Não informado", "N/A", etc. Por favor, preencha com informação válida`;
    }
  }

  return true;
}

/**
 * Valida se a igreja está em uma lista predefinida (quando aplicável)
 * @param churchName - Nome da igreja
 * @param churchList - Lista de igrejas válidas (opcional)
 * @returns true se válido, string com mensagem de erro se inválido
 */
export function validateChurchField(churchName: string, churchList?: string[]): boolean | string {
  // Primeiro valida se não está vazio ou com placeholder inválido
  const requiredValidation = validateRequiredField(churchName, 'Igreja');
  if (requiredValidation !== true) {
    return requiredValidation;
  }

  // Se há uma lista de igrejas, valida contra ela
  if (churchList && churchList.length > 0) {
    const normalizedInput = churchName.trim().toLowerCase();
    const isInList = churchList.some(church => 
      church.trim().toLowerCase() === normalizedInput
    );

    if (!isInList) {
      return 'Por favor, selecione uma igreja da lista disponível';
    }
  }

  // Validações adicionais de qualidade
  if (churchName.trim().length < 3) {
    return 'Nome da igreja deve ter pelo menos 3 caracteres';
  }

  return true;
}

/**
 * Valida um campo de texto geral (nome, endereço, etc.)
 * @param value - Valor do campo
 * @param fieldName - Nome do campo para mensagens
 * @param minLength - Comprimento mínimo (padrão: 2)
 * @returns true se válido, string com mensagem de erro se inválido
 */
export function validateTextField(value: string, fieldName: string = 'campo', minLength: number = 2): boolean | string {
  const requiredValidation = validateRequiredField(value, fieldName);
  if (requiredValidation !== true) {
    return requiredValidation;
  }

  if (value.trim().length < minLength) {
    return `${fieldName} deve ter pelo menos ${minLength} caracteres`;
  }

  return true;
}

/**
 * Valida todos os campos de um formulário
 * @param values - Objeto com todos os valores do formulário
 * @param requiredFields - Array com nomes dos campos obrigatórios
 * @returns Objeto com erros (vazio se tudo válido)
 */
export function validateAllFields(
  values: Record<string, any>,
  requiredFields: string[]
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const fieldName of requiredFields) {
    const value = values[fieldName];
    
    // Validação especial para igreja
    if (fieldName === 'church') {
      const churchValidation = validateChurchField(value);
      if (typeof churchValidation === 'string') {
        errors[fieldName] = churchValidation;
      }
      continue;
    }

    // Validação padrão para outros campos
    const validation = validateRequiredField(value, fieldName);
    if (typeof validation === 'string') {
      errors[fieldName] = validation;
    }
  }

  return errors;
}
