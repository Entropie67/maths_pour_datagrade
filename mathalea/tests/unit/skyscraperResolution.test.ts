import { describe, expect, it } from 'vitest'
import GratteCiel, {
  solveSkyscraperWithTrace,
} from '../../src/exercices/enigmes-jeux/EN-gratte-ciel'

describe('résolution rédigée de la grille de gratte-ciels', () => {
  it('reconstruit exactement la solution cible', () => {
    const target = [
      [10, 20, 30],
      [20, 30, 10],
      [30, 10, 20],
    ]
    const steps = solveSkyscraperWithTrace(target, {
      north: [3, 2, 1],
      south: [1, 2, 2],
      west: [3, 2, 1],
      east: [1, 2, 2],
    })
    const reconstructed = Array.from({ length: 3 }, () =>
      Array<number>(3).fill(0),
    )
    for (const step of steps) {
      for (const placement of step.placements) {
        reconstructed[placement.row][placement.column] = placement.value
      }
    }

    expect(steps.flatMap((step) => step.placements)).toHaveLength(9)
    expect(reconstructed).toEqual(target)
    expect(steps[0].kind).toBe('direct-all')
    const lastDirectAll = steps.findLastIndex(
      (step) => step.kind === 'direct-all',
    )
    const firstDirectOne = steps.findIndex((step) => step.kind === 'direct-one')
    if (firstDirectOne !== -1) {
      expect(firstDirectOne).toBeGreaterThan(lastDirectAll)
    }
  })

  it('annonce un choix lorsqu’une grille admet plusieurs solutions', () => {
    const target = [
      [10, 30, 40, 20],
      [30, 20, 10, 40],
      [20, 40, 30, 10],
      [40, 10, 20, 30],
    ]
    const steps = solveSkyscraperWithTrace(target, {
      north: [3, 2, 1, 2],
      south: [1, 2, 3, 2],
      west: [3, 2, 2, 1],
      east: [2, 1, 3, 2],
    })

    expect(steps.flatMap((step) => step.placements)).toHaveLength(16)
    expect(steps.some((step) => step.kind === 'choice')).toBe(true)
    expect(steps.filter((step) => step.kind === 'direct-one')).toHaveLength(3)
    const line1Column2Index = steps.findIndex((step) =>
      step.placements.some(
        (placement) => placement.row === 0 && placement.column === 1,
      ),
    )
    const line1Column2 = steps[line1Column2Index]
    const choiceWasMadeBefore = steps
      .slice(0, line1Column2Index)
      .some((step) => step.kind === 'choice')
    expect(
      line1Column2.kind === 'choice' ||
        line1Column2.reason !== 'row' ||
        choiceWasMadeBefore,
    ).toBe(true)
    expect(
      steps.every((step) =>
        step.placements.every(
          (placement) =>
            placement.value === target[placement.row][placement.column],
        ),
      ),
    ).toBe(true)
  })

  it('insère la méthode avant la solution lorsque l’option est activée', () => {
    const exercise = new GratteCiel()
    exercise.sup = 6
    exercise.correctionDetaillee = true
    exercise.nouvelleVersion()

    const correction = exercise.listeCorrections[0]
    expect(correction).toContain(
      'Méthode pour construire cette solution possible.',
    )
    expect(correction).toContain('<ol class="nombres">')
    // la méthode et ses étapes sont rédigées avant le tableau solution
    expect(correction.indexOf('<ol class="nombres">')).toBeLessThan(
      correction.indexOf('<table'),
    )
    expect(correction).not.toContain('Compte tenu')
    expect(correction).not.toContain('indices')
  })

  it('n’affiche pas les étapes détaillées lorsque l’option est désactivée', () => {
    const exercise = new GratteCiel()
    exercise.sup = 6
    exercise.correctionDetaillee = false
    exercise.nouvelleVersion()

    const correction = exercise.listeCorrections[0]
    expect(correction).toContain(
      'Méthode pour construire cette solution possible.',
    )
    expect(correction).not.toContain('<ol class="nombres">')
    expect(correction).toContain('<table')
  })
})
