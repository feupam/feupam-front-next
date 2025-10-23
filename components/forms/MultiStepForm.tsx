'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formSections, FormField } from '@/types/user';
import { acampamentoFormSections, AcampamentoFormField, isAcampamentoEvent, getTermosDownloadUrl } from '@/types/acampamento-form';
import { useFormValidation } from '@/hooks/use-form-validation';
import { useCurrentEventContext } from '@/contexts/CurrentEventContext';
import { useLoading } from '@/contexts/LoadingContext';

interface MultiStepFormProps {
  initialValues?: Record<string, any>;
  onSubmit: (values: Record<string, any>) => void;
  isLoading?: boolean;
  isExistingUser?: boolean;
  ticketKind?: string;
}

export default function MultiStepForm({ 
  initialValues = {}, 
  onSubmit, 
  isLoading = false,
  isExistingUser = false,
  ticketKind = 'full'
}: MultiStepFormProps) {
  console.log('=== MultiStepForm RENDERIZANDO ===');
  console.log('isExistingUser:', isExistingUser);
  console.log('onSubmit function:', typeof onSubmit);
  
  const [currentStep, setCurrentStep] = useState(0); // Inicia na primeira etapa
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set()); // Inicia vazio, preenchido conforme progresso
  const [submitError, setSubmitError] = useState<string | null>(null); // Estado para erro de submissão
  const { currentEvent, isCurrentEventOpen, setCurrentEventByName } = useCurrentEventContext();
  const { setLoading } = useLoading();

  // Determina qual formulário usar baseado no evento
  const isAcampamento = currentEvent ? isAcampamentoEvent(currentEvent.name) : false;
  const sections = isAcampamento ? acampamentoFormSections : formSections;
  
  console.log('[MultiStepForm] ========================================');
  console.log('[MultiStepForm] Tipo de formulário:', isAcampamento ? 'ACAMPAMENTO' : 'PADRÃO');
  console.log('[MultiStepForm] Evento:', currentEvent?.name);
  console.log('[MultiStepForm] Número de seções:', sections.length);
  console.log('[MultiStepForm] Nome das seções:', sections.map(s => s.title));
  console.log('[MultiStepForm] ========================================');

  // Se não tem evento no contexto, busca o evento padrão
  useEffect(() => {
    console.log('=== DEBUG CONTEXT ===');
    console.log('currentEvent no useEffect:', currentEvent);
    console.log('isCurrentEventOpen:', isCurrentEventOpen);
    console.log('Restrições de idade:', {
      idadeMinima: currentEvent?.idadeMinima,
      idadeMaxima: currentEvent?.idadeMaxima
    });
    
    if (!currentEvent) {
      console.log('Não tem currentEvent, buscando federa...');
      setCurrentEventByName('federa');
    }
  }, [currentEvent, setCurrentEventByName, isCurrentEventOpen]);

  // Regras de validação
  const validationRules = sections.reduce((acc, section) => {
    section.fields.forEach(field => {
      if (field.validation) {
        acc[field.name] = field.validation;
      }
    });
    return acc;
  }, {} as Record<string, any>);

  // Contexto de validação com restrições de idade do evento
  const validationContext = {
    idadeMinima: currentEvent?.idadeMinima,
    idadeMaxima: currentEvent?.idadeMaxima
  };
  
  console.log('[MultiStepForm] Contexto de validação:', validationContext);
  console.log('[MultiStepForm] Evento atual:', {
    nome: currentEvent?.name,
    idadeMinima: currentEvent?.idadeMinima,
    idadeMaxima: currentEvent?.idadeMaxima
  });

  const {
    values,
    errors,
    touched,
    updateField,
    validateAll,
    setFieldTouched,
    getFieldStatus,
    fetchAddressByCep
  } = useFormValidation({
    initialValues,
    validationRules,
    validationContext
  });

  // Verificar se um step está completo
  const isStepComplete = (stepIndex: number): boolean => {
    const section = sections[stepIndex];
    return section.fields.every(field => {
      if (!field.required) return true;
      const value = values[field.name];
      const status = getFieldStatus(field.name);
      
      console.log(`[isStepComplete] Campo '${field.name}':`, {
        value,
        hasError: status.hasError,
        error: status.error
      });
      
      return value && !status.hasError;
    });
  };

  // Atualizar steps completos
  useEffect(() => {
    const newCompletedSteps = new Set<number>();
    sections.forEach((_, index) => {
      if (isStepComplete(index)) {
        newCompletedSteps.add(index);
      }
    });
    setCompletedSteps(newCompletedSteps);
  }, [values, errors, sections]);

  // Buscar CEP quando preenchido
  useEffect(() => {
    if (values.cep) {
      fetchAddressByCep(values.cep);
    }
  }, [values.cep, fetchAddressByCep]);

  const nextStep = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
      setSubmitError(null); // Limpa erro ao navegar
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setSubmitError(null); // Limpa erro ao navegar
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    console.log('=== DEBUG SUBMIT ===');
    console.log('1. Evento prevenido');
    console.log('1.1. É acampamento?', isAcampamento);
    console.log('1.2. isExistingUser?', isExistingUser);
    
    // Para acampamento: não valida, apenas submete os dados básicos que já existem
    // O formulário de acampamento é apenas informativo, não bloqueia a inscrição
    const skipValidation = isAcampamento;
    
    let isValid = true;
    
    if (!skipValidation) {
      // Valida todos os campos antes de submeter (apenas para formulário padrão)
      isValid = validateAll();
      console.log('2. Validação resultado:', isValid);
      console.log('3. Erros atuais:', errors);
    } else {
      console.log('2. Validação pulada (acampamento) - submetendo direto');
    }
    
    console.log('4. Valores atuais:', values);
    console.log('5. Idade do usuário:', values.idade);
    
    if (isValid) {
      console.log('5. Validação passou, executando onSubmit...');
      try {
        // Garante que info_add tenha um valor padrão se estiver vazio
        const dataToSubmit = {
          ...values,
          info_add: values.info_add || 'Nenhuma informação adicional'
        };
        console.log('5.1. Dados preparados para envio:', dataToSubmit);
        
        // Executa o onSubmit (salva os dados)
        await onSubmit(dataToSubmit);
        console.log('6. onSubmit executado com sucesso');
        
        // Redirecionamento baseado no status do evento
        console.log('7. Verificando redirecionamento...');
        console.log('   - currentEvent:', currentEvent);
        console.log('   - isCurrentEventOpen:', isCurrentEventOpen);
        console.log('   - ticketKind:', ticketKind);
        
        if (currentEvent) {
          // Salvar evento no localStorage antes de redirecionar
          sessionStorage.setItem('navigating', 'true');
          const eventData = {
            id: currentEvent.uuid || currentEvent.name,
            name: currentEvent.name,
            eventStatus: currentEvent,
            savedAt: new Date().toISOString(),
          };
          localStorage.setItem('selected_event', JSON.stringify(eventData));
          console.log('7.5. Evento salvo no localStorage:', eventData);
          
          if (isCurrentEventOpen) {
            // Se evento está aberto: vai para reserva
            // Usar o nome do evento encodado para evitar problemas com caracteres especiais
            const encodedEventName = encodeURIComponent(currentEvent.name);
            const url = `/reserva/${encodedEventName}/${ticketKind}`;
            console.log('8. Redirecionando para reserva:', url);
            console.log('   - Event name original:', currentEvent.name);
            console.log('   - Event name encoded:', encodedEventName);
            window.location.href = url;
          } else {
            // Se evento está fechado: vai para página do evento (mostra card com startDate/endDate)
            const encodedEventName = encodeURIComponent(currentEvent.name);
            const url = `/event/${encodedEventName}?fromProfile=true`;
            console.log('8. Redirecionando para evento:', url);
            window.location.href = url;
          }
        } else {
          // Fallback: vai para lista de eventos
          const url = '/eventos';
          console.log('8. Redirecionando para eventos:', url);
          window.location.href = url;
        }
      } catch (error: any) {
        console.error('Erro ao submeter formulário:', error);
        console.log('9. Erro capturado, não redirecionando');
        
        // Define mensagem de erro para o usuário
        if (error.message && typeof error.message === 'string') {
          setSubmitError(error.message);
        } else if (error.message && Array.isArray(error.message)) {
          setSubmitError(error.message.join(', '));
        } else {
          setSubmitError('Erro ao enviar formulário. Verifique os dados e tente novamente.');
        }
        
        // Volta para o primeiro step para o usuário revisar os dados
        setCurrentStep(0);
      } finally {
        setLoading(false);
      }
    } else {
      console.log('5. Validação falhou, não executando submit');
      console.log('5.1. Erros encontrados:', errors);
      console.log('5.2. Campos com erro:', Object.keys(errors));
      
      // Mostra mensagem de erro específica se for problema de idade
      if (errors.data_nasc) {
        setSubmitError(errors.data_nasc);
      } else {
        setSubmitError('Por favor, corrija os erros no formulário antes de continuar.');
      }
      
      // Vai para a primeira etapa com erro
      const firstStepWithError = sections.findIndex(section => 
        section.fields.some(field => errors[field.name])
      );
      
      console.log('5.3. Primeira etapa com erro (índice):', firstStepWithError);
      if (firstStepWithError !== -1) {
        console.log('5.4. Nome da seção com erro:', sections[firstStepWithError].title);
        console.log('5.5. Campos com erro nessa seção:', 
          sections[firstStepWithError].fields
            .filter(field => errors[field.name])
            .map(field => ({ nome: field.name, erro: errors[field.name] }))
        );
        setCurrentStep(firstStepWithError);
      }
      
      setLoading(false);
    }
  };

  const renderField = (field: FormField | AcampamentoFormField) => {
    const status = getFieldStatus(field.name);
    let value = values[field.name];
    
    // Se o campo não tem valor e tem defaultValue, usar o defaultValue e definir nos values
    if (!value && 'defaultValue' in field && field.defaultValue) {
      value = field.defaultValue;
      // Define o valor padrão nos values se ainda não foi definido
      if (values[field.name] === undefined) {
        updateField(field.name, field.defaultValue);
      }
    }
    
    // Fallback para string vazia se ainda não há valor
    value = value || '';

    const fieldProps = {
      id: field.name,
      value,
      onBlur: () => setFieldTouched(field.name),
      className: cn(
        "transition-all duration-200",
        status.hasError && status.showError && "border-red-500 ring-red-500",
        status.isValid && "border-green-500 ring-green-500"
      )
    };

    switch (field.type) {
      case 'text':
      case 'tel':
        // Tratamento especial para o campo de download de termos
        if (field.name === 'termos_baixados' && isAcampamento && currentEvent) {
          const downloadUrl = getTermosDownloadUrl(currentEvent.name);
          const isDownloaded = value === 'downloaded';
          
          return (
            <div className="space-y-3">
              <a
                href={downloadUrl}
                download
                onClick={() => {
                  // Marca como baixado após o clique
                  setTimeout(() => {
                    updateField(field.name, 'downloaded');
                  }, 500);
                }}
                className={cn(
                  "flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all",
                  isDownloaded 
                    ? "bg-green-100 text-green-700 border-2 border-green-500" 
                    : "bg-emerald-600 text-white hover:bg-emerald-700"
                )}
              >
                {isDownloaded ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Documento baixado com sucesso
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Baixar Documento de Termos e Condições
                  </>
                )}
              </a>
              {isDownloaded && (
                <p className="text-sm text-green-600 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Você já baixou o documento. Leia-o antes de aceitar os termos.
                </p>
              )}
            </div>
          );
        }
        
        return (
          <Input
            {...fieldProps}
            type={field.type}
            placeholder={field.placeholder}
            onChange={(e) => updateField(field.name, e.target.value, field.mask)}
          />
        );

      case 'date':
        return (
          <Input
            {...fieldProps}
            type="date"
            onChange={(e) => updateField(field.name, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            {...fieldProps}
            type="number"
            placeholder={field.placeholder}
            onChange={(e) => updateField(field.name, e.target.value)}
          />
        );

      case 'select':
        return (
          <Select
            value={value}
            onValueChange={(newValue) => updateField(field.name, newValue)}
          >
            <SelectTrigger className={fieldProps.className}>
              <SelectValue placeholder={`Selecione ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'textarea':
        return (
          <Textarea
            {...fieldProps}
            placeholder={field.placeholder}
            onChange={(e) => updateField(field.name, e.target.value)}
            rows={3}
          />
        );

      case 'radio':
        return (
          <div className="space-y-3">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.name}-${option.value}`}
                  name={String(field.name)}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => updateField(field.name, e.target.value)}
                  className="w-4 h-4 text-emerald-600 bg-muted border-border focus:ring-emerald-500 focus:ring-2"
                />
                <label
                  htmlFor={`${field.name}-${option.value}`}
                  className="text-sm font-medium text-foreground cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const currentSection = sections[currentStep];
  console.log('=== DEBUG SECTION ===');
  console.log('currentStep:', currentStep);
  console.log('sections.length:', sections.length);
  console.log('currentSection:', currentSection);
  
  const progress = ((currentStep + 1) / sections.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header com progresso */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-xl sm:text-2xl font-bold">Formulário de Inscrição para o {currentEvent?.name || 'o Evento'}</h1>
          <Badge variant="outline" className="self-start sm:self-auto">
            Etapa {currentStep + 1} de {sections.length}
          </Badge>
        </div>
        
        {/* Aviso de restrição de idade se existir */}
        {currentEvent?.idadeMinima !== undefined && currentEvent?.idadeMaxima !== undefined && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-blue-800">Restrição de Idade</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Este evento é exclusivo para participantes com idade de <strong>{currentEvent.idadeMinima}</strong> a <strong>{currentEvent.idadeMaxima}</strong> anos (incluindo {currentEvent.idadeMinima} e {currentEvent.idadeMaxima} anos).
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <span className="text-sm text-muted-foreground">Progresso geral</span>
            <span className="text-sm font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Mensagem de erro de submissão */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Erro ao finalizar inscrição</h3>
                <p className="mt-1 text-sm text-red-700">{submitError}</p>
                <button 
                  onClick={() => setSubmitError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Steps indicator */}
        <div className="w-full">
          <div className="flex overflow-x-auto pb-2 px-1 scrollbar-hide">
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "flex-1 flex items-center justify-center px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap",
                  index === currentStep && "bg-primary text-primary-foreground",
                  index < currentStep && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
                  index > currentStep && "bg-muted text-muted-foreground",
                  completedSteps.has(index) && index !== currentStep && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                )}
              >
                {completedSteps.has(index) ? (
                  <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                ) : (
                  <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-current opacity-20 flex-shrink-0" />
                )}
                <span className="hidden md:inline ml-2">{section.title}</span>
                <span className="md:hidden ml-2">{index + 1}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <span>{currentSection.title}</span>
              {completedSteps.has(currentStep) && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </CardTitle>
            <CardDescription>
              Preencha os campos abaixo. Campos obrigatórios são marcados com *
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentSection.fields.map((field) => {
                const status = getFieldStatus(field.name);
                
                return (
                  <div 
                    key={field.name} 
                    className={cn(
                      "space-y-2",
                      field.type === 'textarea' && "md:col-span-2"
                    )}
                  >
                    <Label 
                      htmlFor={field.name}
                      className={cn(
                        "flex items-center space-x-2",
                        field.required && "after:content-['*'] after:text-red-500"
                      )}
                    >
                      <span>{field.label}</span>
                      {status.isValid && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      )}
                      {status.hasError && status.showError && (
                        <AlertCircle className="w-4 h-4 text-red-600" />
                      )}
                    </Label>
                    
                    {renderField(field)}
                    
                    {/* Helper text */}
                    {'helperText' in field && field.helperText && (
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-line">
                        {field.helperText}
                      </p>
                    )}
                    
                    {status.showError && (
                      <p className="text-sm text-red-600 flex items-center space-x-1">
                        <AlertCircle className="w-4 h-4" />
                        <span>{status.error}</span>
                      </p>
                    )}

                    {/* Exibir idade calculada automaticamente */}
                    {field.name === 'data_nasc' && values.idade !== undefined && values.idade !== null && (
                      <div className="mt-2">
                        {!status.hasError ? (
                          <p className="text-sm text-green-600 flex items-center space-x-1 font-medium">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Idade calculada: {values.idade} anos ✓</span>
                          </p>
                        ) : (
                          <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-2">
                            <p className="text-sm text-red-700 flex items-start space-x-2">
                              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                              <span>
                                <strong>⚠️ Idade atual: {values.idade} anos</strong>
                                <br />
                                {currentEvent?.idadeMinima !== undefined && currentEvent?.idadeMaxima !== undefined && (
                                  <span className="text-xs mt-1 block">
                                    Este evento aceita participantes de {currentEvent.idadeMinima} a {currentEvent.idadeMaxima} anos (incluindo {currentEvent.idadeMinima} e {currentEvent.idadeMaxima}).
                                  </span>
                                )}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Anterior</span>
          </Button>

          <div className="flex justify-end w-full sm:w-auto">
            {currentStep < sections.length - 1 ? (
              <div className="flex flex-col items-end space-y-2 w-full sm:w-auto">
                {!isStepComplete(currentStep) && (
                  <div className="text-sm text-red-600 text-right">
                    {errors.data_nasc ? (
                      <p>⚠️ {errors.data_nasc}</p>
                    ) : Object.keys(errors).length > 0 ? (
                      <p>⚠️ Corrija os erros antes de continuar</p>
                    ) : (
                      <p>⚠️ Preencha todos os campos obrigatórios</p>
                    )}
                  </div>
                )}
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center justify-center space-x-2 w-full sm:w-auto"
                  disabled={!isStepComplete(currentStep)}
                >
                  <span>Próximo</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              // Verifica se está na seção dos termos LGPD e se foi rejeitado
              currentStep === sections.length - 1 && values.lgpdConsentAccepted === 'false' ? (
                <div className="flex flex-col items-center sm:items-end space-y-2 w-full sm:w-auto">
                  <div className="text-red-600 text-sm font-medium text-center sm:text-right">
                    ⚠️ Para continuar, é necessário aceitar os termos da LGPD
                  </div>
                  <Button
                    type="button"
                    disabled={true}
                    className="flex items-center justify-center space-x-2 w-full sm:min-w-[140px] opacity-50 cursor-not-allowed"
                  >
                    <span>❌ Não é possível continuar</span>
                  </Button>
                </div>
              ) : (
                <Button
                  type="submit"
                  disabled={currentStep === sections.length - 1 && values.lgpdConsentAccepted !== 'true'}
                  className="flex items-center justify-center space-x-2 w-full sm:min-w-[140px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      <span>{isExistingUser ? 'Atualizando...' : 'Enviando...'}</span>
                    </>
                  ) : (
                    <span>{isExistingUser ? 'Atualizar Dados' : 'Finalizar Inscrição'}</span>
                  )}
                </Button>
              )
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
