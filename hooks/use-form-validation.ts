import { useState, useEffect, useCallback } from 'react';

interface ValidationRule {
  pattern?: RegExp;
  validate?: (value: string, context?: any) => boolean | string;
  message?: string;
}

interface UseFormValidationProps {
  initialValues: Record<string, any>;
  validationRules?: Record<string, ValidationRule>;
  validationContext?: any;
}

export function useFormValidation({ initialValues, validationRules = {}, validationContext }: UseFormValidationProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [initialValidationDone, setInitialValidationDone] = useState(false);

  // Validação inicial quando o formulário carrega com dados (modo de atualização)
  // Também revalida quando o contexto de validação muda (evento carregado)
  useEffect(() => {
    if (Object.keys(values).length > 0 && validationContext && 
        (validationContext.idadeMinima !== undefined || validationContext.idadeMaxima !== undefined)) {
      
      const initialErrors: Record<string, string> = {};
      
      Object.keys(validationRules).forEach(fieldName => {
        const rule = validationRules[fieldName];
        const value = values[fieldName];
        
        if (value && rule?.validate) {
          const result = rule.validate(String(value), validationContext);
          if (typeof result === 'string') {
            initialErrors[fieldName] = result;
          }
        }
      });
      
      if (Object.keys(initialErrors).length > 0) {
        setErrors(prevErrors => ({ ...prevErrors, ...initialErrors }));
        // Marca campos com erro como "touched" para exibir o erro
        const touchedFields: Record<string, boolean> = {};
        Object.keys(initialErrors).forEach(field => {
          touchedFields[field] = true;
        });
        setTouched(prevTouched => ({ ...prevTouched, ...touchedFields }));
      }
      
      setInitialValidationDone(true);
    }
  }, [validationContext, values, validationRules]);

  // Calcula idade automaticamente quando data_nasc é preenchida
  useEffect(() => {
    if (values.data_nasc) {
      const birthDate = new Date(values.data_nasc);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age !== values.idade && age >= 0 && age <= 120) {
        setValues(prev => ({ ...prev, idade: age }));
        
        // Valida idade contra restrições do evento (SE EXISTIREM AMBOS OS LIMITES)
        if (validationContext?.idadeMinima !== undefined && validationContext?.idadeMaxima !== undefined) {
          const minAge = validationContext.idadeMinima;
          const maxAge = validationContext.idadeMaxima;
          
          if (age < minAge || age > maxAge) {
            setErrors(prev => ({ 
              ...prev, 
              data_nasc: `Este evento é para idades de ${minAge} a ${maxAge} anos (incluindo ${minAge} e ${maxAge}). Sua idade: ${age} anos.`
            }));
            setTouched(prev => ({ ...prev, data_nasc: true }));
          } else {
            // Remove erro se idade está válida
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.data_nasc;
              return newErrors;
            });
          }
        }
      }
    }
  }, [values.data_nasc, validationContext]);

  // Função para aplicar máscaras
  const applyMask = useCallback((value: string, mask?: string): string => {
    if (!mask || !value) return value;
    
    const cleanValue = value.replace(/\D/g, '');
    let maskedValue = '';
    let valueIndex = 0;
    
    for (let i = 0; i < mask.length && valueIndex < cleanValue.length; i++) {
      if (mask[i] === '0') {
        maskedValue += cleanValue[valueIndex];
        valueIndex++;
      } else {
        maskedValue += mask[i];
      }
    }
    
    return maskedValue;
  }, []);

  // Formata CPF automaticamente se vier sem máscara do banco
  useEffect(() => {
    if (values.cpf && typeof values.cpf === 'string') {
      const cleanCPF = values.cpf.replace(/\D/g, '');
      // Se tem 11 dígitos mas não tem pontos e traço, aplicar máscara
      if (cleanCPF.length === 11 && !values.cpf.includes('.')) {
        const maskedCPF = applyMask(cleanCPF, '000.000.000-00');
        if (maskedCPF !== values.cpf) {
          setValues(prev => ({ ...prev, cpf: maskedCPF }));
        }
      }
    }
  }, [values.cpf, applyMask]);

  // Função para validar um campo
  const validateField = useCallback((name: string, value: string): string => {
    const rule = validationRules[name];
    if (!rule) return '';

    // Se o campo está vazio e não é obrigatório, não valida
    if (!value) return '';

    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || 'Formato inválido';
    }

    if (rule.validate) {
      const result = rule.validate(value, validationContext);
      if (typeof result === 'string') return result;
      if (result === false) return rule.message || 'Valor inválido';
    }

    return '';
  }, [validationRules, validationContext]);

  // Função para atualizar um campo
  const updateField = useCallback((name: string, value: string, mask?: string) => {
    const maskedValue = mask ? applyMask(value, mask) : value;
    
    setValues(prev => ({ ...prev, [name]: maskedValue }));
    
    // Marca o campo como tocado
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Valida o campo em tempo real apenas se já foi tocado
    const error = validateField(name, maskedValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, applyMask]);

  // Função para validar todos os campos
  const validateAll = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      const error = validateField(name, values[name] || '');
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validationRules, validateField, validationContext]);

  // Buscar endereço por CEP
  const fetchAddressByCep = useCallback(async (cep: string) => {
    if (cep.length === 10) { // CEP com máscara completa
      try {
        const cleanCep = cep.replace(/\D/g, '');
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (!data.erro && data.logradouro) {
          setValues(prev => ({
            ...prev,
            address: data.logradouro || prev.address || '',
            cidade: data.localidade || prev.cidade || '',
            estado: data.uf || prev.estado || ''
          }));
        }
      } catch (error) {
        console.error('Erro ao buscar CEP:', error);
      }
    }
  }, []);

  // Função para marcar campo como tocado
  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Valida o campo quando é marcado como tocado
    const error = validateField(name, values[name] || '');
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField, values]);

  // Função para obter status de validação de um campo
  const getFieldStatus = useCallback((name: string) => {
    const hasError = Boolean(errors[name]);
    const isTouched = Boolean(touched[name]);
    const hasValue = Boolean(values[name]);
    
    return {
      hasError,
      showError: hasError && isTouched,
      isValid: !hasError && isTouched && hasValue,
      error: errors[name] || ''
    };
  }, [errors, touched, values]);

  return {
    values,
    errors,
    touched,
    updateField,
    validateAll,
    setFieldTouched,
    getFieldStatus,
    fetchAddressByCep
  };
}
