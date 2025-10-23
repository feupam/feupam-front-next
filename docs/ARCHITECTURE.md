# Arquitetura do Projeto - feupam-front-next

## 📐 Visão Geral

Este projeto segue uma **arquitetura modular feature-first** com Next.js 13+ (App Router), TypeScript e React 18.

---

## 🏗️ Estrutura de Diretórios

```
feupam-front-next/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Layout raiz com providers
│   ├── page.tsx                  # Homepage
│   ├── error.tsx                 # Error boundary global
│   ├── admin/                    # Rotas administrativas
│   ├── eventos/                  # Listagem e detalhes de eventos
│   ├── event/[eventName]/        # Página individual de evento
│   │   └── error.tsx             # Error boundary específico
│   ├── reserva/                  # Fluxo de reserva
│   ├── checkout/                 # Finalização de compra
│   ├── perfil/                   # Perfil do usuário
│   └── ...
│
├── src/features/                 # 🎯 Módulos de features
│   ├── admin/                    # Feature: Administração
│   │   ├── components/           # Componentes da feature
│   │   │   ├── EventManagement.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── SpotManagement.tsx
│   │   │   └── UserConsultation.tsx
│   │   ├── hooks/                # Hooks específicos
│   │   │   └── useAdminEvents.ts
│   │   ├── types/                # Types da feature
│   │   └── index.ts              # Barrel export
│   │
│   ├── events/                   # Feature: Eventos
│   │   ├── components/
│   │   │   ├── EventCard.tsx
│   │   │   ├── EventList.tsx
│   │   │   ├── EventHeader.tsx
│   │   │   ├── FilterBar.tsx
│   │   │   └── ...
│   │   ├── hooks/
│   │   │   └── useTicketAvailability.ts
│   │   ├── types/
│   │   │   └── event.types.ts
│   │   ├── utils/
│   │   │   └── event-utils.ts
│   │   └── index.ts
│   │
│   ├── auth/                     # Feature: Autenticação
│   │   ├── components/
│   │   │   ├── GoogleLoginButton.tsx
│   │   │   ├── LogoutButton.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   └── index.ts
│   │
│   ├── profile/                  # Feature: Perfil
│   │   ├── components/
│   │   │   └── UserProfileCard.tsx
│   │   ├── hooks/
│   │   │   ├── useProfileForm.ts
│   │   │   └── useUserProfile.ts
│   │   └── index.ts
│   │
│   ├── checkout/                 # Feature: Checkout
│   │   ├── components/
│   │   │   ├── PaymentForm.tsx
│   │   │   └── CheckoutClient.tsx
│   │   ├── hooks/
│   │   │   └── useReservationProcess.ts
│   │   └── index.ts
│   │
│   └── reservations/             # Feature: Reservas
│       ├── components/
│       │   ├── ReservationTimer.tsx
│       │   ├── ReservationStatus.tsx
│       │   └── ReservationForm.tsx
│       ├── hooks/
│       │   └── useReservationStatus.ts
│       ├── types/
│       │   └── reservation.types.ts
│       └── index.ts
│
├── services/                     # 🔌 Camada de Serviços (API)
│   ├── index.ts                  # Barrel export
│   ├── api.service.ts            # Base HTTP methods
│   ├── event.service.ts          # Operações de eventos
│   ├── reservation.service.ts    # Gestão de reservas
│   ├── user.service.ts           # Gerenciamento de usuários
│   ├── admin.service.ts          # Funcionalidades admin
│   └── payment.service.ts        # Processamento de pagamentos
│
├── hooks/                        # 🎣 Custom Hooks Globais
│   ├── index.ts                  # Barrel export
│   ├── useApi.ts                 # HTTP + loading/error/toast
│   ├── useDebounce.ts            # Performance para inputs
│   ├── useLocalStorage.ts        # Cache no cliente
│   └── useToggle.ts              # Toggle state
│
├── components/                   # 🧩 Componentes Compartilhados
│   ├── ui/                       # shadcn/ui components
│   ├── shared/                   # Componentes reutilizáveis
│   │   ├── ErrorBoundary.tsx
│   │   └── LoadingSkeletons.tsx
│   ├── layout/                   # Componentes de layout
│   ├── providers.tsx             # All providers wrapper
│   └── ...
│
├── lib/                          # 📚 Utilitários e Configurações
│   ├── api.ts                    # Axios instance
│   ├── firebase.ts               # Firebase config
│   ├── react-query.tsx           # React Query provider
│   ├── utils.ts                  # Utility functions
│   └── schemas/                  # Zod schemas
│
├── types/                        # 📝 Types Globais
│   ├── event.ts
│   ├── user.ts
│   └── ...
│
└── contexts/                     # 🌐 React Contexts
    ├── EventsContext.tsx
    ├── CurrentEventContext.tsx
    └── LoadingContext.tsx
```

---

## 🎯 Padrões Arquiteturais

### 1. **Feature-First Structure**

Cada feature é autocontida com seus próprios:
- ✅ Componentes
- ✅ Hooks
- ✅ Types
- ✅ Utils
- ✅ Barrel exports (`index.ts`)

**Exemplo de Import:**
```typescript
// ❌ Antes (imports absolutos diretos)
import { EventCard } from '@/components/events/EventCard';
import { useTicketAvailability } from '@/hooks/events/useTicketAvailability';

// ✅ Depois (barrel export da feature)
import { EventCard, useTicketAvailability } from '@/src/features/events';
```

### 2. **Service Layer Pattern**

Toda lógica de API centralizada em services:

```typescript
// services/event.service.ts
class EventService {
  async list(): Promise<Event[]> { }
  async getById(id: string): Promise<Event> { }
  async create(data: CreateEventDTO): Promise<Event> { }
  // ... 8 métodos total
}

// Uso no componente
import { eventService } from '@/services';

const events = await eventService.list();
```

**Benefícios:**
- ✅ Reusabilidade
- ✅ Testabilidade
- ✅ Manutenibilidade
- ✅ Type-safety

### 3. **Custom Hooks Pattern**

Hooks reutilizáveis para lógica comum:

```typescript
// hooks/useApi.ts
function useApi<T>(apiCall: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  // Auto-toast on error/success
  // ...
}

// Uso
const { data, loading, error, execute } = useApi(
  () => eventService.list()
);
```

### 4. **React Query for Data Fetching**

Instalado e configurado para:
- ✅ Cache inteligente (5 min stale time)
- ✅ Automatic background refetch
- ✅ Deduplicação de requests
- ✅ DevTools em desenvolvimento

```typescript
import { useQuery } from '@tanstack/react-query';

const { data: events } = useQuery({
  queryKey: ['events'],
  queryFn: () => eventService.list(),
});
```

### 5. **Error Boundaries**

Proteção em múltiplos níveis:
- ✅ `app/error.tsx` → Global
- ✅ `app/event/error.tsx` → Feature-specific
- ✅ `<ErrorBoundary>` → Component-level

### 6. **Loading States com Suspense**

```typescript
<Suspense fallback={<EventListSkeleton />}>
  <EventList />
</Suspense>
```

---

## 🔄 Fluxo de Dados

```
User Interaction
      ↓
React Component
      ↓
Custom Hook (useApi, React Query)
      ↓
Service Layer (eventService)
      ↓
API Service (axios instance)
      ↓
Backend API
      ↓
Response → State Update → UI Re-render
```

---

## 📦 Módulos e Responsabilidades

### **src/features/**

| Módulo | Componentes | Hooks | Responsabilidade |
|--------|-------------|-------|------------------|
| `admin` | 4 | 1 | Painel administrativo |
| `events` | 7 | 1 | Sistema de eventos |
| `auth` | 3 | 1 | Autenticação Firebase |
| `profile` | 1 | 2 | Perfil do usuário |
| `checkout` | 2 | 1 | Processamento de pagamento |
| `reservations` | 3 | 1 | Gestão de reservas |

### **services/**

| Service | Métodos | Responsabilidade |
|---------|---------|------------------|
| `api.service` | 4 | HTTP base (GET, POST, PUT, DELETE) |
| `event.service` | 8 | CRUD de eventos |
| `reservation.service` | 7 | Gestão de reservas |
| `user.service` | 10 | Usuários e perfis |
| `admin.service` | 11 | Funcionalidades admin |
| `payment.service` | 10 | Pagamentos e cupons |
| **TOTAL** | **46** | APIs totalmente tipadas |

### **hooks/**

| Hook | Propósito |
|------|-----------|
| `useApi` | HTTP + loading/error/toast |
| `useDebounce` | Performance para inputs |
| `useLocalStorage` | Cache persistente |
| `useToggle` | Toggle boolean state |

---

## 🚀 Performance Optimizations

### 1. **Static Generation**
- 72% das páginas são estáticas
- Geradas em build time
- Servidas via CDN

### 2. **Code Splitting**
- Automático via Next.js
- Dynamic imports onde necessário
- Lazy loading de componentes pesados

### 3. **React Query Caching**
- 5 minutos de stale time
- 10 minutos de garbage collection
- Background refetch automático

### 4. **Image Optimization**
- Next.js Image component
- Lazy loading automático
- Responsive images

---

## 🔒 Autenticação e Autorização

```typescript
// Firebase Authentication
AuthContext (src/features/auth)
  ↓
useAuth() hook
  ↓
ProtectedRoute component
  ↓
Middleware (middleware.ts)
```

**Fluxo:**
1. User login via Google (Firebase)
2. Token armazenado em cookies
3. Middleware valida rotas protegidas
4. `ProtectedRoute` wrapper em páginas
5. `useAuth()` fornece dados do usuário

---

## 📝 Convenções de Código

### Nomenclatura

```typescript
// Componentes: PascalCase
export function EventCard() { }

// Hooks: camelCase com 'use' prefix
export function useTicketAvailability() { }

// Services: camelCase com 'Service' suffix
export const eventService = new EventService();

// Types/Interfaces: PascalCase
export interface Event { }

// Constants: UPPER_SNAKE_CASE
export const API_BASE_URL = '...';
```

### Organização de Imports

```typescript
// 1. External libraries
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal features
import { EventCard } from '@/src/features/events';
import { useAuth } from '@/src/features/auth';

// 3. Services
import { eventService } from '@/services';

// 4. Hooks
import { useApi } from '@/hooks';

// 5. Components
import { Button } from '@/components/ui/button';

// 6. Utils
import { formatDate } from '@/lib/utils';

// 7. Types
import type { Event } from '@/types/event';
```

### Barrel Exports

Toda feature deve ter `index.ts`:

```typescript
// src/features/events/index.ts
export { EventCard } from './components/EventCard';
export { EventList } from './components/EventList';
export { useTicketAvailability } from './hooks/useTicketAvailability';
export type { Event, EventFilter } from './types/event.types';
```

---

## 🧪 Testing Strategy

```
__tests__/
├── features/
│   ├── events/
│   │   └── EventCard.test.tsx
│   └── admin/
│       └── EventManagement.test.tsx
├── hooks/
│   └── useApi.test.ts
└── services/
    └── event.service.test.ts
```

**Stack:**
- Vitest
- @testing-library/react
- @testing-library/jest-dom

---

## 🔧 Configuração TypeScript

```json
{
  "compilerOptions": {
    "strict": true,
    "paths": {
      "@/*": ["./*"],
      "@/src/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/services/*": ["./services/*"],
      "@/hooks/*": ["./hooks/*"]
    }
  }
}
```

---

## 📊 Métricas de Qualidade

| Métrica | Valor | Status |
|---------|-------|--------|
| Build Errors | 0 | ✅ |
| TypeScript Errors | 0 | ✅ |
| Lint Warnings | 0 | ✅ |
| Bundle Size (shared JS) | 79.3 kB | ✅ |
| Static Pages | 72% | ✅ |
| Test Coverage | TBD | 🟡 |

---

## 🔄 Ciclo de Vida de uma Feature

1. **Criar estrutura**: `src/features/nova-feature/`
2. **Componentes**: Em `components/`
3. **Hooks**: Em `hooks/`
4. **Types**: Em `types/`
5. **Service**: Em `services/nova-feature.service.ts`
6. **Barrel export**: `index.ts`
7. **Tests**: `__tests__/features/nova-feature/`
8. **Documentação**: Atualizar este arquivo

---

## 🚧 Trabalho Futuro

- [ ] Migrar mais hooks para React Query
- [ ] Aumentar cobertura de testes (>80%)
- [ ] Implementar Storybook para components
- [ ] Adicionar E2E tests com Playwright
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Lighthouse CI integration

---

## 📚 Recursos

- [Next.js Docs](https://nextjs.org/docs)
- [React Query Docs](https://tanstack.com/query)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Firebase Auth](https://firebase.google.com/docs/auth)

---

**Última atualização:** Outubro 2025  
**Versão da Arquitetura:** 2.0 (Feature-First)
