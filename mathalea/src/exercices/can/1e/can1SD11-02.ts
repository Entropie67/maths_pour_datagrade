import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { courbe } from '../../../lib/2d/Courbe'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre =
  'Déterminer graphiquement la valeur de $b$ avec une parabole'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '08/06/2022' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag
export const dateDeModifImportante = '11/10/2023' // j'ai enlevé c. J'ai ajoute a=-1
/**
 *
 * @author Gilles Mora

 */
export const uuid = '053d7'

export const refs = {
  'fr-fr': ['can1SD11-02'],
  'fr-ch': ['1mF3-17'],
}
export default class LectureGraphiqueParabolebEtc extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let texte, texteCorr, r, o, f, A, traceA
    let alpha: number
    let beta: number
    let a: number
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      alpha = randint(-3, 3)
      beta = randint(-2, 2)
      a = choice([-1, 1])
      o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1, 'milieu')
      A = pointAbstrait(alpha, beta)

      traceA = tracePoint(A, bleuMathalea) // Variable qui trace les points avec une croix
      f = (x: number): number => a * (x - alpha) ** 2 + beta
      r = repere({
        yUnite: 1,
        xMin: -5,
        yMin: -4,
        yMax: 4,
        xMax: 5,
        thickHauteur: 0.1,
        xLabelMin: -4,
        xLabelMax: 4,
        yLabelMax: 3,
        yLabelMin: -3,
        // yLabelMin: -9,
        // yLabelListe:[-8,-6,-4,-2,2,4,6,8],
        axeXStyle: '->',
        axeYStyle: '->',
      })

      texte = `La courbe représente une fonction $f$ définie par $f(x)=${rienSi1(a)}x^2+bx+c$.<br>
      Déterminer la valeur de $b$.<br>`
      texte += mathalea2d(
        {
          xmin: -5,
          xmax: 5.05,
          ymin: -4,
          ymax: 4, // Math.max(3, f(0) + 1),
          pixelsParCm: 25,
          scale: 0.6,
          center: !context.isHtml,
        },
        r,
        o,
        traceA,
        courbe(f, { repere: r, color: bleuMathalea, epaisseur: 2 }),
      )

      if (this.interactif) {
        texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase, {
          texteAvant: '$b=$',
        })

        handleAnswers(this, i, { reponse: { value: -2 * a * alpha } })
      }

      texteCorr = `L'abscisse du sommet de la parabole est $${alpha}$.<br>
          Comme l'abscisse du sommet est donné par $-\\dfrac{b}{2a}$, alors $-\\dfrac{b}{2a}=${alpha}$.<br>
          L'énoncé indique que $a=${a}$, on en déduit $-\\dfrac{b}{${2 * a}}=${alpha}$, soit $b=${miseEnEvidence(a * alpha * -2)}$.`

      if (this.questionJamaisPosee(i, alpha, beta)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        this.listeCanEnonces.push(texte)
        this.listeCanReponsesACompleter.push('$b=\\ldots$')
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
