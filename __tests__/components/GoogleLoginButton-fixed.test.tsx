import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { GoogleLoginButton } from '@/components/GoogleLoginButton'
import { User } from 'firebase/auth'

// Comprehensive Firebase Auth Mock
const mockUser: Partial<User> = {
  uid: 'test-uid',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg'
}

const mockAuth = {
  currentUser: null,
  signInWithPopup: vi.fn(),
  signOut: vi.fn()
}

const mockGoogleAuthProvider = vi.fn()

const mockOnAuthStateChanged = vi.fn((auth, callback) => {
  // Immediately call callback with null user (not authenticated)
  callback(null)
  // Return unsubscribe function
  return vi.fn()
})

// Mock Firebase modules
vi.mock('firebase/auth', () => ({
  GoogleAuthProvider: mockGoogleAuthProvider,
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: mockOnAuthStateChanged,
  getAuth: vi.fn(() => mockAuth)
}))

vi.mock('@/lib/firebase', () => ({
  auth: mockAuth
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: null,
    loading: false,
    signInWithGoogle: vi.fn(),
    logout: vi.fn()
  }))
}))

describe('GoogleLoginButton', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders google login button', () => {
    render(<GoogleLoginButton />)
    
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
  })

  it('has correct button styling', () => {
    render(<GoogleLoginButton />)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-primary')
    expect(button).toHaveClass('text-primary-foreground')
    expect(button).toHaveClass('w-full')
  })

  it('displays google icon or text', () => {
    render(<GoogleLoginButton />)
    
    // Should have either Google text or an icon
    const button = screen.getByRole('button')
    expect(button).toBeDefined()
    
    // Check if it contains some form of Google branding
    const hasGoogleText = screen.queryByText(/google/i) !== null
    const hasIcon = button.querySelector('svg') !== null
    const hasImageIcon = button.querySelector('img') !== null
    
    expect(hasGoogleText || hasIcon || hasImageIcon).toBe(true)
  })

  it('calls signInWithGoogle when clicked', async () => {
    const mockSignInWithGoogle = vi.fn()
    
    // Update the useAuth mock for this test
    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: mockSignInWithGoogle,
      logout: vi.fn()
    })

    render(<GoogleLoginButton />)
    
    const button = screen.getByRole('button')
    fireEvent.click(button)
    
    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1)
  })

  it('is disabled when loading', async () => {
    // Update the useAuth mock to return loading state
    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      signInWithGoogle: vi.fn(),
      logout: vi.fn()
    })

    render(<GoogleLoginButton />)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('shows loading text when loading', async () => {
    // Update the useAuth mock to return loading state
    const { useAuth } = await import('@/hooks/useAuth')
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: true,
      signInWithGoogle: vi.fn(),
      logout: vi.fn()
    })

    render(<GoogleLoginButton />)
    
    // Should show some form of loading indicator
    const loadingText = screen.queryByText(/carregando|loading/i)
    const button = screen.getByRole('button')
    
    // Either has loading text or button is disabled
    expect(loadingText !== null || (button as HTMLButtonElement).disabled).toBe(true)
  })
})
