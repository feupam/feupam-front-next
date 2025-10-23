# Custom Hooks - feupam-front-next

## 🎣 Índice de Hooks

Este documento detalha todos os custom hooks do projeto.

---

## 🌐 Global Hooks (`hooks/`)

### **useApi**

**Propósito:** Hook para chamadas de API com loading/error/toast automático

**Localização:** `hooks/useApi.ts`

**Tipo:**
```typescript
function useApi<T>(
  apiCall: () => Promise<T>,
  options?: {
    showSuccessToast?: boolean;
    showErrorToast?: boolean;
    successMessage?: string | ((data: T) => string);
    errorMessage?: string | ((error: Error) => string);
    onSuccess?: (data: T) => void;
    onError?: (error: Error) => void;
  }
): {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: () => Promise<void>;
}
```

**Uso:**
```tsx
import { useApi } from '@/hooks';
import { eventService } from '@/services';

function MyComponent() {
  const { data, loading, error, execute } = useApi(
    () => eventService.list(),
    {
      showSuccessToast: false,
      onSuccess: (events) => console.log(`Loaded ${events.length} events`),
    }
  );

  useEffect(() => {
    execute();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error.message} />;
  
  return <EventList events={data} />;
}
```

**Features:**
- ✅ Auto loading state
- ✅ Auto error handling
- ✅ Toast notifications
- ✅ Success/error callbacks
- ✅ Custom messages
- ✅ TypeScript generic

---

### **useDebounce**

**Propósito:** Debounce de valores para performance em inputs

**Localização:** `hooks/useDebounce.ts`

**Tipo:**
```typescript
function useDebounce<T>(value: T, delay: number = 500): T
```

**Uso:**
```tsx
import { useDebounce } from '@/hooks';

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearch) {
      // API call only happens after 500ms of no typing
      searchEvents(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Buscar eventos..."
    />
  );
}
```

**Benefícios:**
- ✅ Reduz chamadas de API
- ✅ Melhora performance
- ✅ UX mais fluida

---

### **useLocalStorage**

**Propósito:** Sincronizar estado com localStorage

**Localização:** `hooks/useLocalStorage.ts`

**Tipo:**
```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void]
```

**Uso:**
```tsx
import { useLocalStorage } from '@/hooks';

function ThemeSettings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Toggle Theme (current: {theme})
    </button>
  );
}
```

**Features:**
- ✅ Auto persistence
- ✅ JSON serialization
- ✅ SSR safe
- ✅ Type-safe
- ✅ Sync across tabs

---

### **useToggle**

**Propósito:** Toggle boolean state simplificado

**Localização:** `hooks/useToggle.ts`

**Tipo:**
```typescript
function useToggle(initialValue: boolean = false): [
  boolean,
  () => void,
  (value: boolean) => void
]
```

**Uso:**
```tsx
import { useToggle } from '@/hooks';

function Modal() {
  const [isOpen, toggle, setIsOpen] = useToggle(false);

  return (
    <>
      <button onClick={toggle}>Toggle Modal</button>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      <button onClick={() => setIsOpen(false)}>Close Modal</button>
      
      {isOpen && <ModalContent />}
    </>
  );
}
```

---

## 🎯 Feature-Specific Hooks

### **Admin** (`src/features/admin/hooks/`)

#### `useAdminEvents`

**Propósito:** Gerenciamento de eventos no painel admin

**Tipo:**
```typescript
function useAdminEvents(): {
  events: AdminEvent[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  createEvent: (data: CreateEventDTO) => Promise<void>;
  updateEvent: (id: string, data: UpdateEventDTO) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}
```

**Uso:**
```tsx
import { useAdminEvents } from '@/src/features/admin';

function EventManagement() {
  const { events, loading, createEvent, updateEvent, deleteEvent } = useAdminEvents();

  const handleCreate = async () => {
    await createEvent({
      name: 'Novo Evento',
      date: new Date(),
      // ...
    });
  };

  return (
    <div>
      {events.map(event => (
        <EventRow 
          key={event.id}
          event={event}
          onUpdate={(data) => updateEvent(event.id, data)}
          onDelete={() => deleteEvent(event.id)}
        />
      ))}
    </div>
  );
}
```

---

### **Events** (`src/features/events/hooks/`)

#### `useTicketAvailability`

**Propósito:** Verificar disponibilidade de ingressos

**Tipo:**
```typescript
function useTicketAvailability(eventId: string): {
  available: boolean;
  spotsLeft: number;
  maleLeft: number;
  femaleLeft: number;
  loading: boolean;
  refetch: () => Promise<void>;
}
```

**Uso:**
```tsx
import { useTicketAvailability } from '@/src/features/events';

function EventBookingButton({ eventId }: { eventId: string }) {
  const { available, spotsLeft, loading } = useTicketAvailability(eventId);

  if (loading) return <Skeleton />;

  return (
    <Button disabled={!available}>
      {available 
        ? `Reservar (${spotsLeft} vagas)`
        : 'Esgotado'
      }
    </Button>
  );
}
```

---

### **Profile** (`src/features/profile/hooks/`)

#### `useProfileForm`

**Propósito:** Gerenciar formulário de perfil

**Tipo:**
```typescript
function useProfileForm(userId: string): {
  values: ProfileFormData;
  errors: FormErrors;
  touched: FormTouched;
  isSubmitting: boolean;
  handleChange: (field: string, value: any) => void;
  handleBlur: (field: string) => void;
  handleSubmit: () => Promise<void>;
  resetForm: () => void;
}
```

**Uso:**
```tsx
import { useProfileForm } from '@/src/features/profile';

function ProfileEditForm({ userId }: { userId: string }) {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useProfileForm(userId);

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <Input
        name="name"
        value={values.name}
        onChange={(e) => handleChange('name', e.target.value)}
        onBlur={() => handleBlur('name')}
        error={touched.name && errors.name}
      />
      <Button type="submit" disabled={isSubmitting}>
        Salvar
      </Button>
    </form>
  );
}
```

---

#### `useUserProfile`

**Propósito:** Carregar e atualizar dados do perfil

**Tipo:**
```typescript
function useUserProfile(userId?: string): {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}
```

**Uso:**
```tsx
import { useUserProfile } from '@/src/features/profile';
import { useAuth } from '@/src/features/auth';

function ProfilePage() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useUserProfile(user?.uid);

  if (loading) return <ProfileSkeleton />;

  return (
    <ProfileCard 
      profile={profile}
      onUpdate={updateProfile}
    />
  );
}
```

---

### **Checkout** (`src/features/checkout/hooks/`)

#### `useReservationProcess`

**Propósito:** Gerenciar fluxo completo de reserva

**Tipo:**
```typescript
function useReservationProcess(eventId: string, ticketKind: string): {
  step: 'reservation' | 'payment' | 'confirmation';
  reservation: Reservation | null;
  loading: boolean;
  error: Error | null;
  createReservation: (data: ReservationData) => Promise<void>;
  processPayment: (paymentData: PaymentData) => Promise<void>;
  cancelReservation: () => Promise<void>;
}
```

**Uso:**
```tsx
import { useReservationProcess } from '@/src/features/checkout';

function CheckoutFlow({ eventId, ticketKind }: Props) {
  const {
    step,
    reservation,
    loading,
    createReservation,
    processPayment,
    cancelReservation,
  } = useReservationProcess(eventId, ticketKind);

  if (step === 'reservation') {
    return <ReservationForm onSubmit={createReservation} />;
  }

  if (step === 'payment') {
    return (
      <>
        <ReservationTimer expiresAt={reservation.expiresAt} />
        <PaymentForm onSubmit={processPayment} />
      </>
    );
  }

  return <ConfirmationScreen reservation={reservation} />;
}
```

---

### **Reservations** (`src/features/reservations/hooks/`)

#### `useReservationStatus`

**Propósito:** Monitorar status de uma reserva em tempo real

**Tipo:**
```typescript
function useReservationStatus(options: {
  reservationId?: string;
  pollInterval?: number;
  onStatusChange?: (status: ReservationStatus) => void;
}): {
  reservation: ReservationStatusData | null;
  loading: boolean;
  error: Error | null;
  isExpired: boolean;
  isConfirmed: boolean;
  isPending: boolean;
  isCancelled: boolean;
  refetch: () => Promise<void>;
}
```

**Uso:**
```tsx
import { useReservationStatus } from '@/src/features/reservations';

function ReservationMonitor({ reservationId }: { reservationId: string }) {
  const {
    reservation,
    loading,
    isExpired,
    isConfirmed,
  } = useReservationStatus({
    reservationId,
    pollInterval: 5000, // Poll every 5 seconds
    onStatusChange: (status) => {
      if (status === 'confirmed') {
        toast.success('Pagamento confirmado!');
      }
    },
  });

  if (loading) return <Skeleton />;

  return (
    <div>
      <ReservationStatus status={reservation.status} />
      {isConfirmed && <ConfirmationDetails />}
      {isExpired && <ExpiredMessage />}
    </div>
  );
}
```

---

## 📐 Padrões de Custom Hooks

### Estrutura Básica

```typescript
import { useState, useEffect } from 'react';

export function useCustomHook(params: HookParams) {
  // 1. State
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 2. Effects
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // 3. Handlers
  const handleAction = async () => {
    try {
      setLoading(true);
      // Logic
      setData(result);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  // 4. Return
  return {
    data,
    loading,
    error,
    handleAction,
  };
}
```

### Nomenclatura

```typescript
// ✅ Bom
useEventDetails()
useUserProfile()
useReservationProcess()

// ❌ Evitar
getEventDetails()  // Não é hook
eventDetails()     // Sem 'use'
useEvent()         // Muito genérico
```

### Return Types

```typescript
// ✅ Preferir objeto nomeado
function useData() {
  return {
    data,
    loading,
    error,
    refetch,
  };
}

// ✅ Array para 2-3 valores relacionados
function useToggle() {
  return [isOpen, toggle, setIsOpen];
}

// ❌ Evitar array com muitos valores
function useComplexData() {
  return [data, loading, error, refetch, update, delete]; // Confuso!
}
```

### Dependency Arrays

```typescript
// ✅ Explícito
useEffect(() => {
  fetchData(userId);
}, [userId]); // Clear dependency

// ❌ Evitar
useEffect(() => {
  fetchData(userId);
}, []); // Missing dependency!

// ❌ Evitar
useEffect(() => {
  fetchData(userId);
}); // Runs on every render!
```

---

## 🧪 Testing Hooks

```typescript
// useApi.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from './useApi';

describe('useApi', () => {
  it('handles successful API call', async () => {
    const apiCall = vi.fn().mockResolvedValue({ data: 'test' });
    
    const { result } = renderHook(() => useApi(apiCall));
    
    await result.current.execute();
    
    await waitFor(() => {
      expect(result.current.data).toEqual({ data: 'test' });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
    });
  });

  it('handles API error', async () => {
    const error = new Error('API Error');
    const apiCall = vi.fn().mockRejectedValue(error);
    
    const { result } = renderHook(() => useApi(apiCall));
    
    await result.current.execute();
    
    await waitFor(() => {
      expect(result.current.error).toBe(error);
      expect(result.current.loading).toBe(false);
    });
  });
});
```

---

## 📊 Performance Tips

### Memoization

```typescript
import { useMemo, useCallback } from 'react';

function useExpensiveHook(data: Data[]) {
  // Memo para computações pesadas
  const processedData = useMemo(() => {
    return data.map(item => expensiveTransform(item));
  }, [data]);

  // Callback para funções passadas como props
  const handleClick = useCallback((id: string) => {
    // Handler logic
  }, []);

  return { processedData, handleClick };
}
```

### Cleanup

```typescript
function useWebSocket(url: string) {
  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onmessage = (event) => {
      // Handle message
    };

    // Cleanup function
    return () => {
      ws.close();
    };
  }, [url]);
}
```

---

## 🚀 React Query Migration

Para migrar de `useApi` para React Query:

```typescript
// Antes (useApi)
const { data, loading, error } = useApi(() => eventService.list());

// Depois (React Query)
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['events'],
  queryFn: () => eventService.list(),
});
```

**Benefícios do React Query:**
- ✅ Cache automático
- ✅ Background refetch
- ✅ Deduplicação
- ✅ Optimistic updates
- ✅ DevTools

---

**Última atualização:** Outubro 2025  
**Total de hooks documentados:** 10
