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

export const titre = "Déterminer l'abscisse d'un point dans un repère"
export const interactifReady = true

export const uuid = 'pl5rm'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q25 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '.' }
  }

  enonce(a?: number, b?: number) {
    if (a == null || b == null) {
      // Abscisse négative uniquement
      a = randint(-3, -1)
      b = randint(-1, 2, [a, 0])
    }

    this.reponse = a

    const r = repere({
      xUnite: 1, // CORRECTION : 1 unité dans le repère logique
      yUnite: 1, // CORRECTION : 1 unité dans le repère logique
      xMin: -3,
      xMax: 2,
      yMin: -2,
      yMax: 2,
      thickHauteur: 0.1,
      yLabelEcart: 0.3,
      xLabelEcart: 0.3,
      xLabelMin: -3,
      yLabelMin: -2,
      xLabelMax: 2,
      yLabelMax: 2,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleSecondaire: true,
      grilleSecondaireDistance: 0.5, // CORRECTION : grille secondaire tous les 0.5
      grilleDistance: 1, // Grille principale tous les 1
    })

    const M = pointAbstrait(a, b, 'M', 'above left')
    const o = latex2d('\\text{O}', 0.2, -0.4, {
      color: 'black',
      letterSize: 'scriptsize',
    })
    const traceM = tracePoint(M)
    traceM.taille = 2
    traceM.epaisseur = 2

    this.canEnonce = mathalea2d(
      {
        xmin: -4,
        xmax: 3,
        ymin: -3,
        ymax: 3,
        scale: 1, // CORRECTION : scale à 1 pour avoir 2 carreaux = 1 unité visuellement
        pixelsParCm: 40,
        center: !context.isHtml,
      },
      r,
      o,
      traceM,
      labelPoint(M),
    )

    this.question = this.canEnonce
    this.question += "<br>L'abscisse du point $M$ est "

    if (!this.interactif) {
      this.question += '$\\ldots$'
    }

    this.correction = `L'abscisse du point se lit sur l'axe horizontal.<br>
On lit : $${miseEnEvidence(this.reponse)}$.`

    this.canReponseACompleter = "L'abscisse du point $M$ est $\\ldots$"
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(-2, 1)
    else this.enonce()
  }
}
