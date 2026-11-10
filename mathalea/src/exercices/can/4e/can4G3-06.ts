import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { context } from '../../../modules/context'
import ExerciceSimple from '../../ExerciceSimple'

import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'

import { mathalea2d } from '../../../modules/mathalea2d'

export const titre = "Calculer le périmètre d'un quadrilatère"
export const interactifReady = true

export const dateDePublication = '09/12/2025'
/**
 * @author Gilles Mora

 * 
*/
export const uuid = 'a7398'

export const refs = {
  'fr-fr': ['can4G3-06'],
  'fr-ch': [],
}
export default class QuestionsAiresEtPerimetres4 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: 'm' }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 3) //
    const b = this.quotaRandint('b', 4, 7) //
    const n = this.quotaRandint('n', 7, 12)
    const c =
      this.quotaRandint('cEntier', 1, 6) +
      this.quotaRandint('cDixieme', 3, 9) / 10
    const d = n - c
    const A = pointAbstrait(0, 0, 'P')
    const B = pointAbstrait(7, 1, 'Q', 'below')
    const C = pointAbstrait(6.5, 4, 'R')
    const D = pointAbstrait(2, 5, 'R')
    const objets = []
    objets.push(
      segment(A, B),
      segment(B, C),
      segment(C, D),
      segment(D, A),
      tracePoint(A, B, C, D),
    )
    objets.push(
      texteParPosition(
        `${stringNombre(b)} m`,
        milieu(A, D).x - 0.8,
        milieu(A, D).y,
      ),
      texteParPosition(
        `${stringNombre(a)} m`,
        milieu(B, C).x + 0.7,
        milieu(B, C).y,
      ),
      texteParPosition(
        `${stringNombre(c)} m`,
        milieu(A, B).x,
        milieu(A, B).y - 0.5,
      ),
      texteParPosition(
        `${stringNombre(d)} m`,
        milieu(C, D).x,
        milieu(C, D).y + 0.5,
      ),
    )
    this.question = 'Quel est le périmètre de cette figure ?<br>'
    this.question += mathalea2d(
      {
        xmin: -1,
        ymin: -1,
        xmax: 8,
        ymax: 6,
        pixelsParCm: 20,
        mainlevee: true,
        amplitude: 0.5,
        scale: 0.7,
        center: !context.isHtml,
      },
      objets,
    )
    this.correction = ` Le périmètre est donné par : $${texNombre(a)}+${texNombre(b)}+${texNombre(c)}+${texNombre(d)}=${miseEnEvidence(a + b + c + d)}\\text{ m}$.<br>`
    this.reponse = a + b + c + d

    this.canReponseACompleter = '$\\ldots\\text{ m}$'
    this.listeCanReponsesACompleter.push(this.canReponseACompleter)
  }
}
