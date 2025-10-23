'use client';

import { useFormContext, Controller } from 'react-hook-form';
import { 
  FormControl, 
  FormDescription, 
  FormField as ShadcnFormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

type FieldType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'date';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface FormFieldProps {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  type?: FieldType;
  options?: SelectOption[];
  disabled?: boolean;
  required?: boolean;
  className?: string;
  rows?: number; // Para textarea
  min?: number; // Para number/date
  max?: number; // Para number/date
  step?: number; // Para number
  maxLength?: number; // Para text/textarea
}

/**
 * FormField - Campo de formulário reutilizável integrado com React Hook Form
 * 
 * @example
 * ```tsx
 * // Dentro de um Form com FormProvider
 * <FormField 
 *   name="email"
 *   label="Email"
 *   type="email"
 *   placeholder="seu@email.com"
 *   required
 * />
 * 
 * <FormField 
 *   name="gender"
 *   label="Gênero"
 *   type="select"
 *   options={[
 *     { value: 'male', label: 'Masculino' },
 *     { value: 'female', label: 'Feminino' }
 *   ]}
 * />
 * ```
 */
export function FormField({ 
  name, 
  label, 
  description, 
  placeholder, 
  type = 'text', 
  options, 
  disabled,
  required,
  className,
  rows = 3,
  min,
  max,
  step,
  maxLength
}: FormFieldProps) {
  const form = useFormContext();

  if (!form) {
    console.error('FormField deve ser usado dentro de um FormProvider');
    return null;
  }

  const renderField = (field: any) => {
    switch (type) {
      case 'textarea':
        return (
          <Textarea
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            maxLength={maxLength}
            className={className}
            {...field}
          />
        );

      case 'select':
        if (!options || options.length === 0) {
          console.warn(`FormField: campo "${name}" do tipo select precisa de options`);
          return null;
        }
        return (
          <Select 
            onValueChange={field.onChange} 
            defaultValue={field.value} 
            disabled={disabled}
          >
            <SelectTrigger className={className}>
              <SelectValue placeholder={placeholder || 'Selecione...'} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={name}
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              className={className}
            />
            <label
              htmlFor={name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {placeholder || label}
            </label>
          </div>
        );

      case 'radio':
        if (!options || options.length === 0) {
          console.warn(`FormField: campo "${name}" do tipo radio precisa de options`);
          return null;
        }
        return (
          <RadioGroup
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
            className={cn("flex flex-col space-y-1", className)}
          >
            {options.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={option.value} 
                  id={`${name}-${option.value}`}
                  disabled={option.disabled}
                />
                <label
                  htmlFor={`${name}-${option.value}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'date':
        return (
          <Input
            type="date"
            placeholder={placeholder}
            disabled={disabled}
            min={min?.toString()}
            max={max?.toString()}
            className={className}
            {...field}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={placeholder}
            disabled={disabled}
            min={min}
            max={max}
            step={step}
            className={className}
            {...field}
            onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
          />
        );

      default:
        // text, email, password, tel
        return (
          <Input
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            className={className}
            {...field}
          />
        );
    }
  };

  return (
    <ShadcnFormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          {type !== 'checkbox' && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            {renderField(field)}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
