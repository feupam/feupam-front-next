import { describe, it, expect } from 'vitest'
import { Event, Ticket } from '@/types/event'

describe('Event Types', () => {
  describe('Ticket Interface', () => {
    it('should validate ticket structure', () => {
      const mockTicket: Ticket = {
        id: 'ticket-123',
        name: 'Ingresso VIP',
        description: 'Acesso completo ao evento',
        price: 150.00,
        available: true
      }

      expect(mockTicket.id).toBe('ticket-123')
      expect(mockTicket.name).toBe('Ingresso VIP')
      expect(mockTicket.description).toBe('Acesso completo ao evento')
      expect(mockTicket.price).toBe(150.00)
      expect(mockTicket.available).toBe(true)
    })

    it('should support unavailable tickets', () => {
      const unavailableTicket: Ticket = {
        id: 'ticket-456',
        name: 'Ingresso Esgotado',
        description: 'Ticket não disponível',
        price: 100.00,
        available: false
      }

      expect(unavailableTicket.available).toBe(false)
    })
  })

  describe('Event Interface', () => {
    it('should validate complete event structure', () => {
      const mockEvent: Event = {
        uuid: 'event-uuid-123',
        name: 'FEUPAM 2024',
        location: 'São Paulo',
        description: 'Festival de música e adoração',
        date: '2024-06-15',
        maxGeneralSpots: '1000',
        price: 80.00,
        endDate: '2024-06-15',
        startDate: '2024-06-15',
        eventType: 'general',
        title: 'FEUPAM 2024 - Festival de Adoração',
        time: '18:00',
        image: '/images/feupam-2024.jpg',
        isOpen: true,
        tickets: [
          {
            id: 'ticket-1',
            name: 'Ingresso Geral',
            description: 'Acesso ao evento',
            price: 80.00,
            available: true
          }
        ]
      }

      expect(mockEvent.uuid).toBe('event-uuid-123')
      expect(mockEvent.name).toBe('FEUPAM 2024')
      expect(mockEvent.location).toBe('São Paulo')
      expect(mockEvent.eventType).toBe('general')
      expect(mockEvent.isOpen).toBe(true)
      expect(mockEvent.tickets).toHaveLength(1)
      expect(mockEvent.tickets[0].name).toBe('Ingresso Geral')
    })

    it('should support gender-specific events', () => {
      const genderSpecificEvent: Event = {
        uuid: 'event-gender-123',
        name: 'Evento Específico',
        location: 'Rio de Janeiro',
        description: 'Evento com divisão por gênero',
        date: '2024-07-20',
        maxGeneralSpots: '500',
        price: 60.00,
        endDate: '2024-07-20',
        startDate: '2024-07-20',
        eventType: 'gender_specific',
        maxStaffMale: '50',
        maxStaffFemale: '50',
        maxClientMale: '200',
        maxClientFemale: '200',
        title: 'Evento com Divisão por Gênero',
        time: '19:00',
        image: '/images/event-gender.jpg',
        isOpen: false,
        tickets: []
      }

      expect(genderSpecificEvent.eventType).toBe('gender_specific')
      expect(genderSpecificEvent.maxStaffMale).toBe('50')
      expect(genderSpecificEvent.maxStaffFemale).toBe('50')
      expect(genderSpecificEvent.maxClientMale).toBe('200')
      expect(genderSpecificEvent.maxClientFemale).toBe('200')
      expect(genderSpecificEvent.isOpen).toBe(false)
    })

    it('should support events with coupons', () => {
      const eventWithCoupons: Partial<Event> = {
        uuid: 'event-coupon-123',
        name: 'Evento com Desconto',
        cupons: [
          { name: 'DESCONTO10', discount: 10 },
          { name: 'DESCONTO20', discount: 20 }
        ]
      }

      expect(eventWithCoupons.cupons).toHaveLength(2)
      expect(eventWithCoupons.cupons?.[0].name).toBe('DESCONTO10')
      expect(eventWithCoupons.cupons?.[0].discount).toBe(10)
      expect(eventWithCoupons.cupons?.[1].name).toBe('DESCONTO20')
      expect(eventWithCoupons.cupons?.[1].discount).toBe(20)
    })

    it('should support waiting room configuration', () => {
      const eventWithWaitingRoom: Partial<Event> = {
        uuid: 'event-waiting-123',
        name: 'Evento com Sala de Espera',
        waitingRoomOpens: '2024-06-01T10:00:00Z',
        salesStart: '2024-06-01T12:00:00Z',
        availability: 85,
        isHighDemand: true
      }

      expect(eventWithWaitingRoom.waitingRoomOpens).toBe('2024-06-01T10:00:00Z')
      expect(eventWithWaitingRoom.salesStart).toBe('2024-06-01T12:00:00Z')
      expect(eventWithWaitingRoom.availability).toBe(85)
      expect(eventWithWaitingRoom.isHighDemand).toBe(true)
    })
  })

  describe('Event Type Validation', () => {
    it('should validate event types', () => {
      const generalEventType: Event['eventType'] = 'general'
      const genderSpecificEventType: Event['eventType'] = 'gender_specific'

      expect(generalEventType).toBe('general')
      expect(genderSpecificEventType).toBe('gender_specific')
    })
  })

  describe('Required vs Optional Fields', () => {
    it('should require essential fields', () => {
      const requiredFields = [
        'uuid', 'name', 'location', 'description', 'date', 
        'maxGeneralSpots', 'price', 'endDate', 'startDate', 
        'eventType', 'title', 'time', 'image', 'tickets', 'isOpen'
      ]

      const minimalEvent: Event = {
        uuid: 'min-event-123',
        name: 'Evento Mínimo',
        location: 'Local Teste',
        description: 'Descrição teste',
        date: '2024-12-31',
        maxGeneralSpots: '100',
        price: 50.00,
        endDate: '2024-12-31',
        startDate: '2024-12-31',
        eventType: 'general',
        title: 'Título do Evento',
        time: '20:00',
        image: '/images/test.jpg',
        isOpen: true,
        tickets: []
      }

      requiredFields.forEach(field => {
        expect(minimalEvent[field as keyof Event]).toBeDefined()
      })
    })

    it('should allow optional fields to be undefined', () => {
      const eventWithoutOptionals: Event = {
        uuid: 'event-no-opt-123',
        name: 'Evento Sem Opcionais',
        location: 'Local',
        description: 'Descrição',
        date: '2024-12-31',
        maxGeneralSpots: '50',
        price: 30.00,
        endDate: '2024-12-31',
        startDate: '2024-12-31',
        eventType: 'general',
        title: 'Título',
        time: '18:00',
        image: '/images/default.jpg',
        isOpen: true,
        tickets: []
        // Sem cupons, sem campos de gênero, sem sala de espera
      }

      expect(eventWithoutOptionals.cupons).toBeUndefined()
      expect(eventWithoutOptionals.maxStaffMale).toBeUndefined()
      expect(eventWithoutOptionals.waitingRoomOpens).toBeUndefined()
    })
  })
})
