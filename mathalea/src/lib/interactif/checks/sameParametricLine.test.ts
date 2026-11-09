import { describe, expect, it } from 'vitest'
import { all } from './combinators'
import { sameParametricLine } from './sameParametricLine'

describe('sameParametricLine', () => {
  const answer3d = JSON.stringify({
    point: [1, 1, -1],
    direction: [-3, 0, 4],
  })
  const comparator = all([sameParametricLine()])

  it('accepte la représentation attendue', () => {
    const result = comparator(
      '\\begin{cases}x=1-3t\\\\y=1\\\\z=-1+4t\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(true)
  })

  it('accepte une autre variable de paramétrage', () => {
    const result = comparator(
      '\\begin{cases}x=1-3k\\\\y=1\\\\z=-1+4k\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(true)
  })

  it('accepte un vecteur directeur proportionnel non nul', () => {
    const result = comparator(
      '\\begin{cases}x=1-6s\\\\y=1\\\\z=-1+8s\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(true)
  })

  it('accepte un vecteur directeur proportionnel dans une réponse en trois champs', () => {
    const result = comparator(
      '\\begin{cases}x=-3+3t\\\\y=-2-3t\\\\z=1-2t\\end{cases}',
      JSON.stringify({
        point: [-3, -2, 1],
        direction: [6, -6, -4],
      }),
    )

    expect(result.isOk).toBe(true)
  })

  it('accepte un autre point de la même droite', () => {
    const result = comparator(
      '\\begin{cases}x=-2-3u\\\\y=1\\\\z=3+4u\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(true)
  })

  it('accepte les fractions compactes de MathLive dans les coordonnées', () => {
    const result = comparator(
      '\\begin{cases}x=\\frac12-3t\\\\y=1\\\\z=-\\frac12+4t\\end{cases}',
      JSON.stringify({
        point: [0.5, 1, -0.5],
        direction: [-3, 0, 4],
      }),
    )

    expect(result.isOk).toBe(true)
  })

  it('refuse une représentation avec deux variables de paramétrage', () => {
    const result = comparator(
      '\\begin{cases}x=1-3t\\\\y=1\\\\z=-1+4k\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain('Une seule variable')
  })

  it('refuse une droite différente', () => {
    const result = comparator(
      '\\begin{cases}x=1-3t\\\\y=2\\\\z=-1+4t\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(false)
  })

  it('refuse une expression non affine', () => {
    const result = comparator(
      '\\begin{cases}x=1-3t^2\\\\y=1\\\\z=-1+4t\\end{cases}',
      answer3d,
    )

    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain('forme affine')
  })

  it('accepte une droite de R2 avec dimension: 2', () => {
    const compare2d = all([sameParametricLine({ dimension: 2 })])
    const answer2d = JSON.stringify({
      point: [1, -2],
      direction: [3, 5],
    })

    const result = compare2d(
      '\\begin{cases}x=1+6t\\\\y=-2+10t\\end{cases}',
      answer2d,
    )

    expect(result.isOk).toBe(true)
  })

  it('garde R3 par défaut', () => {
    const result = comparator(
      '\\begin{cases}x=1+3t\\\\y=-2+5t\\end{cases}',
      '{}',
    )

    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain('Erreur dans la réponse attendue')
  })

  it('refuse une coordonnée z quand dimension: 2', () => {
    const compare2d = all([sameParametricLine({ dimension: 2 })])
    const answer2d = JSON.stringify({
      point: [1, -2],
      direction: [3, 5],
    })

    const result = compare2d(
      '\\begin{cases}x=1+3t\\\\y=-2+5t\\\\z=4\\end{cases}',
      answer2d,
    )

    expect(result.isOk).toBe(false)
    expect(result.feedback).toContain('dans le plan')
  })
})
