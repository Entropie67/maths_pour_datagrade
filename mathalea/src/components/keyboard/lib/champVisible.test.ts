/**
 * Champ en cours de saisie gardé au-dessus du clavier virtuel (AxioMaths).
 * @see src/components/keyboard/lib/champVisible.ts
 */
import { describe, expect, it } from 'vitest'
import { defilementPourDegager } from './champVisible'

describe('defilementPourDegager', () => {
  it('ne fait rien quand le champ est déjà au-dessus du clavier', () => {
    expect(defilementPourDegager(200, 400)).toBe(0)
  })

  it('garde une marge entre le champ et le clavier', () => {
    expect(defilementPourDegager(390, 400)).toBe(14)
  })

  it('remonte un champ caché derrière le clavier', () => {
    expect(defilementPourDegager(577, 393)).toBe(208)
  })
})
