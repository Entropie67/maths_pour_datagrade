import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { symboleParallele } from '../../../lib/outils/notationsGeometrie'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une longueur avec Thalès'
export const interactifReady = true

export const uuid = '1381e'
export const refs = {
  'fr-fr': [''],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculLongueurThales extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteApres: '$\\text{ cm}$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 4 : randint(3, 5) // longueur IT
    const k = this.canOfficielle ? 3 : randint(3, 5)
    const b = k * a // longueur IS
    const c = a + 1 // longueur IQ
    const d = k * c // longueur IR
    const A = pointAbstrait(0, 0, 'I', 'below')
    const B = pointAbstrait(2.6, -0.29, 'Q', 'below')
    const C = pointAbstrait(9, -1, 'R', 'below')
    const D = pointAbstrait(7, 2, 'S', 'above')
    const E = pointAbstrait(2.03, 0.58, 'T', 'above')
    const xmin = -1
    const ymin = -2
    const xmax = 10
    const ymax = 2.9

    const objets = []
    objets.push(
      segment(A, C),
      segment(A, D),
      labelPoint(A, B, C, D, E),
      segment(A, D),
      segment(A, C),
      segment(B, E),
      segment(D, C),
    )
    this.reponse = d

    this.question = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 30,
        mainlevee: false,
        amplitude: 0.5,
        scale: 0.6,
        center: !context.isHtml,
      },
      objets,
    )
    this.question += `$(TQ)${symboleParallele()}(SR)$<br>
              $IT=${a}\\text{ cm}$<br>
              $IS=${b}\\text{ cm}$ <br>
              $IQ=${c}\\text{ cm}$<br>
              `
    this.correction = `Le triangle $ISR$ est un agrandissement du triangle $ITQ$. Le coefficient d'agrandissement est donné par : $\\dfrac{IS}{IT}=\\dfrac{${b}}{${a}}=${texNombre(k, 0)}$.<br>
             On obtient donc la longueur $IR$ en multipliant par $${k}$ la longueur $IQ$.<br>
             $IR=${c}\\times ${k}=${miseEnEvidence(d)}\\text{ cm}$.<br>`

    this.question += this.interactif ? '<br>$IR=$' : '$IR=\\ldots\\text{ cm}$'

    this.canReponseACompleter = '$IR=\\ldots\\text{ cm}$'
  }
}
