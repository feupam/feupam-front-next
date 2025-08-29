"use client";

import { useEffect, useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Event } from '@/types/event';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useInstallments } from '@/components/providers';

interface PaymentFormProps {
  event: Event;
  onSubmit?: (data: PaymentData) => Promise<void>;
  reservationData?: {
    spotId: string;
    email: string;
    eventId: string;
    userType: 'client' | 'staff';
    status: string;
  };
  spotId?: string;
}

interface PaymentData {
  items: Array<{
    amount: number;
    description: string;
  }>;
  customer: {
    email: string;
  };
  payments: {
    payment_method: 'credit_card';
    credit_card: {
      installments: number;
      statement_descriptor: string;
      card: {
        number: string;
        holder_name: string;
        exp_month: number;
        exp_year: number;
        cvv: string;
        billing_address?: {
          line_1: string;
          zip_code: string;
          city: string;
          state: string;
          country: string;
        };
      };
    };
  };
}

export default function PaymentForm({ event, onSubmit, reservationData, spotId }: PaymentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState(1);
  const [formData, setFormData] = useState({
    cardNumber: '',
    holderName: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    address: {
      line1: '',
      zipCode: '',
      city: '',
      state: '',
      country: 'BR'
    }
  });

  // Usa o hook de contexto para acessar as opções de parcelamento
  const { installmentOptions, isLoading: loadingInstallments, fetchInstallments } = useInstallments();

  // Carrega opções de parcelamento ao montar o componente
  useEffect(() => {
    if (event && event.uuid) {
      fetchInstallments(event.uuid);
    }
  }, [event, fetchInstallments]);

  // Pega o email do usuário autenticado no Firebase
  const userEmail = typeof window !== 'undefined' ? auth.currentUser?.email : undefined;

  const handleChange = (field: string, value: string) => {
    if (field.startsWith('address.')) {
      const addressField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const formatCardNumber = (value: string) => {
    return value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Verifica se há uma reserva existente para o evento
      const existingReservation = localStorage.getItem('reservationData');
      const hasExistingReservation = existingReservation && JSON.parse(existingReservation).eventId === event.uuid;
      
      // Não precisamos mais verificar o status da reserva usando retry, já temos os dados necessários
      // para fazer o pagamento diretamente
      
      // Encontra a opção de parcelamento selecionada, ou usa o valor padrão do evento
      const selectedOption = installmentOptions.find(option => option.number === selectedInstallment) || 
                            { number: 1, valueInCents: event.price || 0 };

      console.log("Opção de parcelamento selecionada:", selectedOption);

      // Calcula o valor total multiplicando o valor da parcela pelo número de parcelas
      const valorParcela = selectedOption.valueInCents;
      const totalAmountInCents = valorParcela * selectedOption.number;

      console.log(`Calculando valor total: ${valorParcela} (parcela) x ${selectedOption.number} (parcelas) = ${totalAmountInCents}`);

      const paymentData: PaymentData & { spotId?: string } = {
        items: [{
          amount: totalAmountInCents || Number(event.price),
          description: event.uuid
        }],
        customer: {
          email: userEmail || reservationData?.email || '',
        },
        payments: {
          payment_method: 'credit_card',
          credit_card: {
            installments: selectedInstallment,
            statement_descriptor: 'FEDERA',
            card: {
              number: formData.cardNumber.replace(/\D/g, ''),
              holder_name: formData.holderName,
              exp_month: parseInt(formData.expMonth),
              exp_year: parseInt(formData.expYear),
              cvv: formData.cvv,
              billing_address: {
                line_1: formData.address.line1,
                zip_code: formData.address.zipCode,
                city: formData.address.city,
                state: formData.address.state,
                country: formData.address.country
              }
            }
          }
        },
        spotId: spotId || reservationData?.spotId
      };

      console.log("Dados de pagamento:", paymentData);

      if (onSubmit) {
        await onSubmit(paymentData);
      }
    } catch (error: any) {
      setError(error.message || "Erro ao processar pagamento. Tente novamente.");
      console.error("Erro no processamento do pagamento:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="holderName">Nome no Cartão</Label>
          <Input
            id="holderName"
            value={formData.holderName}
            onChange={(e) => handleChange('holderName', e.target.value)}
            placeholder="Nome como está no cartão"
            required
          />
        </div>

        <div>
          <Label htmlFor="cardNumber">Número do Cartão</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              value={formData.cardNumber}
              onChange={(e) => handleChange('cardNumber', formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              required
              maxLength={19}
            />
            <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="expMonth">Mês</Label>
            <Input
              id="expMonth"
              value={formData.expMonth}
              onChange={(e) => handleChange('expMonth', e.target.value)}
              placeholder="MM"
              required
              maxLength={2}
            />
          </div>

          <div>
            <Label htmlFor="expYear">Ano</Label>
            <Input
              id="expYear"
              value={formData.expYear}
              onChange={(e) => handleChange('expYear', e.target.value)}
              placeholder="AA"
              required
              maxLength={2}
            />
          </div>

          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              value={formData.cvv}
              onChange={(e) => handleChange('cvv', e.target.value)}
              placeholder="123"
              required
              maxLength={4}
              type="password"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="address.line1">Endereço</Label>
            <Input
              id="address.line1"
              value={formData.address.line1}
              onChange={(e) => handleChange('address.line1', e.target.value)}
              placeholder="Rua, número, complemento"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address.zipCode">CEP</Label>
              <Input
                id="address.zipCode"
                value={formData.address.zipCode}
                onChange={(e) => handleChange('address.zipCode', e.target.value)}
                placeholder="00000-000"
                required
              />
            </div>

            <div>
              <Label htmlFor="address.city">Cidade</Label>
              <Input
                id="address.city"
                value={formData.address.city}
                onChange={(e) => handleChange('address.city', e.target.value)}
                placeholder="Sua cidade"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address.state">Estado</Label>
            <Input
              id="address.state"
              value={formData.address.state}
              onChange={(e) => handleChange('address.state', e.target.value)}
              placeholder="UF"
              required
              maxLength={2}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="installments" className="flex items-center">
            Parcelas {loadingInstallments && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
          </Label>
          <Select 
            value={selectedInstallment.toString()} 
            onValueChange={(value) => setSelectedInstallment(parseInt(value))}
            disabled={loadingInstallments || installmentOptions.length === 0}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loadingInstallments ? "Carregando opções..." : "Selecione o número de parcelas"} />
            </SelectTrigger>
            <SelectContent>
              {installmentOptions.length > 0 ? (
                installmentOptions.map((option) => (
                  <SelectItem key={option.number} value={option.number.toString()}>
                    {option.formattedValue}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="1">1x sem juros</SelectItem>
              )}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            *Parcelamentos acima de 1x podem incluir juros da operadora de pagamento, não do nosso site.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processando...
          </>
        ) : (
          'Finalizar Pagamento'
        )}
      </Button>
    </form>
  );
} 