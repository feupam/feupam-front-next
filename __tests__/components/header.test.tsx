import { describe, it, expect, vi, Mock, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Header from '@/components/layout/header'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentEventContext } from '@/contexts/CurrentEventContext'
import { User } from 'firebase/auth'

// Mocks
vi.mock('@/hooks/useAuth')
vi.mock('@/contexts/CurrentEventContext')
vi.mock('next/navigation', () => ({
  usePathname: () => '/home',
}))

const mockUseAuth = useAuth as Mock
const mockUseCurrentEventContext = useCurrentEventContext as Mock

describe('Header', () => {
  const mockCurrentEvent = {
    uuid: 'test-uuid',
    name: 'Evento Teste',
    description: 'Descrição do evento',
    date: '2024-01-15',
    location: 'Local Teste',
    startDate: '2024-01-01',
    endDate: '2024-01-31',
    maxGeneralSpots: '100',
    price: 50,
    eventType: 'general' as const,
    title: 'Evento Teste',
    time: '10:00',
    image: 'test.jpg',
    tickets: [],
    cupons: [],
    maxClientMale: '50',
    maxClientFemale: '50',
    isOpen: true
  }

  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock do localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(() => 'light'),
        setItem: vi.fn(),
      },
      writable: true,
    })

    mockUseCurrentEventContext.mockReturnValue({
      currentEvent: mockCurrentEvent,
      setCurrentEvent: vi.fn(),
      setCurrentEventFromData: vi.fn(),
      setCurrentEventByName: vi.fn(),
      isCurrentEventOpen: true,
      refreshCurrentEvent: vi.fn(),
      loading: false,
      error: null,
    })
  })

  it('renders header with logo and navigation', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
    })

    render(<Header />)
    
    expect(screen.getByText('Feupam')).toBeInTheDocument()
    expect(screen.getByText('Home')).toBeInTheDocument()
    expect(screen.getByText('Evento Teste')).toBeInTheDocument()
    expect(screen.getByText('Perfil')).toBeInTheDocument()
  })

  it('shows login link when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
    })

    render(<Header />)
    
    expect(screen.getByText('Entrar')).toBeInTheDocument()
  })

  it('shows user menu when user is authenticated', () => {
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
    } as User

    mockUseAuth.mockReturnValue({
      user: mockUser,
      loading: false,
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
    })

    render(<Header />)
    
    // UserMenu component deve ser renderizado
    expect(screen.queryByText('Entrar')).not.toBeInTheDocument()
  })

  it('opens mobile menu when hamburger is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
    })

    render(<Header />)
    
    const hamburgerButton = screen.getByRole('button', { name: /open main menu/i })
    fireEvent.click(hamburgerButton)
    
    expect(screen.getByText('Menu')).toBeInTheDocument()
  })

  it('displays default event name when no current event', () => {
    mockUseCurrentEventContext.mockReturnValue({
      currentEvent: null,
      setCurrentEvent: vi.fn(),
      setCurrentEventFromData: vi.fn(),
      setCurrentEventByName: vi.fn(),
      isCurrentEventOpen: false,
      refreshCurrentEvent: vi.fn(),
      loading: false,
      error: null,
    })

    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
    })

    render(<Header />)
    
    expect(screen.getByText('Evento')).toBeInTheDocument()
  })

  it('toggles theme when theme button is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      loading: false,
      signInWithGoogle: vi.fn(),
      logout: vi.fn(),
    })

    render(<Header />)
    
    const themeButton = screen.getByRole('button', { name: /switch to dark mode/i })
    fireEvent.click(themeButton)
    
    // Verifica se localStorage.setItem foi chamado
    expect(window.localStorage.setItem).toHaveBeenCalledWith('theme', 'dark')
  })
})
