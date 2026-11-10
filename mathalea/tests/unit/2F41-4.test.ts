import seedrandom from 'seedrandom'
import { afterEach, expect, it, vi } from 'vitest'
import EncadrerImageExpressionAffine from '../../src/exercices/2e/2F41-4'
import { context } from '../../src/modules/context'

const originalRandom = Math.random
const originalContext = { ...context }
afterEach(() => {
  Math.random = originalRandom
  Object.assign(context, originalContext)
})

function nombre(latex: string): number {
  const valeur = latex.trim()
  const inverse = /^(-?)\\dfrac\{1\}\{(\d+)\}$/.exec(valeur)
  if (inverse != null) return (inverse[1] === '-' ? -1 : 1) / Number(inverse[2])
  const racine = /^\\sqrt\{(\d+)\}$/.exec(valeur)
  if (racine != null) return Math.sqrt(Number(racine[1]))
  return Number(valeur)
}

const estLarge = (symbole: string) =>
  symbole.includes('leqslant') || symbole.includes('geqslant')

type Cas = { type: string; sup: string }
const cas: Cas[] = [
  { type: 'carré', sup: '1' },
  { type: 'inverse', sup: '2' },
  { type: 'racine carrée', sup: '3' },
]

it.each(cas)(
  'les bornes de $type sont exactes et atteintes ou non selon les symboles',
  ({ sup }) => {
    context.isHtml = false
    context.isAmc = false
    for (let seed = 0; seed < 100; seed++) {
      seedrandom(`encadrer-${sup}-${seed}`, { global: true })
      const exercice = new EncadrerImageExpressionAffine()
      exercice.numeroExercice = 0
      exercice.sup = sup
      exercice.nbQuestions = 5
      exercice.nouvelleVersion()
      expect(exercice.listeQuestions).toHaveLength(5)
      exercice.listeQuestions.forEach((question, i) => {
        const hypothese =
          /Si \$(-?\d+) (\\leqslant|<) x (\\leqslant|<) (-?\d+)\$/.exec(
            question,
          )!
        const [a, b] = [Number(hypothese[1]), Number(hypothese[4])]
        const [large1, large2] = [
          estLarge(hypothese[2]),
          estLarge(hypothese[3]),
        ]
        const expression =
          /\$\\ldots\\ldots\$\s+\$(.*)\$\s+\$\\ldots\\ldots\$/.exec(question)![1]
        const affine = /(-?\d*)x([+-]\d+)/.exec(expression)!
        const m =
          affine[1] === '' ? 1 : affine[1] === '-' ? -1 : Number(affine[1])
        const p = Number(affine[2])
        const f = (x: number) => {
          const u = m * x + p
          if (expression.startsWith('(')) return u ** 2
          if (expression.startsWith('\\dfrac')) return 1 / u
          return Math.sqrt(u)
        }

        const valeur = exercice.autoCorrection[i].valeur as unknown as Record<
          string,
          { value: string }
        >
        const lignes = [(x: number) => m * x, (x: number) => m * x + p, f]
        lignes.forEach((g, ligne) => {
          const [, gauche, symboleGauche] = /^(.*?)\s*(\\leqslant|<)$/.exec(
            valeur[`champ${2 * ligne + 1}`].value,
          )!
          const [, symboleDroite, droite] = /^(\\leqslant|<)\s*(.*)$/.exec(
            valeur[`champ${2 * ligne + 2}`].value,
          )!
          const [borneG, borneD] = [nombre(gauche), nombre(droite)]

          // Les bornes annoncées sont les extrema (ou bornes inférieure et supérieure) de g.
          const pas = 400
          const valeurs: number[] = []
          for (let k = 0; k <= pas; k++) {
            const x = a + ((b - a) * k) / pas
            const inclus = (k > 0 || large1) && (k < pas || large2)
            if (inclus) valeurs.push(g(x))
          }
          // Le point où l'expression affine s'annule est un extremum possible du carré.
          const zero = -p / m
          if (ligne === 2 && zero > a && zero < b) valeurs.push(g(zero))
          const epsilon = 1e-9
          expect(Math.min(...valeurs)).toBeGreaterThanOrEqual(borneG - epsilon)
          expect(Math.max(...valeurs)).toBeLessThanOrEqual(borneD + epsilon)
          // Bornes optimales : g approche les bornes à l'extrémité (bornes ouvertes comprises).
          const toutes = valeurs.concat([g(a), g(b)])
          expect(Math.min(...toutes)).toBeCloseTo(borneG, 6)
          expect(Math.max(...toutes)).toBeCloseTo(borneD, 6)
          // Symbole large si et seulement si la borne est atteinte.
          const atteint = (borne: number) =>
            valeurs.some((y) => Math.abs(y - borne) < epsilon)
          expect(estLarge(symboleGauche)).toBe(atteint(borneG))
          expect(estLarge(symboleDroite)).toBe(atteint(borneD))
        })
        expect(exercice.autoCorrection[i].formatInteractif).toBe(
          'fill-in-the-blank',
        )
      })
    }
  },
)

// Saisies de l'élève pour les trois lignes : renversées (`-1 > -x > -3`) ou non.
function attribuePoints(
  saisies: (
    valeurs: Record<string, { value: string }>,
  ) => Record<string, string>,
) {
  context.isHtml = true
  seedrandom('points', { global: true })
  const exercice = new EncadrerImageExpressionAffine()
  exercice.numeroExercice = 0
  exercice.interactif = true
  exercice.sup = '1'
  exercice.nbQuestions = 1
  exercice.nouvelleVersion()
  const valeur = exercice.autoCorrection[0].valeur as unknown as Record<
    string,
    { value: string } & Record<string, unknown>
  > & {
    callback: (
      exercice: unknown,
      question: number,
    ) => { score: { nbBonnesReponses: number; nbReponses: number } }
    bareme: (liste: number[]) => [number, number]
  }
  const reponses = saisies(valeur)
  // Un faux champ remplace le custom element, qui exige un vrai mathfield monté.
  const champ = {
    getPromptValue: (id: string) => reponses[id],
    setPromptState: () => {},
  }
  const espion = vi
    .spyOn(document, 'querySelector')
    .mockReturnValue(champ as unknown as Element)
  const { score } = valeur.callback(exercice, 0)
  espion.mockRestore()
  return { score, maximum: valeur.bareme([1, 1])[1] }
}

const inverseSens = (symbole: string) =>
  symbole.replace('leqslant', 'geqslant').replace('<', '>')

it("attribue 2 points si tout est juste, y compris dans l'ordre inverse", () => {
  const exact = attribuePoints((valeur) =>
    Object.fromEntries(
      Object.entries(valeur)
        .filter(([cle]) => cle.startsWith('champ'))
        .map(([cle, { value }]) => [cle, value]),
    ),
  )
  expect(exact.score).toEqual({ nbBonnesReponses: 2, nbReponses: 2 })
  expect(exact.maximum).toBe(2)

  const inverse = attribuePoints((valeur) => {
    const saisies: Record<string, string> = {}
    for (let ligne = 0; ligne < 3; ligne++) {
      const gauche = valeur[`champ${2 * ligne + 1}`].value
      const droite = valeur[`champ${2 * ligne + 2}`].value
      const [borneGauche, symboleGauche] = [
        gauche.replace(/\s*(\\leqslant|<)$/, ''),
        /(\\leqslant|<)$/.exec(gauche)![1],
      ]
      const [symboleDroite, borneDroite] = [
        /^(\\leqslant|<)/.exec(droite)![1],
        droite.replace(/^(\\leqslant|<)\s*/, ''),
      ]
      saisies[`champ${2 * ligne + 1}`] =
        `${borneDroite} ${inverseSens(symboleDroite)}`
      saisies[`champ${2 * ligne + 2}`] =
        `${inverseSens(symboleGauche)} ${borneGauche}`
    }
    return saisies
  })
  expect(inverse.score).toEqual({ nbBonnesReponses: 2, nbReponses: 2 })
})

it('attribue 1 point si seul le résultat final est juste, 0 sinon', () => {
  const justes = (valeur: Record<string, { value: string }>) =>
    Object.fromEntries(
      Object.entries(valeur)
        .filter(([cle]) => cle.startsWith('champ'))
        .map(([cle, { value }]) => [cle, value]),
    )
  const etapeFausse = attribuePoints((valeur) => ({
    ...justes(valeur),
    champ3: '1000 <',
  }))
  expect(etapeFausse.score).toEqual({ nbBonnesReponses: 1, nbReponses: 2 })

  const etapeVide = attribuePoints((valeur) => ({
    ...justes(valeur),
    champ1: '',
    champ2: '',
  }))
  expect(etapeVide.score).toEqual({ nbBonnesReponses: 1, nbReponses: 2 })

  const finalFaux = attribuePoints((valeur) => ({
    ...justes(valeur),
    champ6: '< 1000',
  }))
  expect(finalFaux.score).toEqual({ nbBonnesReponses: 0, nbReponses: 2 })
})
