import seedrandom from 'seedrandom'
import katex from 'katex'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Racines from '../../src/exercices/2e/2N51-6'
import Homotheties from '../../src/exercices/3e/3G13'
import Division from '../../src/exercices/6e/6N2C'
import Divisibilite from '../../src/exercices/6e/6N2J-3'
import Numeration from '../../src/exercices/CM2/CM2N1D-2'
import Puissances from '../../src/exercices/can/2e/can2N4-02'
import Limites from '../../src/exercices/ch/3e/3mLimCont-1'
import { context } from '../../src/modules/context'
import { fonctionComparaison } from '../../src/lib/interactif/comparisonFunctions'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

function prepare<T extends { interactif: boolean; numeroExercice?: number }>(
  ex: T,
): T {
  ex.interactif = true
  ex.numeroExercice = 0
  return ex
}

describe('Ticket 10039 : réponses interactives', () => {
  beforeEach(() => {
    seedrandom('audit-10039', { global: true })
    window.notify = vi.fn()
    window.notifyLocal = vi.fn()
    context.isHtml = true
    context.isAmc = false
    document.body.innerHTML = ''
  })

  it('accepte une expression sans fraction lorsque le dénominateur vaut 1', () => {
    const ex = prepare(new Racines())
    ex.nouvelleVersion()
    const compare = ex.autoCorrection[0].valeur!.reponse!.compare!
    expect(compare('2-\\sqrt{2}', '2-\\sqrt{2}').isOk).toBe(true)
    expect(compare('\\frac{2-\\sqrt{2}}{1}', '2-\\sqrt{2}').isOk).toBe(true)
    expect(compare('\\frac{2}{\\sqrt{2}}', '\\sqrt{2}').isOk).toBe(false)
    expect(compare('3', '2-\\sqrt{2}').isOk).toBe(false)
  })

  it('attend une longueur positive pour une homothétie de rapport négatif', () => {
    const ex = prepare(new Homotheties())
    Object.assign(ex, { sup: '4', sup2: 2, nbQuestions: 12 })
    ex.nouvelleVersion()
    expect(ex.autoCorrection.length).toBeGreaterThan(0)
    for (const correction of ex.autoCorrection) {
      const answer = correction.valeur!.reponse!
      expect(String(answer.value)).not.toContain('-')
      expect(
        fonctionComparaison(String(answer.value), String(answer.value)).isOk,
      ).toBe(true)
    }
  })

  it('utilise la valeur 1000 dans la liste et dans la réponse attendue', () => {
    const ex = prepare(new Division())
    Object.assign(ex, { sup: '2', sup2: '3', nbQuestions: 1 })
    ex.nouvelleVersion()
    expect(ex.autoCorrection[1].valeur!.reponse!.value).toBe('1000')
    expect(ex.listeQuestions[0]).toContain('1000')
    expect(ex.listeQuestions[0]).not.toContain('"value":"1 000"')
  })

  it('accepte exactement les phrases vraies pour toutes les paires proposées', () => {
    const ex = prepare(new Divisibilite())
    ex.nouvelleVersion()
    for (let i = 0; i < ex.nbQuestions; i++) {
      const q = ex.listeQuestions[i]
      const nombres = [...new Set(ex.listeReponses[i].flat())]
      for (const premier of nombres)
        for (const second of nombres) {
          const diviseur = q.includes('diviseur de')
          const vrai =
            (diviseur
              ? Number(second) % Number(premier)
              : Number(premier) % Number(second)) === 0
          const attendu = q.includes("n'est pas") ? !vrai : vrai
          document.body.innerHTML = `<select id="liste-deroulanteEx0Q${2 * i}"><option>${premier}</option></select><select id="liste-deroulanteEx0Q${2 * i + 1}"><option>${second}</option></select><span id="resultatCheckEx0Q${2 * i}"></span><span id="resultatCheckEx0Q${2 * i + 1}"></span>`
          expect(ex.correctionInteractive(i)).toEqual(
            attendu ? ['OK', 'OK'] : ['KO', 'KO'],
          )
        }
    }
  })

  for (const type of [1, 2, 3, 4])
    for (const lettres of [false, true]) {
      it(`corrige la numération type ${type}, lettres=${lettres}, avec un point fixe`, () => {
        const ex = prepare(new Numeration())
        Object.assign(ex, {
          sup: lettres,
          sup2: '9',
          sup3: String(type),
          sup4: '3',
          nbQuestions: 1,
        })
        ex.nouvelleVersion()
        expect(ex.autoCorrection).toHaveLength(1)
        expect(ex.autoCorrection[0].formatInteractif).toBe('fill-in-the-blank')
        const content = ex.listeQuestions[0].match(
          /<math-field[^>]*>(.*?)<\/math-field>/s,
        )![1]
        expect(content).not.toContain('$')
        expect(() =>
          katex.renderToString(
            content.replace(/\\placeholder\[[^\]]+\]\{\}/g, '\\ldots'),
            { throwOnError: true },
          ),
        ).not.toThrow()
        const valeurs = ex.autoCorrection[0].valeur!
        const champs = Object.entries(valeurs).filter(([key]) =>
          key.startsWith('champ'),
        )
        expect(champs.length).toBeGreaterThan(0)
        for (const [, answer] of champs) {
          const a = answer as {
            value: string | string[]
            options?: Record<string, boolean>
            compare?: typeof fonctionComparaison
          }
          const values = Array.isArray(a.value) ? a.value : [a.value]
          for (const value of values) {
            expect(
              (a.compare ?? fonctionComparaison)(value, value, a.options).isOk,
            ).toBe(true)
            if (lettres && type === 2) {
              expect(
                (a.compare ?? fonctionComparaison)(
                  `\\text{${value}}`,
                  value,
                  a.options,
                ).isOk,
              ).toBe(true)
            }
          }
        }
        expect(valeurs.bareme!(champs.map(() => 1))).toEqual([1, 1])
        expect(valeurs.bareme!(champs.map(() => 0))).toEqual([0, 1])
        expect(
          ex.listeQuestions[0].match(/<math-field/g)?.length,
        ).toBeLessThanOrEqual(1)
      })
    }

  it('calcule une réponse entière exacte pour toutes les puissances proposées', () => {
    const resultats = new Set<number>()
    for (let i = 0; i < 50; i++) {
      const ex = prepare(new Puissances())
      vi.spyOn(ex, 'quotaChoice').mockReturnValue('b')
      seedrandom(`puissances-${i}`, { global: true })
      ex.nouvelleVersion()
      expect(Number.isInteger(ex.reponse)).toBe(true)
      resultats.add(Number(ex.reponse))
    }
    expect([...resultats].sort((a, b) => a - b)).toEqual([1, 4, 8, 16, 32])
  })

  it('accepte les fractions équivalentes et propose un symbole saisissable pour une limite inexistante', () => {
    for (const type of ['1', '2', '3', '4', '5', '6']) {
      const ex = prepare(new Limites())
      Object.assign(ex, { sup: type, nbQuestions: 1 })
      ex.nouvelleVersion()
      const answer = ex.autoCorrection[0].valeur!.reponse!
      const value = answer.value as string
      if (value === '\\not\\exists') {
        expect(answer.compare!(value, value).isOk).toBe(true)
        expect(ex.consigne).toContain(value)
        expect(ex.listeQuestions[0]).toContain('NOT_EXISTS')
      } else {
        expect(answer.options?.texteAvecCasse).not.toBe(true)
        expect(
          fonctionComparaison(`2\\times(${value})/2`, value, answer.options)
            .isOk,
        ).toBe(true)
      }
    }
  })
})
