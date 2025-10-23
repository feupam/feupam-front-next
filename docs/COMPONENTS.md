# Componentes - feupam-front-next

## 📦 Índice de Componentes

Este documento lista todos os componentes principais do projeto, organizados por módulo/feature.

---

## 🎯 Features Modules

### **Admin** (`src/features/admin/`)

#### `EventManagement`
**Propósito:** Painel de gerenciamento de eventos  
**Props:** Nenhuma  
**Estado:** Loading, events list, selected event  
**Dependências:** `useAdminEvents`, `eventService`, `adminService`

**Uso:**
```tsx
import { EventManagement } from '@/src/features/admin';

<EventManagement />
```

**Funcionalidades:**
- ✅ Listar todos os eventos
- ✅ Criar novo evento
- ✅ Editar evento existente
- ✅ Deletar evento
- ✅ Ver estatísticas

---

#### `UserManagement`
**Propósito:** Gerenciamento de usuários e reservas  
**Props:** Nenhuma  
**Auth:** Requer admin

**Funcionalidades:**
- ✅ Buscar usuário por email/nome
- ✅ Ver reservas do usuário
- ✅ Gerenciar status de reservas
- ✅ Aplicar descontos

---

#### `SpotManagement`
**Propósito:** Controle de vagas disponíveis  
**Props:** Nenhuma

**Funcionalidades:**
- ✅ Verificar vagas disponíveis
- ✅ Atualizar informações de vagas
- ✅ Aplicar descontos em vagas
- ✅ Liberar evento grátis para usuário

---

#### `UserConsultation`
**Propósito:** Consulta e exportação de dados de usuários  
**Props:** Nenhuma

**Funcionalidades:**
- ✅ Buscar usuários
- ✅ Ver histórico de reservas
- ✅ Exportar dados (CSV)
- ✅ Filtrar por evento

---

### **Events** (`src/features/events/`)

#### `EventCard`
**Propósito:** Card visual de evento para listagens  
**Props:**
```typescript
interface EventCardProps {
  event: Event;
  onClick?: () => void;
  className?: string;
}
```

**Uso:**
```tsx
import { EventCard } from '@/src/features/events';

<EventCard 
  event={event} 
  onClick={() => router.push(`/event/${event.name}`)} 
/>
```

**Features:**
- ✅ Imagem de capa com lazy loading
- ✅ Nome e data do evento
- ✅ Localização
- ✅ Status (aberto/fechado)
- ✅ Botão de ação
- ✅ Animação on hover

---

#### `EventList`
**Propósito:** Lista de eventos com loading state  
**Props:**
```typescript
interface EventListProps {
  events: Event[];
  loading?: boolean;
  onEventClick?: (event: Event) => void;
}
```

**Uso:**
```tsx
<EventList 
  events={filteredEvents}
  loading={loading}
  onEventClick={(e) => router.push(`/event/${e.name}`)}
/>
```

---

#### `EventHeader`
**Propósito:** Cabeçalho da página de evento  
**Props:**
```typescript
interface EventHeaderProps {
  event: Event;
  showBackButton?: boolean;
}
```

**Features:**
- ✅ Imagem de capa hero
- ✅ Nome do evento
- ✅ Logo do evento (se disponível)
- ✅ Botão voltar

---

#### `EventInfo`
**Propósito:** Informações detalhadas do evento  
**Props:**
```typescript
interface EventInfoProps {
  event: Event;
  className?: string;
}
```

**Exibe:**
- ✅ Data e horário
- ✅ Localização
- ✅ Descrição
- ✅ Faixa de preços

---

#### `EventSpotsDistribution`
**Propósito:** Visualização de vagas disponíveis  
**Props:**
```typescript
interface EventSpotsDistributionProps {
  maxMale: number;
  maxFemale: number;
  currentMale: number;
  currentFemale: number;
}
```

**Features:**
- ✅ Progress bars
- ✅ Contadores
- ✅ Cores por categoria

---

#### `EventClosedDialog`
**Propósito:** Modal informando que evento está fechado  
**Props:**
```typescript
interface EventClosedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventName: string;
}
```

---

#### `FilterBar`
**Propósito:** Barra de filtros para lista de eventos  
**Props:**
```typescript
interface FilterBarProps {
  onFilterChange: (filters: EventFilter) => void;
  initialFilters?: EventFilter;
}
```

**Filtros disponíveis:**
- ✅ Localização
- ✅ Data
- ✅ Status (aberto/fechado)
- ✅ Faixa de preço

---

### **Auth** (`src/features/auth/`)

#### `GoogleLoginButton`
**Propósito:** Botão de login com Google  
**Props:**
```typescript
interface GoogleLoginButtonProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}
```

**Uso:**
```tsx
import { GoogleLoginButton } from '@/src/features/auth';

<GoogleLoginButton 
  onSuccess={() => router.push('/home')}
/>
```

---

#### `LogoutButton`
**Propósito:** Botão de logout  
**Props:**
```typescript
interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  showIcon?: boolean;
}
```

---

#### `ProtectedRoute`
**Propósito:** Wrapper para rotas que requerem autenticação  
**Props:**
```typescript
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'user';
  redirectTo?: string;
}
```

**Uso:**
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

---

### **Profile** (`src/features/profile/`)

#### `UserProfileCard`
**Propósito:** Card com informações do perfil  
**Props:**
```typescript
interface UserProfileCardProps {
  user: User;
  editable?: boolean;
  onEdit?: () => void;
}
```

**Exibe:**
- ✅ Avatar
- ✅ Nome e email
- ✅ Telefone
- ✅ CPF
- ✅ Data de cadastro
- ✅ Botão editar (se editable=true)

---

### **Checkout** (`src/features/checkout/`)

#### `PaymentForm`
**Propósito:** Formulário de pagamento  
**Props:**
```typescript
interface PaymentFormProps {
  eventId: string;
  ticketKind: string;
  amount: number;
  onSuccess: (paymentId: string) => void;
  onError: (error: Error) => void;
}
```

**Métodos suportados:**
- ✅ Cartão de crédito
- ✅ PIX
- ✅ Boleto

---

#### `CheckoutClient`
**Propósito:** Cliente do fluxo de checkout  
**Props:**
```typescript
interface CheckoutClientProps {
  reservationId: string;
}
```

**Inclui:**
- ✅ Resumo da reserva
- ✅ PaymentForm
- ✅ ReservationTimer
- ✅ Aplicação de cupom

---

### **Reservations** (`src/features/reservations/`)

#### `ReservationTimer`
**Propósito:** Contador regressivo para expiração de reserva  
**Props:**
```typescript
interface ReservationTimerProps {
  expiresAt: Date | string;
  onExpire?: () => void;
  className?: string;
}
```

**Features:**
- ✅ Atualização em tempo real
- ✅ Animação quando < 1 minuto
- ✅ Callback ao expirar
- ✅ Formatação MM:SS

**Uso:**
```tsx
<ReservationTimer 
  expiresAt={reservation.expiresAt}
  onExpire={() => router.push('/eventos')}
/>
```

---

#### `ReservationStatus`
**Propósito:** Badge de status da reserva  
**Props:**
```typescript
interface ReservationStatusProps {
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled' | 'payment_pending';
  className?: string;
}
```

**Cores por status:**
- 🟡 Pending → Yellow
- 🟢 Confirmed → Green
- 🔴 Expired → Red
- ⚪ Cancelled → Gray
- 🟠 Payment Pending → Orange

---

## 🧩 Shared Components

### **UI Components** (`components/ui/`)

Componentes do shadcn/ui:
- ✅ Button
- ✅ Card
- ✅ Input
- ✅ Select
- ✅ Dialog
- ✅ Badge
- ✅ Skeleton
- ✅ Toaster
- E mais...

### **Shared Components** (`components/shared/`)

#### `ErrorBoundary`
**Propósito:** Capturar erros em componentes filhos  
**Props:**
```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}
```

**Uso:**
```tsx
<ErrorBoundary fallback={<ErrorMessage />}>
  <ComponenteThatMightError />
</ErrorBoundary>
```

---

#### `LoadingSkeletons`
**Propósito:** Estados de carregamento  

**Componentes:**
- `EventListSkeleton` → Lista de eventos
- `EventDetailsSkeleton` → Detalhes de evento
- `AdminDashboardSkeleton` → Dashboard admin

**Uso:**
```tsx
<Suspense fallback={<EventListSkeleton />}>
  <EventList />
</Suspense>
```

---

## 📝 Convenções de Componentes

### Estrutura de arquivo

```typescript
// EventCard.tsx

'use client'; // Se usa hooks

import { ... } from 'react';
import { ... } from '@/...';

// Types
interface EventCardProps {
  event: Event;
  onClick?: () => void;
}

// Component
export function EventCard({ event, onClick }: EventCardProps) {
  // Hooks
  const [state, setState] = useState();
  
  // Handlers
  const handleClick = () => {
    onClick?.();
  };
  
  // Render
  return (
    <div onClick={handleClick}>
      {/* JSX */}
    </div>
  );
}

// Sub-components (se necessário)
function EventCardHeader() { }
```

### Props Naming

```typescript
// ✅ Bom
interface ComponentProps {
  onSave: () => void;      // Callbacks: on + Verb
  isLoading: boolean;      // Boolean: is/has/should
  userName: string;        // camelCase
  className?: string;      // Opcional com ?
}

// ❌ Evitar
interface ComponentProps {
  save: () => void;        // Sem 'on'
  loading: boolean;        // Sem 'is'
  user_name: string;       // snake_case
}
```

### Composição

```typescript
// ✅ Preferir composição
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>

// ❌ Evitar props complexos
<Card 
  title="Título"
  content="Conteúdo"
  headerClassName="..."
  contentClassName="..."
/>
```

---

## 🎨 Styling Guidelines

- **Tailwind CSS** para todos os estilos
- **cn()** utility para merge de classes
- **Variants** via CVA (class-variance-authority)

```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base-classes",
  variant === 'primary' && "variant-classes",
  className // Permitir override
)} />
```

---

## ♿ Acessibilidade

Todos os componentes devem:
- ✅ Ter labels apropriados
- ✅ Suportar navegação por teclado
- ✅ Ter contraste adequado (WCAG AA)
- ✅ Incluir aria-* attributes quando necessário

```typescript
<button 
  aria-label="Fechar modal"
  aria-pressed={isOpen}
>
  <X />
</button>
```

---

## 📊 Performance

- ✅ **React.memo()** para componentes pesados
- ✅ **useMemo/useCallback** quando apropriado
- ✅ **Lazy loading** de componentes grandes
- ✅ **Virtual scrolling** para listas longas

```typescript
import { memo } from 'react';

export const EventCard = memo(function EventCard({ event }) {
  // Component implementation
});
```

---

## 🧪 Testing Components

```typescript
// EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import { EventCard } from './EventCard';

describe('EventCard', () => {
  it('renders event name', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(mockEvent.name)).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<EventCard event={mockEvent} onClick={handleClick} />);
    screen.getByRole('button').click();
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

**Última atualização:** Outubro 2025  
**Total de componentes documentados:** 25+
