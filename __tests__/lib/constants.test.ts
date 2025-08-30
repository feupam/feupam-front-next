import { describe, it, expect } from 'vitest'
import { CATEGORIES, LOCATIONS, SAMPLE_EVENTS } from '@/lib/constants'

describe('Constants', () => {
  describe('CATEGORIES', () => {
    it('should be defined and not empty', () => {
      expect(CATEGORIES).toBeDefined()
      expect(CATEGORIES.length).toBeGreaterThan(0)
    })

    it('should be an array of strings', () => {
      expect(Array.isArray(CATEGORIES)).toBe(true)
      CATEGORIES.forEach(category => {
        expect(typeof category).toBe('string')
      })
    })

    it('should contain expected categories', () => {
      expect(CATEGORIES).toContain('Concerts')
      expect(CATEGORIES).toContain('Sports')
      expect(CATEGORIES).toContain('Theater')
    })
  })

  describe('LOCATIONS', () => {
    it('should be defined and not empty', () => {
      expect(LOCATIONS).toBeDefined()
      expect(LOCATIONS.length).toBeGreaterThan(0)
    })

    it('should be an array of strings', () => {
      expect(Array.isArray(LOCATIONS)).toBe(true)
      LOCATIONS.forEach(location => {
        expect(typeof location).toBe('string')
      })
    })

    it('should contain expected locations', () => {
      expect(LOCATIONS).toContain('New York')
      expect(LOCATIONS).toContain('Los Angeles')
      expect(LOCATIONS).toContain('Chicago')
    })
  })

  describe('SAMPLE_EVENTS', () => {
    it('should be defined and not empty', () => {
      expect(SAMPLE_EVENTS).toBeDefined()
      expect(SAMPLE_EVENTS.length).toBeGreaterThan(0)
    })

    it('should be an array of event objects', () => {
      expect(Array.isArray(SAMPLE_EVENTS)).toBe(true)
      SAMPLE_EVENTS.forEach(event => {
        expect(typeof event).toBe('object')
        expect(event).toHaveProperty('uuid')
        expect(event).toHaveProperty('id')
        expect(event).toHaveProperty('title')
        expect(event).toHaveProperty('description')
      })
    })

    it('should have valid event structure', () => {
      const firstEvent = SAMPLE_EVENTS[0]
      expect(typeof firstEvent.uuid).toBe('string')
      expect(typeof firstEvent.id).toBe('string')
      expect(typeof firstEvent.title).toBe('string')
      expect(typeof firstEvent.description).toBe('string')
    })
  })
})
