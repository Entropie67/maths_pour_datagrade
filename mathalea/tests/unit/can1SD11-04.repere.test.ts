import { afterEach, expect, it, vi } from 'vitest'
import '../e2e/helpers/setupExerciseGeneration'
import Auto1AF2d from '../../src/exercices/1e/1A-F02-12'
import { mathaleaHandleExerciceSimple } from '../../src/lib/mathalea'
import { context } from '../../src/modules/context'

// Mémorise les bornes de chaque repère construit par l'exercice.
const reperes = vi.hoisted(() => [] as { yMin: number; yMax: number }[])
vi.mock('../../src/lib/2d/reperes', async (importOriginal) => {
  const module =
    await importOriginal<typeof import('../../src/lib/2d/reperes')>()
  class Repere extends module.Repere {
    constructor(options: ConstructorParameters<typeof module.Repere>[0]) {
      super(options)
      reperes.push({ yMin: this.yMin, yMax: this.yMax })
    }
  }
  return { ...module, Repere }
})

const isHtmlInitial = context.isHtml
afterEach(() => {
  context.isHtml = isHtmlInitial
})

it('le repère contient toujours le point d’abscisse 1', () => {
  for (let graine = 0; graine < 300; graine++) {
    reperes.length = 0
    const exercice = new Auto1AF2d()
    exercice.seed = `graine${graine}`
    mathaleaHandleExerciceSimple(exercice, false, 0)
    const lecture = /On lit \$f\(1\)=(-?[\d{},]+)\$/.exec(
      exercice.listeCorrections[0],
    )
    expect(lecture).not.toBeNull()
    const ordonnee = Number(lecture![1].replace(/{,}|,/, '.'))
    expect(reperes).toHaveLength(1)
    expect(ordonnee).toBeGreaterThan(reperes[0].yMin)
    expect(ordonnee).toBeLessThan(reperes[0].yMax)
  }
})

it('termine la phrase interactive de 1A-F02-12 par un point', () => {
  context.isHtml = true
  const exercice = new Auto1AF2d()
  mathaleaHandleExerciceSimple(exercice, true, 0)
  expect(exercice.listeQuestions[0]).toMatch(
    /la valeur de \$a\$ est [\s\S]*<\/mathalea-mathfield><span>&nbsp;\.<\/span>/,
  )
})
