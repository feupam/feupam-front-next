# Events Feature Module

## Estrutura

```
src/features/events/
├── components/           # Event UI components
│   ├── event-card.tsx
│   ├── event-booking-card.tsx
│   ├── event-header.tsx
│   ├── event-info.tsx
│   ├── event-spots-distribution.tsx
│   ├── event-closed-dialog.tsx
│   └── filter-bar.tsx
├── hooks/               # Event-specific hooks
│   └── useTicketAvailability.ts
├── types/               # Event-specific types
│   ├── event.ts
│   ├── event-data.ts
│   └── index.ts
├── utils/               # Event utilities
│   ├── event-prices.ts
│   └── index.ts
├── index.ts            # Barrel export
└── README.md           # This file
```

## Uso

```typescript
import { 
  EventCard,
  EventHeader,
  EventInfo,
  EventBookingCard,
  FilterBar,
  useTicketAvailability,
  formatEventDate,
  getEventPrice
} from '@/src/features/events';

import type { Event, EventFilter, EventAvailability } from '@/src/features/events';
```

## Componentes

### EventCard
Cartão de evento para listagens com animações e informações resumidas.

```tsx
<EventCard event={event} index={0} />
```

### EventHeader
Cabeçalho do evento com imagem, título e informações principais.

```tsx
<EventHeader event={event} />
```

### EventInfo
Informações detalhadas do evento (descrição, local, horário).

```tsx
<EventInfo event={event} />
```

### EventBookingCard
Cartão de reserva com botão de ação e status de disponibilidade.

```tsx
<EventBookingCard event={event} />
```

### FilterBar
Barra de filtros para pesquisa e filtragem de eventos.

```tsx
<FilterBar />
```

### EventSpotsDistribution
Visualização da distribuição de vagas (masculino/feminino).

```tsx
<EventSpotsDistribution event={event} />
```

### EventClosedDialog
Dialog informativo quando evento está fechado.

```tsx
<EventClosedDialog 
  open={isOpen} 
  onClose={() => setIsOpen(false)} 
  startDate={event.startDate}
  endDate={event.endDate}
/>
```

## Hooks

### useTicketAvailability
Hook para verificar disponibilidade de ingressos.

```typescript
const { isAvailable, spotsLeft } = useTicketAvailability({
  eventId: 'event-123',
  tickets: event.tickets
});
```

## Utils

### formatEventDate
Formata data do evento.

```typescript
const formattedDate = formatEventDate(event.startDate, event.endDate);
// "10/12/2024 - 15/12/2024"
```

### isEventExpired
Verifica se evento expirou.

```typescript
if (isEventExpired(event.endDate)) {
  // Evento já passou
}
```

### getEventPrice
Obtém preço do evento.

```typescript
const price = getEventPrice(eventId); // 150
```

### formatEventPrice
Formata preço do evento.

```typescript
const formatted = formatEventPrice(price); // "R$ 150,00"
```

## Integração com Services

```typescript
import { eventService } from '@/services';
import { useApi } from '@/hooks';

const api = useApi();

// Buscar eventos
const events = await api.execute(
  () => eventService.getEvents(token)
);

// Buscar evento específico
const event = await api.execute(
  () => eventService.getEvent(eventId, token)
);
```
