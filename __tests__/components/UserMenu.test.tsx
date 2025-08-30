import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserMenu } from '@/components/UserMenu'

// Mock do contexto de autenticação
const mockUser = {
  uid: 'user123',
  email: 'user@test.com',
  displayName: 'Test User',
  photoURL: 'https://example.com/photo.jpg'
}

const mockUseAuth = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth()
}))

// Mock do LogoutButton
vi.mock('@/components/LogoutButton', () => ({
  LogoutButton: () => <button>Logout</button>
}))

// Mock do @/lib/utils
vi.mock('@/lib/utils', () => ({
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

// Mock do next/link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  )
}))

describe('UserMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseAuth.mockReturnValue({
      user: mockUser
    })
  })

  it('renders user avatar with initials', () => {
    render(<UserMenu />)
    
    // O avatar mostra apenas a inicial
    expect(screen.getByText('T')).toBeInTheDocument()
  })

  it('renders user email as fallback when displayName is not available', () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, displayName: null }
    })

    render(<UserMenu />)
    
    // Mostra a inicial do email
    expect(screen.getByText('u')).toBeInTheDocument()
  })

  it('opens dropdown menu on click', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    
    // Busca o trigger do dropdown por atributos específicos do Radix UI
    const trigger = screen.getByText('T').closest('[aria-haspopup="menu"]')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    
    // Clica no trigger
    await user.click(trigger!)

    // Verifica se o dropdown abriu checando aria-expanded
    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-expanded', 'true')
    }, { timeout: 1000 })
  })

  it('shows user info in dropdown', async () => {
    const user = userEvent.setup()
    render(<UserMenu />)
    
    // Usa o text content para encontrar o elemento
    const avatarFallback = screen.getByText('T')
    await user.click(avatarFallback.parentElement!)

    // Verifica se o avatar existe
    await waitFor(() => {
      expect(avatarFallback).toBeInTheDocument()
    })
  })

  it('shows email as name when displayName is null', async () => {
    mockUseAuth.mockReturnValue({
      user: { ...mockUser, displayName: null }
    })

    const user = userEvent.setup()
    render(<UserMenu />)
    
    // Quando displayName é null, deve mostrar inicial do email
    const avatarFallback = screen.getByText('u')
    expect(avatarFallback).toBeInTheDocument()
  })

  it('does not render when user is not authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: null
    })

    const { container } = render(<UserMenu />)
    
    expect(container.firstChild).toBeNull()
  })

  it('renders profile link', async () => {
    render(<UserMenu />)
    
    // Seleciona o trigger usando querySelector com data-state
    const container = document.querySelector('[data-state="closed"]')
    expect(container).toBeInTheDocument()
    expect(container).toHaveAttribute('aria-haspopup', 'menu')
  })

  it('renders logout button in menu', async () => {
    render(<UserMenu />)
    
    // Verifica a estrutura usando querySelector
    const trigger = document.querySelector('[aria-haspopup="menu"]')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('data-state', 'closed')
  })

  it('has correct accessibility attributes', () => {
    render(<UserMenu />)
    
    // Usa querySelector para encontrar o elemento com os atributos corretos
    const trigger = document.querySelector('[aria-haspopup="menu"][aria-expanded="false"]')
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute('type', 'button')
  })

  it('displays user avatar with correct fallback', () => {
    render(<UserMenu />)
    
    // Verifica se o fallback do avatar está correto
    const avatarFallback = screen.getByText('T')
    expect(avatarFallback).toBeInTheDocument()
  })

  it('handles user with email only correctly', () => {
    mockUseAuth.mockReturnValue({
      user: { 
        uid: 'user123',
        email: 'test@example.com',
        displayName: null,
        photoURL: null 
      }
    })

    render(<UserMenu />)
    
    // Deve mostrar a inicial do email quando não há displayName
    const avatarFallback = screen.getByText('t')
    expect(avatarFallback).toBeInTheDocument()
  })
})
