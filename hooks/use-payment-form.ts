import { useState } from 'react';

interface PaymentFormData {
  name: string;
  email: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
}

export function usePaymentForm() {
  const [formData, setFormData] = useState<PaymentFormData>({
    name: '',
    email: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Número do cartão é obrigatório';
    } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
      newErrors.cardNumber = 'Número do cartão inválido';
    }

    if (!formData.expiry.trim()) {
      newErrors.expiry = 'Validade é obrigatória';
    } else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiry)) {
      newErrors.expiry = 'Validade inválida (MM/AA)';
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV é obrigatório';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      newErrors.cvv = 'CVV inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof PaymentFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      cardNumber: '',
      expiry: '',
      cvv: ''
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    handleChange,
    validateForm,
    resetForm
  };
} 