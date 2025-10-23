'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { toast } from '@/hooks/use-toast';
import { useLoading } from '@/contexts/LoadingContext';

// Função auxiliar para obter token
async function getCurrentToken() {
  if (!auth) {
    return null;
  }

  return new Promise<string | null>((resolve) => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      unsubscribe();
      if (!user) {
        resolve(null);
        return;
      }

      try {
        const token = await user.getIdToken();
        resolve(token);
      } catch (error) {
        resolve(null);
      }
    });
  });
}

export function TotalConsultation() {
  const { setLoading: setGlobalLoading } = useLoading();
  const [loading, setLoading] = useState(false);

  // Função para baixar CSV geral de todas as reservas
  const downloadGeneralCSV = async () => {
    try {
      setLoading(true);
      setGlobalLoading(true);

      const token = await getCurrentToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }

      toast({
        title: 'Gerando CSV...',
        description: 'Por favor aguarde, isso pode levar alguns minutos.',
      });

      // Buscar histórico geral de reservas
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://us-central1-federa-api.cloudfunctions.net/api';
      const response = await fetch(`${API_URL}/admin/reservation-history?page=1&limit=10000`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`);
      }

      const data = await response.json();
      const reservations = data.reservations || [];

      if (reservations.length === 0) {
        toast({
          title: 'Sem dados',
          description: 'Nenhuma reserva encontrada para exportar.',
          variant: 'destructive',
        });
        return;
      }

      // Criar CSV
      const csvHeaders = [
        'Email',
        'Nome',
        'CPF',
        'Evento',
        'Status',
        'Tipo Ingresso',
        'Gênero',
        'Telefone',
        'DDD',
        'Igreja',
        'Pastor',
        'Cidade',
        'Estado',
        'Idade',
        'Data Reserva',
        'SpotId',
        'Valor Total'
      ];

      const csvRows = reservations.map((res: any) => [
        res.email || '',
        res.name || res.userName || '',
        res.cpf || '',
        res.eventName || res.event || res.eventId || '',
        res.status || '',
        res.ticketKind || '',
        res.gender === 'male' ? 'Masculino' : res.gender === 'female' ? 'Feminino' : res.gender || '',
        res.cellphone || '',
        res.ddd || '',
        res.church || '',
        res.pastor || '',
        res.cidade || '',
        res.estado || '',
        res.idade || '',
        res.createdAt ? new Date(res.createdAt).toLocaleString('pt-BR') : '',
        res.spotId || '',
        res.totalAmount || res.price || '0'
      ]);

      // Escapar campos do CSV
      const escapeCSV = (field: any) => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = [
        csvHeaders.map(escapeCSV).join(','),
        ...csvRows.map(row => row.map(escapeCSV).join(','))
      ].join('\n');

      // Download do arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `todas_reservas_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: 'CSV baixado com sucesso!',
        description: `${reservations.length} reservas exportadas.`,
        variant: 'default',
      });

    } catch (error) {
      console.error('Erro ao gerar CSV geral:', error);
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao gerar CSV',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exportar Todas as Reservas</CardTitle>
          <CardDescription>
            Baixe um arquivo CSV com todas as reservas de todos os eventos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              ℹ️ Informações sobre o relatório
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
              <li>Este relatório contém dados de todas as reservas</li>
              <li>Inclui todos os eventos e status de pagamento</li>
              <li>O arquivo pode ser grande dependendo da quantidade de reservas</li>
              <li>A geração pode levar alguns minutos</li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <Button
              onClick={downloadGeneralCSV}
              disabled={loading}
              size="lg"
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Gerando CSV...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Baixar CSV de Todas as Reservas
                </>
              )}
            </Button>
          </div>

          {loading && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⏳ Aguarde... O download será iniciado automaticamente quando concluído.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Campos do CSV</CardTitle>
          <CardDescription>
            O arquivo CSV contém as seguintes informações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Email</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Nome</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>CPF</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Evento</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Status</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Tipo Ingresso</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Gênero</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Telefone</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>DDD</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Igreja</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Pastor</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Cidade</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Estado</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Idade</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Data Reserva</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>SpotId</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✓</span>
              <span>Valor Total</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
