import { describe, expect, it, vi } from 'vitest'

vi.mock('../../src/lib/renderScratch', () => ({ renderScratch: vi.fn() }))
vi.mock('../../src/lib/components/version', () => ({
  checkForServerUpdate: vi.fn(),
}))

import IntegralesSansComposition from '../../src/exercices/ch/4e/4mInt-5'
import IntegralesComposees from '../../src/exercices/ch/4e/4mInt-6'
import ValeurMoyenneIntegrale from '../../src/exercices/ch/4e/4mInt-7'
import PrimitivesSansComposition from '../../src/exercices/ch/4e/4mInt-1'
import PrimitivesSansCompositionCondition from '../../src/exercices/ch/4e/4mInt-3'
import ce, {
  fonctionComparaison,
} from '../../src/lib/interactif/comparisonFunctions'
import { context } from '../../src/modules/context'

function numericalIntegral(latex: string, a: number, b: number) {
  const expression = ce.parse(latex)
  const n = 400
  let sum = 0
  for (let j = 0; j <= n; j++) {
    const x = a + ((b - a) * j) / n
    const value = Number(expression.subs({ x }).N().valueOf())
    expect(Number.isFinite(value), latex).toBe(true)
    sum += (j === 0 || j === n ? 1 : j % 2 ? 4 : 2) * value
  }
  return (sum * (b - a)) / (3 * n)
}

function answer(
  exo:
    | PrimitivesSansComposition
    | IntegralesSansComposition
    | IntegralesComposees
    | ValeurMoyenneIntegrale,
  index: number,
  field: 'reponse' | 'field0' | 'field1' | 'field2' = 'reponse',
) {
  const value = exo.autoCorrection[index]?.valeur?.[field]
  if (!value || typeof value !== 'object' || !('value' in value))
    throw new Error('Réponse manquante')
  return String(value.value)
}

const rationalLatex = /^-?(?:\d+|\\d?frac\{-?\d+\}\{\d+\})$/

describe('construction à partir de réponses rationnelles', () => {
  it.each(
    Array.from({ length: 45 }, (_, index) => [
      Math.floor(index / 9),
      Math.floor(index / 3) % 3,
      index % 3,
    ]),
  )(
    'vérifie les bornes et la valeur de l’intégrale (famille %i, exposants %i)',
    (family, exponent, seed) => {
      const exo = new IntegralesComposees()
      exo.sup = `${Array.from({ length: 8 }, (_, j) => Number(j === family)).join('-')}*${Array.from({ length: 3 }, (_, j) => Number(j === exponent)).join('-')}`
      exo.nbQuestions = 1
      exo.seed = `rational-integral-${seed}`
      exo.nouvelleVersionWrapper()
      const match = /\\int_\{(.*?)\}\^\{(.*?)\} (.*?)\\,\\mathrm/.exec(
        exo.listeQuestions[0],
      )
      expect(match).not.toBeNull()
      const [, aTex, bTex, integrand] = match!
      const a = Number(ce.parse(aTex).N().valueOf())
      const b = Number(ce.parse(bTex).N().valueOf())
      expect(b).toBeGreaterThan(a)
      // La positivité de u n'est justifiée que si l'exposant l'exige.
      expect(exo.listeCorrections[0].includes("d'où $u(x)")).toBe(
        exponent !== 0,
      )
      const target = answer(exo, 0)
      expect(target).toMatch(rationalLatex)
      expect(numericalIntegral(integrand, a, b)).toBeCloseTo(
        Number(ce.parse(target).N().valueOf()),
        5,
      )
    },
  )

  it.each(
    Array.from({ length: 18 }, (_, index) => [
      Math.floor(index / 3),
      index % 3,
    ]),
  )('vérifie I, m et C pour la famille %i (graine %i)', (family, seed) => {
    const exo = new ValeurMoyenneIntegrale()
    exo.sup = `${Array.from({ length: 6 }, (_, j) => Number(j === family)).join('-')}*0`
    exo.nbQuestions = 1
    exo.seed = `rational-mean-${seed}`
    exo.nouvelleVersionWrapper()
    const match =
      /Soit \$f\\colon\[([^;]+);([^\]]+)\]\\to\\mathbb\{R\}\$ la fonction définie par \$f\(x\)=(.*?)\$\./.exec(
        exo.listeQuestions[0],
      )
    expect(match).not.toBeNull()
    const [, aTex, bTex, f] = match!
    const a = Number(ce.parse(aTex).N().valueOf())
    const b = Number(ce.parse(bTex).N().valueOf())
    // Pas de parenthèses autour d'un nombre positif dans la correction.
    expect(exo.listeCorrections[0]).not.toMatch(
      /[-+]\(\d+\)|(?<![A-Za-z])\(\d+\)-/,
    )
    const integral = answer(exo, 0, 'field0')
    const mean = answer(exo, 0, 'field1')
    // Les familles trigonométriques (4 et 5) ont une intégrale multiple de π.
    if (family < 4) expect(integral).toMatch(rationalLatex)
    expect(mean).toMatch(rationalLatex)
    const value = numericalIntegral(f, a, b)
    expect(value).toBeCloseTo(Number(ce.parse(integral).N().valueOf()), 5)
    expect(value / (b - a)).toBeCloseTo(Number(ce.parse(mean).N().valueOf()), 5)
    const roots = answer(exo, 0, 'field2')
    if (family === 2) {
      // Les facteurs cubiques sont extraits de la racine.
      const radicand = /\\sqrt\[3\]\{(\d+)\}/.exec(roots)
      if (radicand) {
        for (let p = 2; p ** 3 <= Number(radicand[1]); p++)
          expect(Number(radicand[1]) % p ** 3).not.toBe(0)
      }
    }
    const inner = /^(?:\\left)?\\\{(.*?)(?:\\right)?\\\}$/.exec(roots)
    expect(inner).not.toBeNull()
    for (const root of inner![1].split(';')) {
      const c = Number(ce.parse(root).N().valueOf())
      expect(c).toBeGreaterThanOrEqual(a - 1e-9)
      expect(c).toBeLessThanOrEqual(b + 1e-9)
      expect(Number(ce.parse(f).subs({ x: c }).N().valueOf())).toBeCloseTo(
        Number(ce.parse(mean).N().valueOf()),
        8,
      )
    }
  })

  it('accepte une autre écriture exacte de la racine cubique', () => {
    expect(
      fonctionComparaison(
        '\\{\\sqrt[3]{\\frac{64}{3}}\\}',
        '\\{\\dfrac{4\\sqrt[3]{9}}{3}\\}',
        { ensembleDeNombres: true },
      ).isOk,
    ).toBe(true)
  })
})

describe('présentation des intégrales CH', () => {
  it.each([false, true])(
    'regroupe les sous-questions dans un champ multiple indexé par la question (intégrale donnée : %s)',
    (donnee) => {
      context.isHtml = true
      const exo = new ValeurMoyenneIntegrale()
      exo.sup = `1-1-1-1-1-1*${donnee ? 1 : 0}`
      exo.seed = 'integration-presentation'
      exo.nbQuestions = 6
      exo.interactif = true
      exo.numeroExercice = 0
      exo.nouvelleVersionWrapper()
      expect(exo.listeQuestions).toHaveLength(6)
      expect(exo.autoCorrection).toHaveLength(6)
      for (const [i, question] of exo.listeQuestions.entries()) {
        expect(question).toContain('multi-mathfield')
        expect(exo.autoCorrection[i].formatInteractif).toBe('multi-mathfield')
        const fields = Object.entries(
          exo.autoCorrection[i].valeur ?? {},
        ).filter(([name]) => name.startsWith('field'))
        expect(fields).toHaveLength(donnee ? 2 : 3)
        for (const [, expected] of fields) {
          if (expected && typeof expected === 'object' && 'value' in expected) {
            const compare =
              'compare' in expected && typeof expected.compare === 'function'
                ? expected.compare
                : fonctionComparaison
            expect(
              compare(
                String(expected.value),
                String(expected.value),
                expected.options,
              ).isOk,
              String(expected.value),
            ).toBe(true)
          }
        }
      }
    },
  )

  it.each([false, true])(
    'numérote les sous-questions sans interactivité (intégrale donnée : %s)',
    (donnee) => {
      context.isHtml = true
      const exo = new ValeurMoyenneIntegrale()
      exo.sup = `1-1-1-1-1-1*${donnee ? 1 : 0}`
      exo.seed = 'integration-presentation'
      exo.nbQuestions = 6
      exo.interactif = false
      exo.nouvelleVersionWrapper()
      for (const question of exo.listeQuestions) {
        expect(question).toContain('a)&nbsp;')
        expect(question).toContain('b)&nbsp;')
        expect(question.includes('c)&nbsp;')).toBe(!donnee)
        expect(question.includes('Calculer la valeur de')).toBe(!donnee)
      }
    },
  )

  it('réduit les facteurs constants dans les intégrandes et conserve des réponses exactes', () => {
    const exo = new IntegralesComposees()
    exo.sup = '1-0-0-0-0-0-0-0*0-0-1'
    exo.seed = 'integration-presentation'
    exo.nbQuestions = 10
    exo.nouvelleVersionWrapper()
    expect(exo.listeQuestions).toHaveLength(10)
    for (const question of exo.listeQuestions) {
      expect(question).not.toMatch(/\\left\(-?\d+\\right\)/)
    }
    for (const correction of exo.listeCorrections) {
      expect(correction).not.toMatch(/\d\.\d/)
      expect(correction).not.toMatch(/\\left\(\d+\\right\)\^/)
    }
  })
})

describe('intégrales sans composition', () => {
  it.each(Array.from({ length: 18 }, (_, i) => [Math.floor(i / 3), i % 3]))(
    'vérifie la valeur et la primitive (famille %i, graine %i)',
    (family, seed) => {
      const exo = new IntegralesSansComposition()
      exo.sup = Array.from({ length: 6 }, (_, j) => Number(j === family)).join(
        '-',
      )
      exo.nbQuestions = 3
      exo.seed = `simple-integral-${seed}`
      exo.nouvelleVersionWrapper()
      expect(exo.listeQuestions).toHaveLength(3)
      for (const [i, question] of exo.listeQuestions.entries()) {
        const match = /\\int_\{(.*?)\}\^\{(.*?)\} (.*?)\\,\\mathrm/.exec(
          question,
        )
        expect(match).not.toBeNull()
        const [, aTex, bTex, integrand] = match!
        const a = Number(ce.parse(aTex).N().valueOf())
        const b = Number(ce.parse(bTex).N().valueOf())
        expect(b).toBeGreaterThan(a)
        const target = answer(exo, i)
        expect(target.replaceAll('\\,', '')).toMatch(rationalLatex)
        expect(numericalIntegral(integrand, a, b)).toBeCloseTo(
          Number(ce.parse(target).N().valueOf()),
          5,
        )
        const primitive = /F\(x\)=(.*?)\$/.exec(exo.listeCorrections[i])![1]
        const f = ce.parse(primitive)
        const value = (x: number) => Number(f.subs({ x }).N().valueOf())
        expect(value(b) - value(a)).toBeCloseTo(
          Number(ce.parse(target).N().valueOf()),
          8,
        )
        const x = (a + b) / 2
        expect((value(x + 1e-5) - value(x - 1e-5)) / 2e-5).toBeCloseTo(
          Number(ce.parse(integrand).subs({ x }).N().valueOf()),
          4,
        )
      }
    },
  )
})

describe('primitives sans composition', () => {
  it.each(Array.from({ length: 18 }, (_, i) => [Math.floor(i / 3), i % 3]))(
    'vérifie la dérivée, la condition et les réponses équivalentes (famille %i, mode %i)',
    (family, mode) => {
      context.isHtml = true
      const exo =
        mode === 0
          ? new PrimitivesSansComposition()
          : new PrimitivesSansCompositionCondition()
      exo.sup =
        Array.from({ length: 6 }, (_, j) => Number(j === family)).join('-') +
        (mode === 0 ? '' : `*${mode === 1 ? 'valeur' : 'point'}`)
      exo.nbQuestions = 3
      exo.interactif = true
      exo.numeroExercice = 0
      exo.seed = `simple-primitive-${family}-${mode}`
      exo.nouvelleVersionWrapper()
      expect(exo.listeQuestions).toHaveLength(3)
      for (const [i, question] of exo.listeQuestions.entries()) {
        const integrand = /f\(x\)=(.*?)\$/.exec(question)![1]
        const target = answer(exo, i)
        const f = ce.parse(target)
        const value = (x: number) => Number(f.subs({ x }).N().valueOf())
        for (const x of [1.2, 1.8, 2.4]) {
          expect((value(x + 1e-5) - value(x - 1e-5)) / 2e-5).toBeCloseTo(
            Number(ce.parse(integrand).subs({ x }).N().valueOf()),
            4,
          )
        }
        const expected = exo.autoCorrection[i].valeur?.reponse
        if (
          !expected ||
          typeof expected !== 'object' ||
          !('compare' in expected) ||
          typeof expected.compare !== 'function'
        )
          throw new Error('Comparateur manquant')
        expect(expected.compare(target, target).isOk).toBe(true)
        expect(expected.compare(`${target}+3`, target).isOk).toBe(mode === 0)
        expect(expected.compare(`${target}+x`, target).isOk).toBe(false)
        if (mode !== 0) {
          const condition =
            mode === 1
              ? /telle que \$F\\left\((.*?)\\right\)=(.*?)\$/.exec(question)
              : /point \$A\\left\((.*?);(.*?)\\right\)/.exec(question)
          expect(condition).not.toBeNull()
          const [, x0, y0] = condition!
          expect(value(Number(ce.parse(x0).N().valueOf()))).toBeCloseTo(
            Number(ce.parse(y0).N().valueOf()),
            8,
          )
        }
      }
    },
  )
})
