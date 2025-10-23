/**
 * Auth Feature Module
 * Centralized export for all authentication functionality
 */

// Context
export { AuthProvider, useAuth } from './context/AuthContext';

// Components
export { GoogleLoginButton } from './components/GoogleLoginButton';
export { LogoutButton } from './components/LogoutButton';
export { ProtectedRoute } from './components/ProtectedRoute';

/**
 * Usage:
 * ```tsx
 * import { AuthProvider, useAuth, GoogleLoginButton } from '@/src/features/auth';
 * 
 * // In layout/provider
 * <AuthProvider>
 *   {children}
 * </AuthProvider>
 * 
 * // In component
 * const { user, loading, signOut } = useAuth();
 * ```
 */
