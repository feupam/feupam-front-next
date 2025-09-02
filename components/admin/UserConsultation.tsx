'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, Download, User, Mail, Phone, MapPin, Calendar, CreditCard } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/hooks/use-toast';

interface User {
  email: string;
  name: string;
  cpf: string;
  cellphone: string;
  ddd: string;
  church: string;
  cidade: string;
  estado: string;
  gender: string;
  idade: number;
  userType: string;
  createdAt: string;
  updatedAt: string;
  responsavel?: string;
  cellphone_responsavel?: string;
  alergia: string;
  medicamento: string;
  info_add?: string;
}

interface Reservation {
  email: string;
  event: string;
  eventId: string;
  spotId: string;
  ticketKind: string;
  status: string;
  price: number;
  gender: string;
  userType: string;
  chargeId?: Array<{
    amount: number;
    chargeId: string;
    email: string;
    envioWhatsapp: boolean;
    event: string;
    lote: string;
    meio: string;
    status: string;
    userID: string;
  }>;
}

interface UserWithReservations {
  user: User;
  reservations: Reservation[];
}

export function UserConsultation() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [usersWithReservations, setUsersWithReservations] = useState<UserWithReservations[]>([]);
  const [filteredData, setFilteredData] = useState<UserWithReservations[]>([]);
  
  // Filtros
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchName, setSearchName] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('todos');
  const [selectedGender, setSelectedGender] = useState<string>('todos');
  const [selectedUserType, setSelectedUserType] = useState<string>('todos');
  
  // Lista de eventos disponíveis
  const [availableEvents, setAvailableEvents] = useState<string[]>([]);

  // Carregar usuários
  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await api.users.listUsers();
      console.log('Dados de usuários recebidos:', usersData);
      
      // Verificar se usersData é um array
      if (!Array.isArray(usersData)) {
        console.error('Dados de usuários não são um array:', usersData);
        toast({
          title: 'Erro',
          description: 'Formato de dados de usuários inválido',
          variant: 'destructive',
        });
        return [];
      }
      
      setUsers(usersData);
      return usersData;
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar lista de usuários',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Carregar reservas de um evento específico
  const loadReservationsByEvent = async (eventId: string) => {
    try {
      const reservationsData = await api.events.getReservations(eventId);
      return reservationsData || [];
    } catch (error) {
      console.error(`Erro ao carregar reservas do evento ${eventId}:`, error);
      return [];
    }
  };

  // Carregar dados quando um evento for selecionado
  const handleEventSelection = async (eventId: string) => {
    if (!eventId) {
      setUsersWithReservations([]);
      setFilteredData([]);
      return;
    }

    try {
      setLoading(true);
      setSelectedEvent(eventId);
      
      // Primeiro buscar todas as reservas de usuários
      const allUserReservations = await api.users.getReservations();
      console.log('Todas as reservas de usuários:', allUserReservations);
      
      // Depois buscar as reservas específicas do evento
      const eventReservations = await loadReservationsByEvent(eventId);
      console.log('Reservas do evento:', eventReservations);
      
      // Combinar dados: para cada reserva do evento, encontrar o usuário correspondente
      const combined: UserWithReservations[] = [];
      const processedEmails = new Set<string>(); // Para evitar duplicatas
      
      eventReservations.forEach((eventReservation: Reservation) => {
        // Encontrar o usuário correspondente nas reservas gerais
        const userReservation = allUserReservations.find((userRes: any) => 
          userRes.email === eventReservation.email
        );
        
        if (userReservation && !processedEmails.has(eventReservation.email)) {
          // Extrair dados do usuário da reserva
          const userData: User = {
            email: userReservation.email,
            name: userReservation.name || 'Nome não informado',
            cpf: userReservation.cpf || '',
            cellphone: userReservation.cellphone || '',
            ddd: userReservation.ddd || '',
            church: userReservation.church || '',
            cidade: userReservation.cidade || userReservation.city || '',
            estado: userReservation.estado || userReservation.state || '',
            gender: userReservation.gender || eventReservation.gender,
            idade: userReservation.idade || 0,
            userType: userReservation.userType || eventReservation.userType,
            createdAt: userReservation.createdAt || '',
            updatedAt: userReservation.updatedAt || '',
            responsavel: userReservation.responsavel || '',
            cellphone_responsavel: userReservation.cellphone_responsavel || '',
            alergia: userReservation.alergia || 'Não informado',
            medicamento: userReservation.medicamento || 'Não informado',
            info_add: userReservation.info_add || ''
          };
          
          // Buscar todas as reservas deste usuário para este evento
          const userEventReservations = eventReservations.filter((res: Reservation) => 
            res.email === eventReservation.email
          );
          
          combined.push({
            user: userData,
            reservations: userEventReservations
          });
          
          processedEmails.add(eventReservation.email);
        }
      });
      
      console.log('Dados combinados:', combined);
      setUsersWithReservations(combined);
      setFilteredData(combined);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados do evento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
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
        item.reservations.some(res => res.status === selectedStatus)
      );
    }

    if (selectedGender && selectedGender !== 'todos') {
      filtered = filtered.filter(item => 
        item.user.gender === selectedGender
      );
    }

    if (selectedUserType && selectedUserType !== 'todos') {
      filtered = filtered.filter(item => 
        item.user.userType === selectedUserType
      );
    }

    setFilteredData(filtered);
  }, [usersWithReservations, searchEmail, searchName, selectedStatus, selectedGender, selectedUserType]);

  // Carregar eventos disponíveis ao montar o componente
  useEffect(() => {
    const loadAvailableEvents = async () => {
      try {
        // Você pode implementar uma API para listar eventos ou usar uma lista fixa
        const events = ['federa', 'federaoficial', 'FederaKidis', 'Evangelismo'];
        setAvailableEvents(events);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
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
      'Nome', 'Email', 'CPF', 'Telefone', 'Igreja', 'Cidade', 'Estado', 
      'Gênero', 'Idade', 'Tipo Usuário', 'Responsável', 'Alergia', 'Medicamento',
      'Evento', 'Status Reserva', 'Tipo Ingresso', 'Valor', 'Método Pagamento'
    ];

    const csvRows: (string | number)[][] = [];
    filteredData.forEach(item => {
      item.reservations.forEach(reservation => {
        const mainCharge = reservation.chargeId && reservation.chargeId.length > 0 
          ? reservation.chargeId[reservation.chargeId.length - 1] 
          : null;

        csvRows.push([
          item.user.name,
          item.user.email,
          item.user.cpf,
          `(${item.user.ddd}) ${item.user.cellphone}`,
          item.user.church,
          item.user.cidade,
          item.user.estado,
          item.user.gender === 'male' ? 'Masculino' : 'Feminino',
          item.user.idade,
          item.user.userType,
          item.user.responsavel || '',
          item.user.alergia,
          item.user.medicamento,
          reservation.event,
          reservation.status,
          reservation.ticketKind,
          `R$ ${(reservation.price / 100).toFixed(2)}`,
          mainCharge?.meio || ''
        ]);
      });
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

  return (
    <div className="space-y-6">
      {/* Seleção de Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Selecionar Evento
          </CardTitle>
          <CardDescription>
            Escolha um evento para consultar usuários e reservas
          </CardDescription>
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
              <Input
                placeholder="Buscar por email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
              />
              <Input
                placeholder="Buscar por nome"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
              />
              <Select onValueChange={setSelectedStatus} value={selectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Pago">Pago</SelectItem>
                  <SelectItem value="Processando">Processando</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                  <SelectItem value="expired">Expirado</SelectItem>
                </SelectContent>
              </Select>
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
              <Button onClick={exportToCSV} variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
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
              {loading ? 'Carregando...' : `${filteredData.length} usuários encontrados`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuário</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Igreja</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead>Informações</TableHead>
                      <TableHead>Reservas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((item, index) => {
                      const user = item.user;
                      const reservations = item.reservations;
                      
                      return (
                        <TableRow key={`${user.email}-${index}`}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                <span className="font-medium">{user.name}</span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {user.gender === 'male' ? 'M' : 'F'} • {user.idade} anos
                              </div>
                              <div className="text-sm text-muted-foreground">
                                CPF: {user.cpf}
                              </div>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                <span className="text-sm">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span className="text-sm">({user.ddd}) {user.cellphone}</span>
                              </div>
                              {user.responsavel && (
                                <div className="text-sm text-muted-foreground">
                                  Resp: {user.responsavel}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="text-sm">
                              {user.church}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span className="text-sm">{user.cidade}, {user.estado}</span>
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline">
                                {user.userType === 'staff' ? 'Staff' : 'Cliente'}
                              </Badge>
                              {user.alergia === 'Sim' && (
                                <Badge variant="destructive" className="text-xs">
                                  Alergia
                                </Badge>
                              )}
                              {user.medicamento === 'Sim' && (
                                <Badge variant="secondary" className="text-xs">
                                  Medicamento
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          
                          <TableCell>
                            <div className="space-y-2">
                              {reservations.map((reservation, resIndex) => {
                                const mainCharge = reservation.chargeId && reservation.chargeId.length > 0 
                                  ? reservation.chargeId[reservation.chargeId.length - 1] 
                                  : null;
                                
                                return (
                                  <div key={`${reservation.spotId}-${resIndex}`} className="p-2 border rounded-md space-y-1">
                                    <div className="flex items-center justify-between">
                                      <Badge className={getStatusBadgeColor(reservation.status)}>
                                        {reservation.status}
                                      </Badge>
                                      <span className="text-sm font-medium">
                                        R$ {(reservation.price / 100).toFixed(2)}
                                      </span>
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {reservation.ticketKind}
                                    </div>
                                    {mainCharge && (
                                      <div className="flex items-center gap-1">
                                        <CreditCard className="h-3 w-3" />
                                        <span className="text-xs">{mainCharge.meio}</span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
