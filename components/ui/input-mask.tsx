import { Input } from '@/components/ui/input';
import { forwardRef, useEffect } from 'react';
import { IMaskInput } from 'react-imask';

interface InputMaskProps {
  mask: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  name?: string;
}

export const InputMask = forwardRef<HTMLInputElement, InputMaskProps>(
  ({ mask, value, onChange, placeholder, name, ...props }, ref) => {
    useEffect(() => {
      console.log(`InputMask [${name || 'unnamed'}] - Valor inicial:`, { value, tipo: typeof value });
    }, [value, name]);

    // Função para aplicar a máscara a um valor
    const applyMask = (value: string, mask: string): string => {
      if (!value) return '';
      
      // Remove tudo que não for dígito
      const numericValue = value.replace(/\D/g, '');
      
      // Aplica a máscara de acordo com o padrão
      if (mask === '00.000-000') { // CEP
        if (numericValue.length < 5) return numericValue;
        if (numericValue.length <= 8) {
          return `${numericValue.slice(0, 2)}.${numericValue.slice(2, 5)}-${numericValue.slice(5)}`;
        }
      } else if (mask === '000.000.000-00') { // CPF
        if (numericValue.length < 3) return numericValue;
        if (numericValue.length < 6) return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
        if (numericValue.length < 9) return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
        if (numericValue.length <= 11) return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9)}`;
      } else if (mask === '00/00/0000') { // Data
        if (numericValue.length < 2) return numericValue;
        if (numericValue.length < 4) return `${numericValue.slice(0, 2)}/${numericValue.slice(2)}`;
        if (numericValue.length <= 8) return `${numericValue.slice(0, 2)}/${numericValue.slice(2, 4)}/${numericValue.slice(4)}`;
      } else if (mask === '00000-0000') { // Telefone
        if (numericValue.length < 5) return numericValue;
        if (numericValue.length <= 9) return `${numericValue.slice(0, 5)}-${numericValue.slice(5)}`;
      } else if (mask === '00') { // DDD
        return numericValue.slice(0, 2);
      }
      
      return value;
    };

    return (
      <IMaskInput
        mask={mask}
        value={value}
        unmask={false} // Mantém a formatação com a máscara
        onAccept={(value: string, maskRef: any) => {
          console.log(`InputMask [${name || 'unnamed'}] - Valor após formatação:`, { 
            valor: value,
            valorUnmasked: maskRef.unmaskedValue,
            tipo: typeof value,
            mask: mask 
          });
          
          // Garante que o valor formatado seja passado para o formulário
          const formattedValue = applyMask(value, mask);
          onChange(formattedValue);
        }}
        placeholder={placeholder}
        inputRef={ref}
        {...props}
        name={name}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    );
  }
);

InputMask.displayName = 'InputMask'; 