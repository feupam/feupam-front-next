/**
 * Events Feature Module
 * Centralized export for all event-related functionality
 */

// Components
export { default as FilterBar } from './components/filter-bar';
export { default as EventCard } from './components/event-card';
export { EventBookingCard } from './components/event-booking-card';
export { EventHeader } from './components/event-header';
export { EventInfo } from './components/event-info';
export { EventSpotsDistribution } from './components/event-spots-distribution';
export { EventClosedDialog } from './components/event-closed-dialog';

// Hooks
export { useTicketAvailability } from './hooks/useTicketAvailability';

// Types
export type * from './types';

// Utils
export * from './utils';

/**
 * Usage:
 * ```tsx
 * import { EventCard, EventHeader, useTicketAvailability } from '@/src/features/events';
 * import type { Event, EventFilter } from '@/src/features/events';
 * ```
 */
