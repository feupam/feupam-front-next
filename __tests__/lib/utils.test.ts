import { describe, it, expect, beforeEach, vi } from 'vitest'
import { cn, formatCurrency, formatDate, formatTime } from '@/lib/utils'

describe('Utils', () => {
  describe('cn (class names)', () => {
    it('combines class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('handles conditional class names', () => {
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3')
    })

    it('handles empty and null values', () => {
      expect(cn('class1', null, undefined, '', 'class2')).toBe('class1 class2')
    })

    it('merges tailwind classes correctly', () => {
      // Esta função usa twMerge internamente para resolver conflitos do Tailwind
      expect(cn('p-4', 'p-2')).toBe('p-2')
    })
  })

  describe('formatCurrency', () => {
    it('formats BRL currency correctly', () => {
      const result = formatCurrency(1000)
      expect(result).toMatch(/R\$\s?1\.000,00/)
    })

    it('formats with different currency', () => {
      const result = formatCurrency(1000, 'USD')
      expect(result).toMatch(/US\$\s?1\.000,00/)
    })

    it('handles decimal values', () => {
      const result = formatCurrency(123.45)
      expect(result).toMatch(/R\$\s?123,45/)
    })

    it('handles zero value', () => {
      const result = formatCurrency(0)
      expect(result).toMatch(/R\$\s?0,00/)
    })

    it('handles negative values', () => {
      const result = formatCurrency(-100)
      expect(result).toMatch(/-R\$\s?100,00/)
    })
  })

  describe('formatDate', () => {
    it('formats ISO date string correctly', () => {
      const result = formatDate('2024-01-15T10:00:00Z')
      expect(result).toMatch(/\d{2}\/\d{2}\/2024/)
    })

    it('handles different date formats', () => {
      const result = formatDate('2024-12-25')
      expect(result).toMatch(/\d{2}\/\d{2}\/2024/)
    })

    it('handles invalid date gracefully', () => {
      const result = formatDate('invalid-date')
      expect(result).toBe('A definir')
    })

    it('handles empty string', () => {
      const result = formatDate('')
      expect(result).toBe('A definir')
    })
  })

  describe('formatTime', () => {
    it('formats ISO datetime to time correctly', () => {
      const result = formatTime('2024-01-15T14:30:00Z')
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('handles different time formats', () => {
      const result = formatTime('2024-01-15T09:05:00')
      expect(result).toMatch(/\d{2}:\d{2}/)
    })

    it('handles invalid time gracefully', () => {
      const result = formatTime('invalid-time')
      expect(result).toBe('A definir')
    })

    it('handles empty string', () => {
      const result = formatTime('')
      expect(result).toBe('A definir')
    })
  })
})
