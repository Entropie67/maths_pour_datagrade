import seedrandom from 'seedrandom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import ConstruireQuadrilatereAuxInstruments from '../../src/exercices/6e/6G0-10'
import {
  ElementIepEditeur,
  type ElementIepVerificationCallback,
  type InstructionIep,
} from '../../src/lib/customElements/ElementIepEditeur'
import { context } from '../../src/modules/context'

vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

const originalRandom = Math.random

function generate(type: number, seed: string) {
  seedrandom(seed, { global: true })
  const exercise = new ConstruireQuadrilatereAuxInstruments()
  exercise.numeroExercice = 0
  exercise.interactif = true
  exercise.sup = type
  exercise.nouvelleVersion()
  return exercise
}

function verificateur(): ElementIepVerificationCallback {
  const callbacks = (
    ElementIepEditeur as unknown as {
      verificationCallbacks: Map<string, ElementIepVerificationCallback>
    }
  ).verificationCallbacks
  const callback = callbacks.get(
    'verification-construction-quadrilatere-instruments',
  )
  if (callback === undefined) throw new Error('Vérificateur absent')
  return callback
}

beforeEach(() => {
  context.isHtml = true
  context.isTypst = false
  context.isAmc = false
})

afterEach(() => {
  Math.random = originalRandom
})

describe('6G0-10', () => {
  it('valide la construction de la correction pour chaque type de figure', () => {
    for (const type of [1, 2, 3]) {
      for (let i = 0; i < 20; i++) {
        const exercise = generate(type, `6G0-10-${type}-${i}`)
        const expectedRaw = exercise.autoCorrection[0].valeur?.reponse?.value
        const { programme } = JSON.parse(String(expectedRaw)) as {
          programme: InstructionIep[]
        }
        const resultat = verificateur()({
          exercice: exercise,
          questionIndex: 0,
          editor: {} as ElementIepEditeur,
          studentProgram: programme,
          expectedRaw,
        })
        expect(resultat.isOk, resultat.feedback).toBe(true)
        expect(resultat.score).toEqual({ nbBonnesReponses: 4, nbReponses: 4 })
        expect(ElementIepEditeur.pointsMaxQuestion(exercise, 0)).toBe(4)
      }
    }
  })

  it('donne des points au prorata des objets justes', () => {
    const exercise = generate(1, '6G0-10-prorata')
    const expectedRaw = exercise.autoCorrection[0].valeur?.reponse?.value
    const { programme } = JSON.parse(String(expectedRaw)) as {
      programme: InstructionIep[]
    }
    // Sans codage des côtés : 4 côtés + 4 angles justes sur 12 objets
    const sansCodageDesCotes = programme.filter(
      (instruction) => instruction.type !== 'segmentCodage',
    )
    const resultat = verificateur()({
      exercice: exercise,
      questionIndex: 0,
      editor: {} as ElementIepEditeur,
      studentProgram: sansCodageDesCotes,
      expectedRaw,
    })
    expect(resultat.isOk).toBe(false)
    expect(resultat.score).toEqual({ nbBonnesReponses: 2, nbReponses: 4 })
    expect(resultat.feedback).toContain('Côtés correctement codés : 0 sur 4.')
  })

  it('propose les points libres et un clavier avec les noms des sommets', () => {
    const exercise = generate(1, '6G0-10-clavier')
    const question = exercise.listeQuestions[0]
    expect(question).toContain('pointLibre')
    expect(question).toContain('pointADistanceLibre')
    expect(question).toContain('pointSurObjetADistance')
    expect(question).not.toContain('&quot;point&quot;')
    expect(question).toContain('clavier=')
  })

  it('valide une construction à la règle et indique les codages manquants', () => {
    const exercise = generate(2, '6G0-10-eleve')
    const expectedRaw = exercise.autoCorrection[0].valeur?.reponse?.value
    const { noms } = JSON.parse(String(expectedRaw)) as { noms: string[] }
    const [A, B, C, D] = noms
    const question = exercise.listeQuestions[0]
    const [ab, bc] = [
      ...question.matchAll(/(\d+(?:,\d+)?)\\text\{ cm\}\$/g),
    ].map((m) => Number(m[1].replace(',', '.')))
    const construction: InstructionIep[] = [
      { type: 'pointLibre', nom: A, x: 3, y: 2 },
      { type: 'pointADistanceLibre', nom: B, p1: A, distance: ab, angle: 12 },
      { type: 'droite', p1: A, p2: B },
      { type: 'perpendiculaireAObjet', etape: 2, p1: B },
      {
        type: 'pointSurObjetADistance',
        nom: C,
        etape: 3,
        p1: B,
        distance: bc,
        choix: 1,
      },
      { type: 'perpendiculaireAObjet', etape: 3, p1: C },
      {
        type: 'pointSurObjetADistance',
        nom: D,
        etape: 5,
        p1: C,
        distance: ab,
        choix: 2,
      },
      { type: 'polygone', sommets: `${A}${B}${C}${D}` },
    ]
    const sansCodage = verificateur()({
      exercice: exercise,
      questionIndex: 0,
      editor: {} as ElementIepEditeur,
      studentProgram: construction,
      expectedRaw,
    })
    expect(sansCodage.score).toEqual({ nbBonnesReponses: 1, nbReponses: 4 })
    expect(sansCodage.feedback).toContain('Mesures des côtés de la figure')
    expect(sansCodage.feedback).toContain(`[${A}${B}] = `)
    expect(sansCodage.feedback).toContain(
      'Côtés tracés à la bonne longueur : 4 sur 4.',
    )
    expect(sansCodage.feedback).toContain('Aucun côté n’est codé.')
    expect(sansCodage.feedback).toContain('Aucun angle droit n’est codé.')

    const avecCodages: InstructionIep[] = [
      ...construction,
      { type: 'segmentCodage', p1: A, p2: B, codage: '/' },
      { type: 'segmentCodage', p1: C, p2: D, codage: '/' },
      { type: 'segmentCodage', p1: B, p2: C, codage: '//' },
      { type: 'segmentCodage', p1: D, p2: A, codage: '//' },
      { type: 'codageAngleDroit', p1: D, p2: A, p3: B },
      { type: 'codageAngleDroit', p1: A, p2: B, p3: C },
      { type: 'codageAngleDroit', p1: B, p2: C, p3: D },
      { type: 'codageAngleDroit', p1: C, p2: D, p3: A },
    ]
    const resultat = verificateur()({
      exercice: exercise,
      questionIndex: 0,
      editor: {} as ElementIepEditeur,
      studentProgram: avecCodages,
      expectedRaw,
    })
    expect(resultat.isOk, resultat.feedback).toBe(true)
  })

  it('utilise les longueurs exactes de l’énoncé dans la correction', () => {
    for (let i = 0; i < 20; i++) {
      const exercise = generate(4, `6G0-10-arrondi-${i}`)
      const expectedRaw = exercise.autoCorrection[0].valeur?.reponse?.value
      const { programme } = JSON.parse(String(expectedRaw)) as {
        programme: InstructionIep[]
      }
      for (const instruction of programme) {
        if ('distance' in instruction) {
          expect(Math.round(instruction.distance * 10)).toBeCloseTo(
            instruction.distance * 10,
            9,
          )
        }
      }
    }
  })

  it('tire le type de figure parmi ceux cochés, selon leur poids', () => {
    const typeTire = (sup: string, i: number) => {
      const exercise = generate(0, `6G0-10-poids-${sup}-${i}`)
      exercise.sup = sup
      seedrandom(`6G0-10-poids-${sup}-${i}`, { global: true })
      exercise.nouvelleVersion()
      const expectedRaw = exercise.autoCorrection[0].valeur?.reponse?.value
      return (JSON.parse(String(expectedRaw)) as { type: string }).type
    }
    const tirages = (sup: string) =>
      Array.from({ length: 60 }, (_, i) => typeTire(sup, i))
    expect(new Set(tirages('2')).size).toBe(1)
    expect(new Set(tirages('1-3'))).toEqual(new Set(['Carré', 'Losange']))
    expect(new Set(tirages('4'))).toEqual(
      new Set(['Carré', 'Rectangle', 'Losange']),
    )
    const lourd = tirages('1-1-1-1-1-1-2').filter((t) => t === 'Carré').length
    expect(lourd).toBeGreaterThan(30)
  })

  it('n’indique aucun instrument dans l’éditeur', () => {
    const exercise = generate(1, '6G0-10-sans-outils')
    expect(exercise.listeQuestions[0]).toContain('sans-outils="true"')
    expect(exercise.listeQuestions[0]).not.toContain('à la règle')
    expect(exercise.listeCorrections[0]).toContain('sans-outils="true"')
  })
})
