import { useState, useEffect, useCallback } from 'react';

interface ValidationRule {
  pattern?: RegExp;
  validate?: (value: string) => boolean | string;
  message?: string;
}

interface UseFormValidationProps {
  initialValues: Record<string, any>;
  validationRules?: Record<string, ValidationRule>;
}

export function useFormValidation({ initialValues, validationRules = {} }: UseFormValidationProps) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

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
      }
    }
  }, [values.data_nasc]);

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
      const result = rule.validate(value);
      if (typeof result === 'string') return result;
      if (result === false) return rule.message || 'Valor inválido';
    }

    return '';
  }, [validationRules]);

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
  }, [values, validationRules, validateField]);

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
