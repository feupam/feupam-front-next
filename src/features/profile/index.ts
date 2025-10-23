/**
 * Profile Feature Module
 * User profile management and forms
 */

// Components
export { UserProfileCard } from './components/UserProfileCard';

// Hooks
export { useProfileForm } from './hooks/useProfileForm';
export { useUserProfile } from './hooks/useUserProfile';

/**
 * Usage:
 * ```tsx
 * import { UserProfileCard, useProfileForm, useUserProfile } from '@/src/features/profile';
 * 
 * const { profile, loading } = useUserProfile();
 * const { formData, handleSubmit } = useProfileForm({ initialData: profile });
 * ```
 */
