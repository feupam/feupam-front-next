# Admin Feature Module

## Estrutura

```
src/features/admin/
├── components/           # Admin UI components
│   ├── EventManagement.tsx
│   ├── UserManagement.tsx
│   ├── UserConsultation.tsx
│   └── SpotManagement.tsx
├── hooks/               # Admin-specific hooks
│   └── useAdminEvents.ts
├── types/               # Admin-specific types
│   └── index.ts
├── index.ts            # Barrel export
└── README.md           # This file
```

## Uso

```typescript
import { 
  EventManagement, 
  UserManagement, 
  SpotManagement,
  UserConsultation,
  useAdminEvents 
} from '@/src/features/admin';

import type { AdminUser, AdminEvent } from '@/src/features/admin';
```

## Componentes

### EventManagement
Gerenciamento completo de eventos: criar, editar, excluir, visualizar estatísticas.

### UserManagement
Gerenciamento de usuários: criar, editar staff, definir senhas.

### SpotManagement
Gerenciamento de vagas: verificar disponibilidade, aplicar descontos, inscrições gratuitas.

### UserConsultation
Consultas de usuários e reservas por evento, email ou CPF.

## Hooks

### useAdminEvents
Hook para carregar lista de eventos no contexto admin.

```typescript
const { events, loading, error, refetch } = useAdminEvents();
```

## Integração com Services

Todos os componentes admin utilizam a service layer:

```typescript
import { eventService, adminService, userService } from '@/services';
import { useApi } from '@/hooks';

const api = useApi();

// Exemplo: obter estatísticas
await api.execute(
  () => eventService.getEventStats(eventId, token),
  { successMessage: 'Stats loaded!' }
);
```

## Permissões

Todos os componentes verificam permissões admin via `isAdmin()` helper.

```typescript
import { isAdmin } from '@/lib/admin';

if (!isAdmin(user)) {
  // Render access denied
}
```
