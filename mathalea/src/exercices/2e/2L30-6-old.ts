// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid d4e8a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { addMathaleaSolveur } from '../../lib/customElements/MathaleaSolveurElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureAlgebrique, rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Résoudre une inéquation pas à pas'
export const interactifReady = true
export const dateDePublication = '29/09/2026'
export const uuid = 'd4e8a'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

type Relation = '<' | '>' | '\\leqslant' | '\\geqslant'

type InequationData = {
  inequation: string
  solution: string
  correctionSteps: string[]
  uniquenessKey: string
}

/**
 * Modèle minimal d'intégration de MathaleaSolveurElement pour les
 * inéquations. Les formes proposées sont reprises de 2L30-3.
 * @author Jean-Claude Lhote
 */
export default class ResoudreInequationPasAPasOld extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = [
      'Afficher la représentation graphique des solutions',
    ]
    this.sup = true
    this.consigne = 'Résoudre les inéquations suivantes pas à pas.'
    this.nbQuestions = 2
    this.spacing = 2
  }

  nouvelleVersion(): void {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const data = generateInequation()
      if (!this.questionJamaisPosee(i, data.uniquenessKey)) continue

      this.listeQuestions[i] = addMathaleaSolveur(this, i, {
        initial: data.inequation,
        kind: 'inequation',
        mode: this.interactif ? 'evaluation' : 'entrainement',
        showInterval: Boolean(this.sup),
        intervalMin: -6,
        intervalMax: 6,
      })

      this.listeCorrections[i] =
        `$\\begin{aligned}${data.correctionSteps.map(alignInequality).join('\\\\[0.4em]')}\\end{aligned}$<br>` +
        `L'inéquation résolue s'écrit $${miseEnEvidence(data.solution)}$.`

      handleAnswers(
        this,
        i,
        { reponse: { value: data.solution } },
        { formatInteractif: 'mathalea-solveur' },
      )
      i++
    }
    listeQuestionsToContenu(this)
  }
}

function generateInequation(): InequationData {
  const type = choice([
    'ax-r-b',
    'x+b-r-c',
    'ax+b-r-c',
    'ax+b-r-cx+d',
    'a(bx+c)-r-dx+e',
  ])
  const relation = choice<Relation>(['<', '>', '\\leqslant', '\\geqslant'])
  const boundary = randint(-4, 4)

  if (type === 'x+b-r-c') {
    const b = randint(-9, 9, [0])
    const c = boundary + b
    const inequation = `x${ecritureAlgebrique(b)}${relation}${c}`
    return makeData(inequation, relation, 1, boundary, [
      inequation,
      `x${relation}${c}${ecritureAlgebrique(-b)}`,
    ])
  }

  if (type === 'ax-r-b') {
    const a = nonZeroCoefficient()
    const b = a * boundary
    const inequation = `${a}x${relation}${b}`
    const solvedRelation = a < 0 ? reverseRelation(relation) : relation
    return makeData(inequation, relation, a, boundary, [
      inequation,
      `x${solvedRelation}\\dfrac{${b}}{${a}}`,
    ])
  }

  if (type === 'ax+b-r-c') {
    const a = nonZeroCoefficient()
    const b = randint(-9, 9, [0])
    const c = a * boundary + b
    const inequation = `${a}x${ecritureAlgebrique(b)}${relation}${c}`
    const solvedRelation = a < 0 ? reverseRelation(relation) : relation
    return makeData(inequation, relation, a, boundary, [
      inequation,
      `${a}x${relation}${c}${ecritureAlgebrique(-b)}`,
      `x${solvedRelation}\\dfrac{${c - b}}{${a}}`,
    ])
  }

  if (type === 'ax+b-r-cx+d') {
    const c = nonZeroCoefficient()
    const coefficient = nonZeroCoefficient()
    const a = c + coefficient
    const b = randint(-9, 9, [0])
    const d = coefficient * boundary + b
    const inequation = `${rienSi1(a)}x${ecritureAlgebrique(b)}${relation}${rienSi1(c)}x${ecritureAlgebrique(d)}`
    const solvedRelation =
      coefficient < 0 ? reverseRelation(relation) : relation
    return makeData(inequation, relation, coefficient, boundary, [
      inequation,
      `${coefficient}x${ecritureAlgebrique(b)}${relation}${d}`,
      `${coefficient}x${relation}${d}${ecritureAlgebrique(-b)}`,
      `x${solvedRelation}\\dfrac{${d - b}}{${coefficient}}`,
    ])
  }

  const a = nonZeroCoefficient()
  const b = nonZeroCoefficient()
  const c = randint(-5, 5, [0])
  const d = randint(-7, 7, [-1, 0, 1, a * b])
  const coefficient = a * b - d
  const e = a * c + coefficient * boundary
  const inequation = `${a}(${rienSi1(b)}x${ecritureAlgebrique(c)})${relation}${rienSi1(d)}x${ecritureAlgebrique(e)}`
  const solvedRelation = coefficient < 0 ? reverseRelation(relation) : relation
  return makeData(inequation, relation, coefficient, boundary, [
    inequation,
    `${a * b}x${ecritureAlgebrique(a * c)}${relation}${rienSi1(d)}x${ecritureAlgebrique(e)}`,
    `${coefficient}x${relation}${e - a * c}`,
    `x${solvedRelation}\\dfrac{${e - a * c}}{${coefficient}}`,
  ])
}

function makeData(
  inequation: string,
  relation: Relation,
  coefficient: number,
  boundary: number,
  correctionSteps: string[],
): InequationData {
  const solvedRelation = coefficient < 0 ? reverseRelation(relation) : relation
  const solution = `x${solvedRelation}${boundary}`
  return {
    inequation,
    solution,
    correctionSteps: [...correctionSteps, solution],
    uniquenessKey: `${inequation}-${solution}`,
  }
}

function nonZeroCoefficient(): number {
  return randint(-7, 7, [-1, 0, 1])
}

function reverseRelation(relation: Relation): Relation {
  return (
    {
      '<': '>',
      '>': '<',
      '\\leqslant': '\\geqslant',
      '\\geqslant': '\\leqslant',
    } as const
  )[relation]
}

function alignInequality(inequality: string): string {
  return inequality.replace(
    /\\leqslant|\\geqslant|<|>/,
    (relation) => `&${relation}`,
  )
}
