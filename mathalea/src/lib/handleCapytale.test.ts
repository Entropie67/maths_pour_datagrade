import { describe, expect, it } from 'vitest'
import type { InterfaceParams } from './types'
import { buildActivityExercicesParams } from './handleCapytale'

describe('buildActivityExercicesParams', () => {
  it('retire la graine de la copie sans modifier les paramètres de l’enseignant', () => {
    const params: InterfaceParams[] = [{ uuid: 'aaa', alea: 'abcd' }]
    const saved = buildActivityExercicesParams(params, true)
    expect(saved[0].alea).toBeUndefined()
    expect(params[0].alea).toBe('abcd')
  })

  it('conserve la graine si les données sont identiques', () => {
    const params: InterfaceParams[] = [{ uuid: 'aaa', alea: 'abcd' }]
    expect(buildActivityExercicesParams(params, false)[0].alea).toBe('abcd')
  })

  it('ajoute une graine manquante si les données sont identiques', () => {
    const params: InterfaceParams[] = [{ uuid: 'aaa' }]
    const saved = buildActivityExercicesParams(params, false)
    expect(saved[0].alea).toMatch(/^.{4}$/)
    expect(params[0].alea).toBe(saved[0].alea)
  })
})
