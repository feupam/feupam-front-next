'use client';

import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useProfileForm } from '@/hooks/useProfileForm';
import { formSections, UserProfile } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { InputMask } from '@/components/ui/input-mask';
import type { ControllerRenderProps, UseFormStateReturn, ControllerFieldState } from 'react-hook-form';
import { useEffect, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Loader2, AlertCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useToast } from '@/components/ui/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';
import { useRouter } from 'next/navigation';

interface FormFieldProps {
  field: ControllerRenderProps<UserProfile, keyof UserProfile>;
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<UserProfile>;
}

export interface ProfileFormProps {
  initialData?: UserProfile | null;
  redirectToEvent?: string;
  ticketKind?: string;
  isOpen: boolean;
}

export function ProfileForm({ initialData, redirectToEvent, ticketKind = 'full', isOpen = true }: ProfileFormProps) {
  const { theme } = useTheme();
  const [alergiaExtra, setAlergiaExtra] = useState('');
  const [medicamentoExtra, setMedicamentoExtra] = useState('');
  const { toast } = useToast();
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { currentEvent, isCurrentEventOpen, refreshCurrentEvent, setCurrentEventByName } = useCurrentEventContext();
  const router = useRouter();
  
  // Se não tem evento no contexto, busca o evento padrão
  useEffect(() => {
    if (!currentEvent) {
      setCurrentEventByName('federa');
    }
  }, [currentEvent, setCurrentEventByName]);
  
  const { form, onSubmit: originalOnSubmit, isSubmitting } = useProfileForm({ 
    initialData: initialData || undefined,
    redirectToEvent,
    ticketKind,
    alergiaExtra,
    medicamentoExtra,
    isOpen
  });

  useEffect(() => {
    if (initialData?.alergia?.startsWith('Sim - ')) {
      setAlergiaExtra(initialData.alergia.replace('Sim - ', ''));
    }
    if (initialData?.medicamento?.startsWith('Sim - ')) {
      setMedicamentoExtra(initialData.medicamento.replace('Sim - ', ''));
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Verifica se há campos obrigatórios vazios
    const requiredFields = ['name', 'church', 'pastor', 'ddd', 'cellphone', 'cep', 'cpf', 'data_nasc'] as const;
    const emptyFields = requiredFields.filter(field => !form.getValues(field));
    
    if (emptyFields.length > 0) {
      setFormError('Por favor, preencha todos os campos obrigatórios antes de salvar.');
      toast({
        title: 'Campos obrigatórios',
        description: 'Alguns campos obrigatórios estão vazios. Verifique o formulário.',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Configura os valores de alergia e medicamento
      if (form.getValues('alergia') === 'Sim') {
        form.setValue('alergia', alergiaExtra ? `Sim - ${alergiaExtra}` : 'Sim');
      }
      if (form.getValues('medicamento') === 'Sim') {
        form.setValue('medicamento', medicamentoExtra ? `Sim - ${medicamentoExtra}` : 'Sim');
      }
      
      // Salva o perfil
      await originalOnSubmit(e);
      
      // Redirecionamento baseado no status do evento
      if (currentEvent) {
        if (isCurrentEventOpen) {
          // Se evento está aberto: vai para reserva
          window.location.href = `/reserva/${currentEvent.name}/${ticketKind}`;
        } else {
          // Se evento está fechado: vai para página do evento (mostra card com startDate/endDate)
          window.location.href = `/event/${currentEvent.name}`;
        }
      } else {
        // Fallback: vai para lista de eventos
        window.location.href = '/eventos';
      }
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        return;
      }
      
      if (error.message?.includes('CPF already exists')) {
        const msg = 'Já existe um usuário cadastrado com este CPF.';
        setFormError(msg);
        toast({
          title: 'Erro no cadastro',
          description: msg,
          variant: 'destructive'
        });
      } else {
        const msg = error.message || 'Ocorreu um erro ao salvar seu perfil. Tente novamente.';
        setFormError(msg);
        toast({
          title: 'Erro ao salvar perfil',
          description: msg,
          variant: 'destructive'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = ({ field, fieldState }: FormFieldProps): JSX.Element => {
    const fieldConfig = formSections
      .flatMap(section => section.fields)
      .find(f => f.name === field.name);

    if (!fieldConfig) return <div />;

    const { label, type, placeholder, options, mask, required } = fieldConfig;
    const hasError = fieldState.error;

    if (type === 'select') {
      return (
        <FormItem>
          <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
            {label}
          </FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={String(field.value || '')}
            disabled={isLoading || isSubmitting}
          >
            <FormControl>
              <SelectTrigger className={hasError ? 'border-red-500' : ''}>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      );
    }

    if (type === 'textarea') {
      return (
        <FormItem>
          <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              className={`resize-none ${hasError ? 'border-red-500' : ''}`}
              disabled={isLoading || isSubmitting}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      );
    }

    if (mask) {
      return (
        <FormItem>
          <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
            {label}
          </FormLabel>
          <FormControl>
            <InputMask
              {...field}
              value={String(field.value || '')}
              mask={mask}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      );
    }

    return (
      <FormItem>
        <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
          {label}
        </FormLabel>
        <FormControl>
          <Input
            {...field}
            type={type}
            placeholder={placeholder}
            className={hasError ? 'border-red-500' : ''}
            disabled={isLoading || isSubmitting}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
        {formError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}

        {formSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} className="border-2 border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-primary text-center">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.fields.map((fieldConfig) => (
                  <div key={fieldConfig.name}>
                    <FormField
                      control={form.control}
                      name={fieldConfig.name as keyof UserProfile}
                      render={({ field, fieldState }) => renderField({ field, fieldState, formState: form.formState })}
                    />

                    {fieldConfig.name === 'alergia' && form.watch('alergia') === 'Sim' && (
                      <div className="mt-2">
                        <FormLabel>Especifique a alergia:</FormLabel>
                        <Input
                          value={alergiaExtra}
                          onChange={(e) => setAlergiaExtra(e.target.value)}
                          placeholder="Descreva a alergia..."
                          disabled={isLoading || isSubmitting}
                        />
                      </div>
                    )}

                    {fieldConfig.name === 'medicamento' && form.watch('medicamento') === 'Sim' && (
                      <div className="mt-2">
                        <FormLabel>Especifique o medicamento:</FormLabel>
                        <Input
                          value={medicamentoExtra}
                          onChange={(e) => setMedicamentoExtra(e.target.value)}
                          placeholder="Descreva o medicamento..."
                          disabled={isLoading || isSubmitting}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <div className="flex justify-center">
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting}
            className="min-w-[140px]"
          >
            {(isLoading || isSubmitting) ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Salvar Alterações'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
