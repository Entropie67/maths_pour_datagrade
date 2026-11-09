import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { labelPoint, latex2d } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Lire une coordonnée d'un point"
export const interactifReady = true

export const uuid = 'riest'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can32026Q11 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '.' }
  }

  enonce(a?: number, b?: number, choix?: boolean) {
    if (a == null || b == null || choix == null) {
      // Version aléatoire
      do {
        b = randint(-2, 2)
        a = randint(-2, 4, [b])
      } while (a === 0 && b === 0)
      choix = this.quotaChoice('choix', [true, false])
    }

    this.reponse = choix ? a : b

    const r = repere({
      xUnite: 1,
      yUnite: 1,
      xMin: -3,
      xMax: 5,
      yMin: -3,
      yMax: 3,
      thickHauteur: 0.1,
      yLabelEcart: 0.4,
      xLabelEcart: 0.3,
      xLabelMin: -3,
      yLabelMin: -2,
      xLabelMax: 4,
      yLabelMax: 2,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleSecondaire: false,
      grilleOpacite: context.isHtml ? 0.1 : 0.5,
    })

    const A = pointAbstrait(a, b, 'A', 'below')
    const o = latex2d('\\text{O}', -0.2, -0.3, {
      color: 'black',
      letterSize: 'scriptsize',
    })
    const traceA = tracePoint(A)
    traceA.taille = 3
    traceA.epaisseur = 2

    this.question = mathalea2d(
      {
        xmin: -5,
        xmax: 5,
        ymin: -3,
        ymax: 3,
        scale: 0.7,
        pixelsParCm: 30,
        center: !context.isHtml,
      },
      r,
      o,
      traceA,
      labelPoint(A),
    )
    this.question += `<br>L'${choix ? 'abscisse' : 'ordonnée'} du point $A$ est `

    if (!this.interactif) {
      this.question += '$\\ldots$'
    }

    this.correction = `L'${choix ? 'abscisse' : 'ordonnée'} du point se lit sur l'axe ${choix ? 'horizontal' : 'vertical'}.<br>
On lit : $${miseEnEvidence(this.reponse)}$.`

    this.canEnonce = mathalea2d(
      {
        xmin: -5,
        xmax: 5,
        ymin: -2,
        ymax: 3,
        scale: 0.7,
        pixelsParCm: 30,
        center: !context.isHtml,
      },
      r,
      o,
      traceA,
      labelPoint(A),
    )
    this.canReponseACompleter = `L'${choix ? 'abscisse' : 'ordonnée'} du point $A$ est $\\ldots$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, -1, false)
    else this.enonce()
  }
}
