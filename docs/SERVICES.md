# Services Layer - feupam-front-next

## 🔌 Camada de Serviços

A camada de serviços centraliza toda a lógica de comunicação com a API backend.

---

## 📁 Estrutura

```
services/
├── index.ts                 # Barrel export
├── api.service.ts           # Base HTTP methods
├── event.service.ts         # Eventos
├── reservation.service.ts   # Reservas
├── user.service.ts          # Usuários
├── admin.service.ts         # Admin
└── payment.service.ts       # Pagamentos
```

---

## 🌐 api.service.ts (Base)

**Propósito:** HTTP methods base usando Axios

### Métodos

```typescript
class ApiService {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T>
  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>
}
```

### Configuração

```typescript
// lib/api.ts
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor (adiciona token)
api.interceptors.request.use(async (config) => {
  const token = await getCurrentToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor (trata erros)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Global error handling
    return Promise.reject(error);
  }
);
```

---

## 🎉 event.service.ts

**Propósito:** Operações CRUD de eventos

### Métodos (8 total)

#### `list()`
**Descrição:** Lista todos os eventos  
**Retorno:** `Promise<Event[]>`  
**Uso:**
```typescript
const events = await eventService.list();
```

---

#### `getById(id: string)`
**Descrição:** Busca evento por ID  
**Parâmetros:**
- `id`: ID do evento  

**Retorno:** `Promise<Event>`  
**Uso:**
```typescript
const event = await eventService.getById('123');
```

---

#### `getByName(name: string)`
**Descrição:** Busca evento por nome (slug)  
**Parâmetros:**
- `name`: Nome/slug do evento  

**Retorno:** `Promise<Event>`  
**Uso:**
```typescript
const event = await eventService.getByName('acampamento-2024');
```

---

#### `create(data: CreateEventDTO)`
**Descrição:** Cria novo evento (admin only)  
**Parâmetros:**
```typescript
interface CreateEventDTO {
  name: string;
  description: string;
  date: string;
  location: string;
  price: number;
  maxClientMale: number;
  maxClientFemale: number;
  image_capa?: string;
  // ...
}
```
**Retorno:** `Promise<Event>`  
**Uso:**
```typescript
const newEvent = await eventService.create({
  name: 'Novo Evento',
  date: '2025-12-25',
  // ...
});
```

---

#### `update(id: string, data: UpdateEventDTO)`
**Descrição:** Atualiza evento existente  
**Retorno:** `Promise<Event>`

---

#### `delete(id: string)`
**Descrição:** Remove evento  
**Retorno:** `Promise<void>`

---

#### `getAvailability(id: string)`
**Descrição:** Verifica disponibilidade de vagas  
**Retorno:**
```typescript
Promise<{
  available: boolean;
  maleSpots: number;
  femaleSpots: number;
  totalSpots: number;
}>
```

---

#### `searchByLocation(location: string)`
**Descrição:** Busca eventos por localização  
**Retorno:** `Promise<Event[]>`

---

## 🎫 reservation.service.ts

**Propósito:** Gestão de reservas

### Métodos (7 total)

#### `create(data: CreateReservationDTO)`
**Descrição:** Cria nova reserva  
**Parâmetros:**
```typescript
interface CreateReservationDTO {
  eventId: string;
  ticketKind: string;
  spotNumber?: number;
  userData: {
    name: string;
    email: string;
    phone: string;
    cpf: string;
  };
}
```
**Retorno:** `Promise<Reservation>`  
**Uso:**
```typescript
const reservation = await reservationService.create({
  eventId: 'evt_123',
  ticketKind: 'masculino',
  userData: {
    name: 'João Silva',
    email: 'joao@example.com',
    phone: '11999999999',
    cpf: '12345678900',
  },
});
```

---

#### `list()`
**Descrição:** Lista reservas do usuário atual  
**Retorno:** `Promise<Reservation[]>`

---

#### `getById(id: string)`
**Descrição:** Busca reserva específica  
**Retorno:** `Promise<Reservation>`

---

#### `cancel(id: string)`
**Descrição:** Cancela reserva  
**Retorno:** `Promise<void>`

---

#### `confirm(id: string, paymentData: PaymentData)`
**Descrição:** Confirma reserva com pagamento  
**Retorno:** `Promise<Reservation>`

---

#### `checkExpiration(id: string)`
**Descrição:** Verifica se reserva expirou  
**Retorno:** `Promise<{ expired: boolean; expiresAt: Date }>`

---

#### `updateUserData(id: string, userData: UserData)`
**Descrição:** Atualiza dados do usuário na reserva  
**Retorno:** `Promise<Reservation>`

---

## 👤 user.service.ts

**Propósito:** Gerenciamento de usuários

### Métodos (10 total)

#### `getProfile()`
**Descrição:** Retorna perfil do usuário atual  
**Retorno:** `Promise<UserProfile>`  
**Uso:**
```typescript
const profile = await userService.getProfile();
console.log(profile.name, profile.email);
```

---

#### `updateProfile(data: UpdateProfileDTO)`
**Descrição:** Atualiza perfil  
**Parâmetros:**
```typescript
interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  cpf?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}
```
**Retorno:** `Promise<UserProfile>`

---

#### `getReservations()`
**Descrição:** Lista todas as reservas do usuário  
**Retorno:** `Promise<Reservation[]>`

---

#### `getById(id: string)`
**Descrição:** Busca usuário por ID (admin only)  
**Retorno:** `Promise<User>`

---

#### `searchByEmail(email: string)`
**Descrição:** Busca usuário por email (admin only)  
**Retorno:** `Promise<User>`

---

#### `uploadPhoto(file: File)`
**Descrição:** Upload de foto de perfil  
**Retorno:** `Promise<{ url: string }>`  
**Uso:**
```typescript
const { url } = await userService.uploadPhoto(file);
```

---

#### `deleteAccount()`
**Descrição:** Deleta conta do usuário  
**Retorno:** `Promise<void>`

---

#### `verifyEmail()`
**Descrição:** Envia email de verificação  
**Retorno:** `Promise<void>`

---

#### `updatePassword(oldPassword: string, newPassword: string)`
**Descrição:** Atualiza senha  
**Retorno:** `Promise<void>`

---

#### `getStats()`
**Descrição:** Estatísticas do usuário  
**Retorno:**
```typescript
Promise<{
  totalReservations: number;
  totalSpent: number;
  upcomingEvents: number;
}>
```

---

## 👨‍💼 admin.service.ts

**Propósito:** Funcionalidades administrativas

### Métodos (11 total)

#### `getDashboardStats()`
**Descrição:** Estatísticas do dashboard  
**Retorno:**
```typescript
Promise<{
  totalEvents: number;
  totalUsers: number;
  totalReservations: number;
  totalRevenue: number;
  recentReservations: Reservation[];
}>
```

---

#### `getAllUsers()`
**Descrição:** Lista todos os usuários  
**Retorno:** `Promise<User[]>`

---

#### `getUserReservations(userId: string)`
**Descrição:** Reservas de um usuário específico  
**Retorno:** `Promise<Reservation[]>`

---

#### `updateReservationStatus(reservationId: string, status: ReservationStatus)`
**Descrição:** Atualiza status de reserva  
**Retorno:** `Promise<Reservation>`

---

#### `applyDiscount(data: DiscountDTO)`
**Descrição:** Aplica desconto em reserva  
**Parâmetros:**
```typescript
interface DiscountDTO {
  email: string;
  discount: number;
  event: string;
}
```
**Retorno:** `Promise<void>`

---

#### `grantFreeEvent(data: FreeEventDTO)`
**Descrição:** Libera evento grátis para usuário  
**Parâmetros:**
```typescript
interface FreeEventDTO {
  email: string;
  eventId: string;
}
```
**Retorno:** `Promise<void>`

---

#### `updateSpotInfo(eventId: string, data: SpotUpdateDTO)`
**Descrição:** Atualiza informações de vagas  
**Retorno:** `Promise<Event>`

---

#### `exportUsers(format: 'csv' | 'json')`
**Descrição:** Exporta dados de usuários  
**Retorno:** `Promise<Blob>`  
**Uso:**
```typescript
const csv = await adminService.exportUsers('csv');
const url = URL.createObjectURL(csv);
// Download
```

---

#### `sendBulkEmail(data: BulkEmailDTO)`
**Descrição:** Envia email para múltiplos usuários  
**Retorno:** `Promise<{ sent: number; failed: number }>`

---

#### `getEventStatistics(eventId: string)`
**Descrição:** Estatísticas detalhadas de um evento  
**Retorno:**
```typescript
Promise<{
  totalReservations: number;
  confirmedReservations: number;
  pendingReservations: number;
  revenue: number;
  spotsDistribution: {
    male: number;
    female: number;
  };
}>
```

---

#### `createCoupon(data: CouponDTO)`
**Descrição:** Cria cupom de desconto  
**Retorno:** `Promise<Coupon>`

---

## 💳 payment.service.ts

**Propósito:** Processamento de pagamentos

### Métodos (10 total)

#### `processPayment(data: PaymentDTO)`
**Descrição:** Processa pagamento  
**Parâmetros:**
```typescript
interface PaymentDTO {
  reservationId: string;
  method: 'credit_card' | 'pix' | 'boleto';
  amount: number;
  installments?: number;
  cardData?: {
    number: string;
    name: string;
    expiry: string;
    cvv: string;
  };
}
```
**Retorno:** `Promise<PaymentResponse>`  
**Uso:**
```typescript
const payment = await paymentService.processPayment({
  reservationId: 'res_123',
  method: 'credit_card',
  amount: 15000, // R$ 150,00 (em centavos)
  installments: 3,
  cardData: {
    number: '4111111111111111',
    name: 'JOAO SILVA',
    expiry: '12/25',
    cvv: '123',
  },
});
```

---

#### `getInstallmentOptions(eventId: string, amount: number)`
**Descrição:** Opções de parcelamento  
**Retorno:**
```typescript
Promise<{
  installments: Array<{
    number: number;
    value: number;
    interest: number;
    total: number;
  }>;
}>
```

---

#### `generatePix(reservationId: string, amount: number)`
**Descrição:** Gera código PIX  
**Retorno:**
```typescript
Promise<{
  qrCode: string;
  qrCodeUrl: string;
  expiresAt: Date;
}>
```

---

#### `generateBoleto(reservationId: string, amount: number)`
**Descrição:** Gera boleto  
**Retorno:**
```typescript
Promise<{
  boletoUrl: string;
  barCode: string;
  dueDate: Date;
}>
```

---

#### `checkPaymentStatus(paymentId: string)`
**Descrição:** Verifica status do pagamento  
**Retorno:**
```typescript
Promise<{
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paidAt?: Date;
}>
```

---

#### `refundPayment(paymentId: string, amount?: number)`
**Descrição:** Reembolso (parcial ou total)  
**Retorno:** `Promise<RefundResponse>`

---

#### `applyCoupon(code: string, eventId: string)`
**Descrição:** Valida e aplica cupom  
**Retorno:**
```typescript
Promise<{
  valid: boolean;
  discount: number;
  discountType: 'percentage' | 'fixed';
}>
```
**Uso:**
```typescript
const result = await paymentService.applyCoupon('DESCONTO10', 'evt_123');
if (result.valid) {
  console.log(`Desconto: ${result.discount}%`);
}
```

---

#### `getPaymentHistory(userId?: string)`
**Descrição:** Histórico de pagamentos  
**Retorno:** `Promise<Payment[]>`

---

#### `cancelPayment(paymentId: string)`
**Descrição:** Cancela pagamento pendente  
**Retorno:** `Promise<void>`

---

#### `updatePaymentMethod(paymentId: string, newMethod: PaymentMethod)`
**Descrição:** Atualiza método de pagamento  
**Retorno:** `Promise<Payment>`

---

## 📊 Resumo de Métodos

| Service | Métodos | Uso Principal |
|---------|---------|---------------|
| api.service | 4 | HTTP base methods |
| event.service | 8 | Gestão de eventos |
| reservation.service | 7 | Reservas de ingressos |
| user.service | 10 | Perfil e usuários |
| admin.service | 11 | Painel administrativo |
| payment.service | 10 | Pagamentos e cupons |
| **TOTAL** | **46** | **APIs completas** |

---

## 🎯 Padrões de Uso

### Error Handling

Todos os services lançam erros padronizados:

```typescript
class ApiError extends Error {
  status: number;
  code: string;
  
  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

// Uso
try {
  await eventService.getById('invalid-id');
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      toast.error('Evento não encontrado');
    } else if (error.status === 401) {
      router.push('/login');
    }
  }
}
```

### Com useApi Hook

```typescript
import { useApi } from '@/hooks';
import { eventService } from '@/services';

const { data, loading, error, execute } = useApi(
  () => eventService.list(),
  {
    showErrorToast: true,
    errorMessage: 'Erro ao carregar eventos',
  }
);
```

### Com React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { eventService } from '@/services';

const { data: events, isLoading } = useQuery({
  queryKey: ['events'],
  queryFn: () => eventService.list(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

---

## 🧪 Testing Services

```typescript
// event.service.test.ts
import { eventService } from './event.service';
import { api } from '@/lib/api';

vi.mock('@/lib/api');

describe('EventService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists events', async () => {
    const mockEvents = [{ id: '1', name: 'Event 1' }];
    vi.mocked(api.get).mockResolvedValue({ data: mockEvents });

    const events = await eventService.list();

    expect(api.get).toHaveBeenCalledWith('/events');
    expect(events).toEqual(mockEvents);
  });

  it('handles errors', async () => {
    vi.mocked(api.get).mockRejectedValue(new Error('API Error'));

    await expect(eventService.list()).rejects.toThrow('API Error');
  });
});
```

---

## 🔒 Autenticação

Todos os services **automaticamente incluem o token** via interceptor:

```typescript
// Configurado em lib/api.ts
api.interceptors.request.use(async (config) => {
  const token = await getCurrentToken(); // Firebase token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Não é necessário** passar token manualmente:

```typescript
// ✅ Correto (token automático)
await eventService.list();

// ❌ Desnecessário
await eventService.list({ headers: { Authorization: token } });
```

---

## 📈 Performance

### Caching com React Query

```typescript
// Configuração global (lib/react-query.tsx)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 min
      gcTime: 10 * 60 * 1000,    // 10 min
      retry: 1,
    },
  },
});
```

### Request Deduplication

React Query deduplica requests automáticos:

```typescript
// Múltiplos componentes chamando a mesma query
// Apenas 1 request é feito
useQuery({ queryKey: ['events'], queryFn: () => eventService.list() });
useQuery({ queryKey: ['events'], queryFn: () => eventService.list() });
```

---

## 🚀 Extensão

Para adicionar novo service:

1. **Criar arquivo:** `services/nova-feature.service.ts`
2. **Implementar classe:**
```typescript
class NovaFeatureService {
  async method1() { }
  async method2() { }
}

export const novaFeatureService = new NovaFeatureService();
```
3. **Exportar em barrel:** `services/index.ts`
```typescript
export { novaFeatureService } from './nova-feature.service';
```
4. **Documentar aqui**

---

**Última atualização:** Outubro 2025  
**Total de métodos de API:** 46
