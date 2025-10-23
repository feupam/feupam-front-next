/**
 * Admin Feature Module
 * Centralized export for all admin-related functionality
 */

// Components
export { EventManagement } from './components/EventManagement';
export { UserManagement } from './components/UserManagement';
export { UserConsultation } from './components/UserConsultation';
export { TotalConsultation } from './components/TotalConsultation';
export { SpotManagement } from './components/SpotManagement';

// Hooks
export { useAdminEvents } from './hooks/useAdminEvents';

// Types
export type * from './types/index';

/**
 * Usage:
 * ```tsx
 * import { EventManagement, useAdminEvents } from '@/features/admin';
 * ```
 */
