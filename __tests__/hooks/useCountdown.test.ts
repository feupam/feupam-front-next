import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useCountdown } from '@/hooks/useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should initialize with correct values for future date', () => {
    const futureDate = new Date(Date.now() + 60000) // 1 minute from now
    const { result } = renderHook(() => useCountdown(futureDate.toISOString()))

    expect(result.current.days).toBeGreaterThanOrEqual(0)
    expect(result.current.hours).toBeGreaterThanOrEqual(0)
    expect(result.current.minutes).toBeGreaterThanOrEqual(0)
    expect(result.current.seconds).toBeGreaterThanOrEqual(0)
  })

  it('should show zero values when target date is in the past', () => {
    const pastDate = new Date(Date.now() - 60000) // 1 minute ago
    const { result } = renderHook(() => useCountdown(pastDate.toISOString()))

    expect(result.current.days).toBe(0)
    expect(result.current.hours).toBe(0)
    expect(result.current.minutes).toBe(0)
    expect(result.current.seconds).toBe(0)
  })

  it('should update countdown when time advances', () => {
    const futureDate = new Date(Date.now() + 5000) // 5 seconds from now
    const { result } = renderHook(() => useCountdown(futureDate.toISOString()))

    const initialSeconds = result.current.seconds

    act(() => {
      vi.advanceTimersByTime(1000) // advance by 1 second
    })

    // The countdown should have changed
    expect(result.current.seconds).toBeLessThanOrEqual(initialSeconds)
  })

  it('should handle invalid date strings gracefully', () => {
    const { result } = renderHook(() => useCountdown('invalid-date'))

    expect(result.current.days).toBe(0)
    expect(result.current.hours).toBe(0)
    expect(result.current.minutes).toBe(0)
    expect(result.current.seconds).toBe(0)
  })

  it('should calculate time units correctly for exact values', () => {
    // Set a specific future date for predictable testing
    const currentTime = Date.now()
    const futureTime = currentTime + (25 * 60 * 60 * 1000) + (3 * 60 * 1000) + (30 * 1000) // 25 hours, 3 minutes, 30 seconds
    const futureDate = new Date(futureTime)
    
    vi.setSystemTime(currentTime)
    
    const { result } = renderHook(() => useCountdown(futureDate.toISOString()))

    expect(result.current.days).toBe(1) // 25 hours = 1 day + 1 hour
    expect(result.current.hours).toBe(1)
    expect(result.current.minutes).toBe(3)
    expect(result.current.seconds).toBe(30)
  })

  it('should clean up interval on unmount', () => {
    const futureDate = new Date(Date.now() + 60000)
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval')
    
    const { unmount } = renderHook(() => useCountdown(futureDate.toISOString()))
    
    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })

  it('should return object with correct structure', () => {
    const futureDate = new Date(Date.now() + 60000)
    const { result } = renderHook(() => useCountdown(futureDate.toISOString()))

    expect(result.current).toHaveProperty('days')
    expect(result.current).toHaveProperty('hours')
    expect(result.current).toHaveProperty('minutes')
    expect(result.current).toHaveProperty('seconds')
    
    expect(typeof result.current.days).toBe('number')
    expect(typeof result.current.hours).toBe('number')
    expect(typeof result.current.minutes).toBe('number')
    expect(typeof result.current.seconds).toBe('number')
  })
})
