import { describe, expect, it } from 'vitest'
import { all } from './combinators'
import { singleParameterVariable } from './singleParameterVariable'

describe('singleParameterVariable', () => {
  const answer3d = JSON.stringify({
    point: [1, 1, -1],
    direction: [-3, 0, 4],
  })

  it('refuse une réponse qui contient plusieurs variables de paramétrage', () => {
    const compareVariable = all([singleParameterVariable()])

    const result = compareVariable(
      '\\begin{cases}x=1-3t\\\\y=1\\\\z=-1+4k\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain('Une seule variable')
  })

  it('accepte une autre variable que celle attendue avec un feedback non bloquant', () => {
    const compareVariable = all([
      singleParameterVariable({ expectedParameter: 'k' }),
    ])

    const result = compareVariable(
      '\\begin{cases}x=1-3t\\\\y=1\\\\z=-1+4t\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(true)
    expect(result.feedback).toBe('')
    expect(result.details).toEqual([
      { name: 'singleParameterVariable', passed: true },
    ])
  })

  it('peut afficher son feedback non bloquant même si la réponse est correcte', () => {
    const compareVariable = all([
      singleParameterVariable({
        expectedParameter: 'k',
        feedbackOnSuccess: true,
      }),
    ])

    const result = compareVariable(
      '\\begin{cases}x=1-3t\\\\y=1\\\\z=-1+4t\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(true)
    expect(result.feedback).toContain('attendue est $k$ plutôt que $t$')
  })

  it('peut rendre la variable attendue obligatoire', () => {
    const compareVariable = all([
      singleParameterVariable({
        expectedParameter: 'k',
        strictExpectedParameter: true,
      }),
    ])

    const result = compareVariable(
      '\\begin{cases}x=1-3t\\\\y=1\\\\z=-1+4t\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain('attendue est $k$ plutôt que $t$')
  })
})
