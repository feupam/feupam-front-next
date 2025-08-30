import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { EventClosedDialog } from '@/components/events/event-closed-dialog'

// Mock da função formatDate e cn
vi.mock('@/lib/utils', () => ({
  formatDate: vi.fn((date) => new Date(date).toLocaleDateString('pt-BR')),
  cn: vi.fn((...classes) => classes.filter(Boolean).join(' ')),
}))

describe('EventClosedDialog', () => {
  const mockProps = {
    open: true,
    onClose: vi.fn(),
    startDate: '2024-01-15T10:00:00Z',
    endDate: '2024-01-30T23:59:59Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders correctly when open', () => {
    render(<EventClosedDialog {...mockProps} />)
    
    expect(screen.getByText('Inscrições ainda não abertas')).toBeInTheDocument()
    expect(screen.getByText(/As inscrições para este evento estarão disponíveis de/)).toBeInTheDocument()
    expect(screen.getByText('Entendi')).toBeInTheDocument()
  })

  it('does not render when closed', () => {
    render(<EventClosedDialog {...mockProps} open={false} />)
    
    expect(screen.queryByText('Inscrições ainda não abertas')).not.toBeInTheDocument()
  })

  it('calls onClose when clicking Entendi button', () => {
    render(<EventClosedDialog {...mockProps} />)
    
    const button = screen.getByText('Entendi')
    fireEvent.click(button)
    
    expect(mockProps.onClose).toHaveBeenCalledTimes(1)
  })

  it('displays formatted start and end dates', () => {
    render(<EventClosedDialog {...mockProps} />)
    
    // Verifica se as datas estão sendo exibidas
    expect(screen.getByText(/15\/01\/2024/)).toBeInTheDocument()
    expect(screen.getByText(/30\/01\/2024/)).toBeInTheDocument()
  })

  it('shows encouragement message', () => {
    render(<EventClosedDialog {...mockProps} />)

    // Use uma busca mais flexível para texto que pode estar quebrado por elementos
    expect(screen.getByText(/Fique atento às datas!/)).toBeInTheDocument()
  })
})
