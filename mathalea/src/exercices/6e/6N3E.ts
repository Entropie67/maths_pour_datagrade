import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segmentAvecExtremites } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { pointSurSegment } from '../../lib/2d/utilitairesPoint'
import { createList } from '../../lib/format/lists'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { arrondi } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Graduer un segment de longueur donnée'

export const dateDePublication = '16/11/2025'

export const uuid = '8660f'
export const refs = {
  'fr-fr': ['6N3E'],
  'fr-ch': ['9R1NO4B-12', '9R2NO4B-12', '9R3NO4B-12', 'PRQNO04B-12'],
}
/**
 * @author Guillaume Valmont
 */
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Segment à tracer']
    this.besoinFormulaire2CaseACocher = ['Segment à partager']
    this.besoinFormulaire3Numerique = [
      'Fraction à placer',
      4,
      '1 : Pas de fraction\n2 : Fraction < 1\n3 : Fraction > 1\n4 : Fraction quelconque',
    ]
    this.sup = true
    this.sup2 = true
    this.sup3 = 4
    this.nbQuestions = 2
  }

  nouvelleVersion() {
    const typesQuestions = combinaisonListes(
      this.sup3 === 4 ? [2, 3] : [this.sup3],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      const longueur =
        typesQuestions[i] === 3
          ? randint(5, context.isHtml ? 8 : 7)
          : randint(8, context.isHtml ? 16 : 13) // 16 ça sort de la feuille à cause du décalage des listeitems (2 niveaux d'indentation)
      const den = randint(3, 7, [
        arrondi(longueur / 2, 1),
        arrondi(longueur / 3, 1),
        arrondi(longueur / 4, 1),
        arrondi(longueur / 5, 1),
      ])
      const num =
        typesQuestions[i] === 3
          ? randint(den + 1, 2 * den - 1, [arrondi(den + den / 2, 1)])
          : randint(2, den - 1, [arrondi(den / 2, 1)])
      const A = pointAbstrait(0, 0)
      const B = pointAbstrait(longueur, 0)
      const C = pointAbstrait(longueur * 2, 0)
      const unite1 = segmentAvecExtremites(A, B)
      const unite2 = segmentAvecExtremites(B, C)
      unite1.tailleExtremites = 10
      unite2.tailleExtremites = 10
      const graduations1 = []
      for (let i = 1; i < den; i++) {
        const graduation = tracePoint(
          pointSurSegment(A, B, (longueur / den) * i),
        )
        graduation.style = '|'
        graduations1.push(graduation)
      }
      const graduations2 = []
      for (let i = 0; i < den; i++) {
        const graduation = tracePoint(
          pointSurSegment(B, C, (longueur / den) * i),
        )
        graduation.style = '|'
        graduations2.push(graduation)
      }
      const pointFraction = pointSurSegment(A, B, (longueur / den) * num)
      const label = latex2d(
        `\\dfrac{${num}}{${den}}`,
        pointFraction.x,
        pointFraction.y - 1.2,
        {},
      )
      const questions = []
      const corrections = []
      if (this.sup) {
        // Segment à tracer
        questions.push(
          `Tracer un segment de longueur $${longueur}\\text{ cm}$.`,
        )
        corrections.push(`On utilise la règle pour tracer le segment de $${longueur}\\text{ cm}$ :<br>
          ${mathalea2d(fixeBordures([unite1]), unite1)}`)
      } else {
        texte += mathalea2d(fixeBordures([unite1]), unite1)
      }
      if (this.sup2) {
        // Segment à partager
        questions.push(`Partager ce segment en $${den}$ parts égales.`)
        corrections.push(`À l'aide du guide-âne, on le partage en $${den}$ parts égales :<br>
          ${mathalea2d(fixeBordures([unite1]), unite1, graduations1)}`)
      }
      switch (typesQuestions[i]) {
        case 2:
          // Fraction < 1
          questions.push(
            `Ce segment représente une unité. Placer la fraction $\\dfrac{${num}}{${den}}$.`,
          )
          corrections.push(`${this.sup2 ? '' : `Le dénominateur est $${den}$. On partage l'unité en $${den}$ parts égales à l'aide du guide-âne.<br>`}
            Chaque pas représente $\\dfrac{1}{${den}}$. On avance de $${num}$ pas pour placer la fraction $\\dfrac{${num}}{${den}}$ :<br>
            ${mathalea2d(
              fixeBordures([unite1, label]),
              unite1,
              graduations1,
              label,
            )}`)
          break
        case 3:
          // Fraction > 1
          questions.push(
            `Ce segment représente une unité. Placer la fraction $\\dfrac{${num}}{${den}}$.`,
          )
          corrections.push(`Comme le numérateur $${num}$ est supérieur au dénominateur $${den}$, une unité ne sera pas suffisante pour placer cette fraction.<br>
            On trace donc une seconde unité de même longueur ${this.sup2 ? "que l'on gradue de la même façon " : ''}:<br>
            ${mathalea2d(
              fixeBordures([unite1, unite2]),
              unite1,
              unite2,
              this.sup2 ? [graduations1, graduations2] : [],
            )}
            ${this.sup2 ? '' : `Le dénominateur est $${den}$. On partage ces unités en $${den}$ parts égales à l'aide du guide-âne.<br>`}
            Chaque pas représente $\\dfrac{1}{${den}}$. On avance de $${num}$ pas pour placer la fraction $\\dfrac{${num}}{${den}}$ :<br>
            ${mathalea2d(
              fixeBordures([unite1, unite2, label]),
              unite1,
              unite2,
              graduations1,
              graduations2,
              label,
            )}
            Remarque : on aurait pu aller plus vite en remarquant que $\\dfrac{${num}}{${den}} = 1 + \\dfrac{${num - den}}{${den}}$, donc en avançant directement de $${num - den}$ pas dans la seconde unité.`)
          break
      }
      if (questions.length > 1) {
        texte += createList({
          items: questions,
          style: 'alpha',
        })
        texteCorr += createList({
          items: corrections,
          style: 'alpha',
        })
      } else {
        texte += questions[0] ?? 'Pas de question.'
        texteCorr += corrections[0] ?? 'Pas de correction.'
      }
      if (this.questionJamaisPosee(i, num, den)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
