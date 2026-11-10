import { droiteGraduee } from '../../lib/2d/DroiteGraduee'
import { crochetD, crochetG, intervalle } from '../../lib/2d/intervalles'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { orangeMathalea } from '../../lib/colors'
import {
  addEnsembleIntervallesDroite,
  type EnsembleIntervallesDroiteValue,
} from '../../lib/customElements/EnsembleIntervallesDroiteElement'
import type { IntervalleDroiteValue } from '../../lib/customElements/IntervalleDroiteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Représenter une union ou une intersection d’intervalles'
export const dateDePublication = '30/09/2026'
export const uuid = '6a1956'
export const interactifReady = true
export const refs = { 'fr-fr': ['2N12-9'], 'fr-ch': [] }

type TypeQuestion = 1 | 2 | 3 | 4
const texteIntervalle = (i: IntervalleDroiteValue) => {
  const gauche =
    i.leftBracket == null ? ']-\\infty' : `${i.leftBracket}${i.start}`
  const droite =
    i.rightBracket == null ? '+\\infty[' : `${i.end}${i.rightBracket}`
  return `${gauche}\\,;\\,${droite}`
}

function graphique(
  min: number,
  max: number,
  labels: number[],
  solution: EnsembleIntervallesDroiteValue,
) {
  const unite = Math.min(1.5, 10 / (max - min))
  const x = (value: number) => (value - min) * unite
  const axe = droiteGraduee({
    Min: min,
    Max: max,
    Unite: unite,
    thickEpaisseur: 0,
    labelsPrincipaux: false,
    labelListe: labels.map((value) => [value, String(value)]),
  })
  const objets: ObjetMathalea2D[] = [axe]
  labels.forEach((value) =>
    objets.push(segment(x(value), -0.15, x(value), 0.15)),
  )
  solution.intervals.forEach((i) => {
    const A = pointAbstrait(i.leftBracket == null ? -0.2 : x(i.start), 0)
    const B = pointAbstrait(
      i.rightBracket == null ? (max - min) * unite + 0.7 : x(i.end),
      0,
    )
    const trait = intervalle(A, B, orangeMathalea, 0)
    trait.epaisseur = 6
    objets.push(trait)
    const cg =
      i.leftBracket === '['
        ? crochetD(A, orangeMathalea)
        : crochetG(A, orangeMathalea)
    const cd =
      i.rightBracket === ']'
        ? crochetG(B, orangeMathalea)
        : crochetD(B, orangeMathalea)
    cg.taille = context.isHtml ? 0.2 : 0.35
    cd.taille = context.isHtml ? 0.2 : 0.35
    objets.push(cg, cd)
  })
  return mathalea2d(
    {
      xmin: -0.5,
      xmax: (max - min) * unite + 1,
      ymin: -1.2,
      ymax: 1.2,
      scale: 0.75,
    },
    objets,
  )
}

export default class UnionIntersectionIntervalles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.consigne = 'Représenter sur la droite graduée l’ensemble demandé.'
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const types = shuffle([1, 2, 3, 4] as TypeQuestion[])
    const casAvecInfini = shuffle([false, false, false, true])
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const type = types[i]
      const a = randint(-8, -3)
      const b = a + randint(2, 3)
      const c = b + randint(1, 2)
      const d = c + randint(2, 3)
      const min = a - 1
      const max = d + 1
      const avecInfini = casAvecInfini[i]
      const infiniAGauche = avecInfini && randint(0, 1) === 0
      const brackets = Array.from({ length: 4 }, () => randint(0, 1) === 1)
      let I: IntervalleDroiteValue
      let J: IntervalleDroiteValue
      let operation: '\\cap' | '\\cup'
      let solution: EnsembleIntervallesDroiteValue
      if (type === 1 || type === 3) {
        I = {
          start: a,
          end: c,
          leftBracket: brackets[0] ? '[' : ']',
          rightBracket: brackets[1] ? ']' : '[',
        }
        J = {
          start: b,
          end: d,
          leftBracket: brackets[2] ? '[' : ']',
          rightBracket: brackets[3] ? ']' : '[',
        }
        operation = type === 1 ? '\\cap' : '\\cup'
        solution =
          type === 1
            ? {
                intervals: [
                  {
                    start: b,
                    end: c,
                    leftBracket: J.leftBracket,
                    rightBracket: I.rightBracket,
                  },
                ],
                empty: false,
              }
            : {
                intervals: [
                  {
                    start: a,
                    end: d,
                    leftBracket: I.leftBracket,
                    rightBracket: J.rightBracket,
                  },
                ],
                empty: false,
              }
      } else {
        I = {
          start: a,
          end: b,
          leftBracket: brackets[0] ? '[' : ']',
          rightBracket: brackets[1] ? ']' : '[',
        }
        J = {
          start: c,
          end: d,
          leftBracket: brackets[2] ? '[' : ']',
          rightBracket: brackets[3] ? ']' : '[',
        }
        operation = type === 2 ? '\\cap' : '\\cup'
        solution =
          type === 2
            ? { intervals: [], empty: true }
            : { intervals: [I, J], empty: false }
      }
      if (avecInfini) {
        if (infiniAGauche) {
          I.start = min
          I.leftBracket = null
          if (type === 3) {
            solution.intervals[0].start = min
            solution.intervals[0].leftBracket = null
          }
        } else {
          J.end = max
          J.rightBracket = null
          if (type === 3) {
            solution.intervals[0].end = max
            solution.intervals[0].rightBracket = null
          }
        }
      }
      const labels = [a, b, c, d].filter(
        (value) =>
          !(infiniAGauche && value === a) &&
          !(!infiniAGauche && avecInfini && value === d),
      )
      const expression = `${texteIntervalle(I)} ${operation} ${texteIntervalle(J)}`
      const texte = `$${expression}$<br><br>${this.interactif ? addEnsembleIntervallesDroite(this, i, { min, max, labelValues: labels }) : graphique(min, max, labels, { intervals: [], empty: false })}`
      const resultat = solution.empty
        ? '\\emptyset'
        : solution.intervals
            .map((interval) => texteIntervalle(interval))
            .join('\\cup')
      const texteCorr = `${operation === '\\cap' ? 'On conserve les nombres communs aux deux intervalles.' : 'On réunit tous les nombres appartenant à au moins un des deux intervalles.'}<br><br>${graphique(min, max, labels, solution)}<br>Le résultat est $${miseEnEvidence(resultat)}$.`

      if (
        this.questionJamaisPosee(
          i,
          type,
          a,
          Number(avecInfini),
          Number(infiniAGauche),
          ...brackets.map(Number),
        )
      ) {
        if (this.interactif) {
          handleAnswers(
            this,
            i,
            { reponse: { value: JSON.stringify(solution) } },
            { formatInteractif: 'ensemble-intervalles-droite' },
          )
        }
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
