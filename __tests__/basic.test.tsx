import { describe, it, expect } from 'vitest'

// Teste simples para verificar se o Vitest está funcionando
describe('Vitest Setup', () => {
  it('should run a basic test', () => {
    expect(1 + 1).toBe(2)
  })

  it('should work with strings', () => {
    expect('hello').toBe('hello')
  })

  it('should work with arrays', () => {
    expect([1, 2, 3]).toEqual([1, 2, 3])
  })
})
