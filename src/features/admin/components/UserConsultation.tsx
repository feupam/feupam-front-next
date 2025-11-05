'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Download, User, Mail, Phone, MapPin, Calendar, CreditCard, MessageCircle, ChevronLeft, ChevronRight, Building2, RotateCcw } from 'lucide-react';
import { api } from '@/lib/api';
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

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  cellphone?: string;
  ddd?: string;
  church?: string;
  pastor?: string;
  cidade?: string;
  estado?: string;
  cpf?: string;
  idade?: number;
  gender?: string;
}

interface Charge {
  event: string;
  meio: string;
  userID?: string;
  email: string;
  lote: string | number;
  envioWhatsapp: boolean;
  amount: number;
  status: string;
  chargeId: string;
  payLink?: string;
  qrcodePix?: string;
}

interface Reservation {
  id: string;
  email: string;
  eventId: string;
  eventName?: string; // Para compatibilidade
  status: string;
  price: number;
  ticketKind: string;
  userType: string;
  gender: string;
  spotId: string;
  chargeId?: Charge[];
  event?: string;
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
}

interface UserWithReservations {
  user: User;
  reservation: Reservation;
  totalAmount: number;
}

interface ApiResponse {
  page: number;
  limit: number;
  eventId: string;
  totalReservations: number;
  data: UserWithReservations[];
}

export function UserConsultation() {
  const { setLoading: setGlobalLoading } = useLoading();
  const [loading, setLoading] = useState(false);
  const [usersWithReservations, setUsersWithReservations] = useState<UserWithReservations[]>([]);
  const [filteredData, setFilteredData] = useState<UserWithReservations[]>([]);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [reprocessingId, setReprocessingId] = useState<string | null>(null);
  
  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(1000);
  
  // Filtros
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedGender, setSelectedGender] = useState<string>('todos');
  const [selectedUserType, setSelectedUserType] = useState<string>('todos');
  const [selectedChurch, setSelectedChurch] = useState<string>('todos');
  
  // Lista de eventos disponíveis
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);
  const [availableChurches, setAvailableChurches] = useState<string[]>([]);

  // Função para buscar dados completos do usuário
  const fetchUserProfile = async (email: string) => {
    try {
      const token = await getCurrentToken();
      if (!token) return null;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile/${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      // Erro silencioso - perfil pode não existir
    }
    return null;
  };

  const loadReservationReport = async (eventId: string, page: number = 1, limit: number = itemsPerPage) => {
    try {
      setLoading(true);
      setGlobalLoading(true);
      
      const token = await getCurrentToken();
      if (!token) {
        throw new Error('Token de autenticação não encontrado');
      }
      
      // Fazer a requisição para a API correta
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/reservations-report?eventId=${eventId}&page=${page}&limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na requisição: ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      
      // Buscar dados completos dos usuários
      const enrichedData = await Promise.all(
        data.data.map(async (item) => {
          const userProfile = await fetchUserProfile(item.user.email);
          return {
            ...item,
            user: {
              ...item.user,
              ...userProfile
            }
          };
        })
      );
      
      setApiResponse(data);
      
      // Sempre substitui os dados da página atual
      setUsersWithReservations(enrichedData);
      setFilteredData(enrichedData);
      
      // Extrair igrejas únicas dos dados enriquecidos
      const churches = Array.from(new Set(
        enrichedData.map(item => item.user.church).filter(church => church && church.trim() !== '')
      )).sort();
      setAvailableChurches(churches);
      
      // Calcular total de páginas usando o limit enviado
      setTotalPages(Math.ceil(data.totalReservations / limit));
      
      toast({
        title: 'Sucesso',
        description: `Página ${page} carregada: ${data.data.length} usuários de ${data.totalReservations} total`,
        variant: 'default',
      });
      
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do evento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

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
        'Igreja',
        'Pastor',
        'Cidade',
        'Estado',
        'Data Reserva',
        'SpotId'
      ];

      const csvRows = reservations.map((res: any) => [
        res.email || '',
        res.name || '',
        res.cpf || '',
        res.eventName || res.eventId || '',
        res.status || '',
        res.ticketKind || '',
        res.gender || '',
        res.cellphone || '',
        res.church || '',
        res.pastor || '',
        res.cidade || '',
        res.estado || '',
        res.createdAt ? new Date(res.createdAt).toLocaleString('pt-BR') : '',
        res.spotId || ''
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      // Download
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `historico-geral-reservas-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'CSV gerado!',
        description: `${reservations.length} reservas exportadas com sucesso.`,
      });

    } catch (error: any) {
      console.error('Erro ao gerar CSV geral:', error);
      toast({
        title: 'Erro ao gerar CSV',
        description: error.message || 'Não foi possível gerar o arquivo CSV.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setGlobalLoading(false);
    }
  };

  // Carregar dados quando um evento for selecionado
  const handleEventSelection = async (eventId: string) => {
    if (!eventId) {
      setUsersWithReservations([]);
      setFilteredData([]);
      setCurrentPage(1);
      setTotalPages(1);
      return;
    }

    setSelectedEvent(eventId);
    setCurrentPage(1);
    await loadReservationReport(eventId, 1);
  };

  // Carregar página específica
  const loadPage = async (page: number) => {
    if (!selectedEvent) return;
    
    setCurrentPage(page);
    await loadReservationReport(selectedEvent, page);
  };

  // Aplicar filtros
  useEffect(() => {
    let filtered = [...usersWithReservations];

    if (searchEmail) {
      filtered = filtered.filter(item => 
        item.user.email.toLowerCase().includes(searchEmail.toLowerCase())
      );
    }

    if (searchName) {
      filtered = filtered.filter(item => 
        item.user.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (selectedStatus && selectedStatus !== 'todos') {
      filtered = filtered.filter(item =>
        item.reservation.status === selectedStatus
      );
    }

    if (selectedGender && selectedGender !== 'todos') {
      filtered = filtered.filter(item =>
        item.reservation.gender === selectedGender
      );
    }

    if (selectedUserType && selectedUserType !== 'todos') {
      filtered = filtered.filter(item =>
        item.reservation.userType === selectedUserType
      );
    }

    if (selectedChurch && selectedChurch !== 'todos') {
      filtered = filtered.filter(item => 
        item.user.church && item.user.church.toLowerCase().includes(selectedChurch.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [usersWithReservations, searchEmail, searchName, selectedStatus, selectedGender, selectedUserType, selectedChurch]);

  // Carregar eventos disponíveis ao montar o componente
  useEffect(() => {
    const loadAvailableEvents = async () => {
      try {
        const token = await getCurrentToken();
        if (!token) {
          toast({
            title: 'Erro',
            description: 'Token de autenticação não encontrado',
            variant: 'destructive',
          });
          return;
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Erro na requisição: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        
        // Tentar diferentes estruturas de resposta
        let eventIds: string[] = [];
        
        if (data.events && Array.isArray(data.events)) {
          eventIds = data.events.map((event: any) => 
            event.id || event.name || event.eventId || JSON.stringify(event)
          );
        } else if (Array.isArray(data)) {
          eventIds = data.map((event: any) => 
            event.id || event.name || event.eventId || JSON.stringify(event)
          );
        } else if (data.data && Array.isArray(data.data)) {
          eventIds = data.data.map((event: any) => 
            event.id || event.name || event.eventId || JSON.stringify(event)
          );
        } else {
          const keys = Object.keys(data);
          eventIds = keys.filter(key => typeof data[key] === 'string' || typeof data[key] === 'object');
        }
        
        if (eventIds.length === 0) {
          toast({
            title: 'Aviso',
            description: 'Nenhum evento encontrado na API',
            variant: 'default',
          });
        } else {
          toast({
            title: 'Sucesso',
            description: `${eventIds.length} eventos carregados`,
            variant: 'default',
          });
        }
        
        setAvailableEvents(eventIds);
        
      } catch (error) {
        console.error('Erro ao carregar eventos da API externa:', error);
        toast({
          title: 'Erro',
          description: `Erro ao carregar lista de eventos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
          variant: 'destructive',
        });
      }
    };

    loadAvailableEvents();
  }, []);

  // Função para exportar dados
  const exportToCSV = () => {
    if (filteredData.length === 0) {
      toast({
        title: 'Aviso',
        description: 'Não há dados para exportar',
        variant: 'default',
      });
      return;
    }

    const csvHeaders = [
      'Nome', 'Email', 'Data Criação', 'Evento', 'Status Reserva', 'Tipo Inscrição', 
      'Valor Reserva', 'Gênero', 'Tipo Usuário', 'Método Pagamento', 'Valor Pago', 'Spot ID'
    ];

    const csvRows: (string | number)[][] = [];
    filteredData.forEach(item => {
      // Como agora cada item tem apenas uma reservation, não precisamos do forEach
      const reservation = item.reservation;
      const mainCharge = reservation.chargeId && reservation.chargeId.length > 0
        ? reservation.chargeId[reservation.chargeId.length - 1]
        : (reservation.chargeId && reservation.chargeId.length > 0
            ? reservation.chargeId[reservation.chargeId.length - 1]
            : null);

      csvRows.push([
        item.user.name || '',
        item.user.email || '',
        new Date(item.user.createdAt).toLocaleDateString('pt-BR'),
        reservation.event || reservation.eventName || reservation.eventId,
        reservation.status,
        reservation.ticketKind,
        `R$ ${reservation.price ? (reservation.price / 100).toFixed(2) : '0,00'}`,
        reservation.gender === 'male' ? 'Masculino' : 'Feminino',
        reservation.userType === 'staff' ? 'Staff' : 'Cliente',
        mainCharge?.meio || 'N/A',
        mainCharge ? `R$ ${(mainCharge.amount / 100).toFixed(2)}` : 'R$ 0,00',
        reservation.spotId || ''
      ]);
    });

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `consulta_usuarios_${selectedEvent}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const getStatusBadgeColor = (status: string) => {
    switch(status) {
      case 'Pago': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'Processando': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'cancelled':
      case 'expired': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
    }
  };

  // Função para formatar telefone para WhatsApp
  const formatWhatsAppLink = (email: string) => {
    // Como não temos telefone na API, vamos criar um link de email
    return `mailto:${email}`;
  };

  // Função para resetar filtros
  const resetFilters = () => {
    setSearchEmail('');
    setSearchName('');
    setSelectedStatus('todos');
    setSelectedGender('todos');
    setSelectedUserType('todos');
    setSelectedChurch('todos');
  };

  // Ação: reprocessar status de pagamento para um usuário/reserva específica
  const handleAdminReprocess = async (item: UserWithReservations) => {
    if (!selectedEvent) {
      toast({ title: 'Selecione um evento', description: 'É necessário escolher um evento antes.', variant: 'destructive' });
      return;
    }
    const reservation = item.reservation;
    const mainCharge = reservation.chargeId && reservation.chargeId.length > 0
      ? reservation.chargeId[reservation.chargeId.length - 1]
      : undefined;
    const payload: { email: string; eventId: string; chargeId?: string } = {
      email: item.user.email,
      eventId: selectedEvent,
      ...(mainCharge?.chargeId ? { chargeId: mainCharge.chargeId } : {})
    };
    try {
      setReprocessingId(reservation.id);
      console.log('[Admin] POST /payments/reprocessar-status payload:', payload);
      const resp = await api.payments.reprocessStatus(payload);
      console.log('[Admin] Resposta /payments/reprocessar-status:', resp);
      toast({ title: 'Solicitado', description: 'Reprocessamento enviado. Aguarde alguns instantes e atualize.', variant: 'default' });
    } catch (err: any) {
      console.error('[Admin] Erro ao reprocessar status:', err);
      toast({ title: 'Erro', description: err?.message || 'Falha ao reprocessar status', variant: 'destructive' });
    } finally {
      setReprocessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Seleção de Evento */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Selecionar Evento
              </CardTitle>
              <CardDescription>
                Escolha um evento para consultar usuários e reservas
              </CardDescription>
            </div>
            <Button
              onClick={downloadGeneralCSV}
              disabled={loading}
              variant="outline"
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Baixar CSV Geral
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Select onValueChange={handleEventSelection} value={selectedEvent}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um evento para consultar" />
            </SelectTrigger>
            <SelectContent>
              {availableEvents.map(event => (
                <SelectItem key={event} value={event}>
                  {event}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Filtros */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <Input
                  placeholder="Buscar por email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                <Input
                  placeholder="Buscar por nome"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
                <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Pago">Pago</SelectItem>
                    <SelectItem value="Processando">Processando</SelectItem>
                    <SelectItem value="available">Disponível</SelectItem>
                    <SelectItem value="failed">Falhado</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="expired">Expirado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gênero</label>
                <Select onValueChange={setSelectedGender} value={selectedGender}>
                  <SelectTrigger>
                    <SelectValue placeholder="Gênero" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Feminino</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Tipo</label>
                <Select onValueChange={setSelectedUserType} value={selectedUserType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="client">Cliente</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Igreja</label>
                <Select onValueChange={setSelectedChurch} value={selectedChurch}>
                  <SelectTrigger>
                    <SelectValue placeholder="Igreja" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todas</SelectItem>
                    {availableChurches.map(church => (
                      <SelectItem key={church} value={church}>{church}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium">Ações</label>
                <div className="flex gap-2">
                  <Button onClick={resetFilters} variant="outline">
                    Limpar
                  </Button>
                  <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabela de Resultados */}
      {selectedEvent && (
        <Card>
          <CardHeader>
            <CardTitle>
              Usuários e Reservas - {selectedEvent}
            </CardTitle>
            <CardDescription>
              {loading ? 'Carregando...' : apiResponse
                ? `${apiResponse.totalReservations} reservas • ${filteredData.length} filtrados • Página ${currentPage} de ${totalPages}`
                : `${filteredData.length} registros encontrados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Contato</TableHead>
                        <TableHead>Igreja</TableHead>
                        <TableHead>Reservas</TableHead>
                        <TableHead>Cliente/Staff</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredData.map((item, index) => {
                          const user = item.user;
                          const reservation = item.reservation;
                          const emailLink = formatWhatsAppLink(user.email);                        return (
                          <TableRow key={`${user.id}-${index}`}>
                            {/* Coluna Usuário */}
                            <TableCell>
                              <div className="p-3 border rounded-lg bg-slate-50 dark:bg-slate-800 space-y-2 min-w-[200px]">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-600" />
                                  <span className="font-medium">{user.name}</span>
                                </div>
                                <div className="text-sm text-muted-foreground space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    <span className="text-xs">{user.email}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Idade:</span>
                                    <span className="text-xs">{user.idade || 'N/I'} anos</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Gênero:</span>
                                    <span className="text-xs">{user.gender === 'male' ? 'Masculino' : user.gender === 'female' ? 'Feminino' : 'N/I'}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            {/* Coluna Contato */}
                            <TableCell>
                              <div className="space-y-2">
                                {user.cellphone && user.ddd ? (
                                  <a 
                                    href={`https://web.whatsapp.com/send?phone=55${user.ddd}${user.cellphone.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 p-2 border rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                                  >
                                    <Phone className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">({user.ddd}) {user.cellphone}</span>
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                    <Phone className="h-4 w-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">Não informado</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            
                            {/* Coluna Igreja */}
                            <TableCell>
                              <div className="p-3 border rounded-lg bg-purple-50 dark:bg-purple-900/20 space-y-2 min-w-[200px]">
                                <div className="flex items-center gap-2">
                                  <Building2 className="h-4 w-4 text-purple-600" />
                                  <span className="text-sm font-medium">{user.church || 'Não informado'}</span>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    <span>Pastor: {user.pastor || 'Não informado'}</span>
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            
                            {/* Coluna Reservas */}
                            <TableCell>
                              <div className="space-y-2 min-w-[250px]">
                                {(() => {
                                  const reservation = item.reservation;
                                  const mainCharge = reservation.chargeId && reservation.chargeId.length > 0
                                    ? reservation.chargeId[reservation.chargeId.length - 1]
                                    : (reservation.chargeId && reservation.chargeId.length > 0 
                                        ? reservation.chargeId[reservation.chargeId.length - 1] 
                                        : null);
                                  
                                  return (
                                    <div key={reservation.id} className="p-3 border rounded-lg bg-blue-50 dark:bg-blue-900/20 space-y-2">
                                      <div className="flex items-center justify-between">
                                        <Badge className={getStatusBadgeColor(reservation.status)}>
                                          {reservation.status}
                                        </Badge>
                                        <span className="text-sm font-medium">
                                          R$ {reservation.price ? (reservation.price / 100).toFixed(2) : '0,00'}
                                        </span>
                                      </div>
                                      <div className="text-xs text-muted-foreground space-y-1">
                                        <div className="flex justify-between">
                                          <span>Tipo:</span>
                                          <span>{reservation.ticketKind}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Gênero:</span>
                                          <span>{reservation.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                          <span>Spot:</span>
                                          <span className="font-mono">{reservation.spotId}</span>
                                        </div>
                                        {mainCharge && (
                                          <div className="flex items-center gap-1 mt-2 pt-2 border-t">
                                            <CreditCard className="h-3 w-3" />
                                            <span>{mainCharge.meio}</span>
                                            {mainCharge.amount > 0 && (
                                              <span>- R$ {(mainCharge.amount / 100).toFixed(2)}</span>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })()}
                                <div className="text-center">
                                  <Badge variant="secondary">
                                    1 reserva
                                  </Badge>
                                </div>
                              </div>
                            </TableCell>
                            
                              {/* Coluna Cliente/Staff */}
                              <TableCell>
                                <div className="space-y-2">
                                  {/* Como agora cada item tem apenas uma reservation, não precisamos do map */}
                                  <Badge
                                    variant={reservation.userType === 'staff' ? 'default' : 'secondary'}
                                    className={reservation.userType === 'staff' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                                  >
                                    {reservation.userType === 'staff' ? 'Staff' : 'Cliente'}
                                  </Badge>
                                </div>
                              </TableCell>                            {/* Coluna Total */}
                            <TableCell>
                              <div className="space-y-1">
                                <div className="text-lg font-medium text-green-600">
                                  R$ {(item.totalAmount / 100).toFixed(2)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Total pago
                                </div>
                              </div>
                            </TableCell>
                            {/* Coluna Ações */}
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAdminReprocess(item)}
                                  disabled={reprocessingId === reservation.id}
                                  aria-label="Atualizar pagamento (reprocessar status)"
                                  className="p-2"
                                >
                                  {reprocessingId === reservation.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <RotateCcw className="h-4 w-4" />
                                  )}
                                  <span className="sr-only">Atualizar pagamento</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-muted-foreground">
                      Página {currentPage} de {totalPages}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1 || loading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Anterior
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                          if (pageNum > totalPages) return null;
                          
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === currentPage ? "default" : "outline"}
                              size="sm"
                              onClick={() => loadPage(pageNum)}
                              disabled={loading}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages || loading}
                      >
                        Próxima
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
