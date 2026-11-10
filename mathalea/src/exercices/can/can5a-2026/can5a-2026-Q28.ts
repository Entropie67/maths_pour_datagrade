import { codageAngle } from '../../../lib/2d/angles'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { demiDroite } from '../../../lib/2d/DemiDroite'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { latex2d } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { rotation } from '../../../lib/2d/transformations'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer un angle complémentaire'
export const interactifReady = true

export const uuid = 'o06h3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q28 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '$^\\circ$' }
  }

  enonce(angleConnu?: number) {
    if (angleConnu == null) {
      angleConnu = randint(31, 75, [40, 50, 60, 70])
    }

    // Construction initiale
    const origine = pointAbstrait(0, 0)
    const K0 = pointAbstrait(0, 0, 'K', 'below')
    const F0 = pointAbstrait(2, 0, 'F', 'below')
    const G0 = rotation(F0, K0, angleConnu)
    const H0 = rotation(F0, K0, 90)

    const angleRotationGlobale = -25
    const K = rotation(K0, origine, angleRotationGlobale)
    const F = rotation(F0, origine, angleRotationGlobale)
    const G = rotation(G0, origine, angleRotationGlobale)
    const H = rotation(H0, origine, angleRotationGlobale)

    const demiDroiteKH = demiDroite(K, H)
    const demiDroiteKG = demiDroite(K, G)
    const demiDroiteKF = demiDroite(K, F)

    const traceK = tracePoint(K)
    traceK.taille = context.isHtml ? 2 : 1

    const traceG = tracePoint(G)
    traceG.taille = context.isHtml ? 2 : 1

    const traceF = tracePoint(F)
    traceF.taille = context.isHtml ? 2 : 1

    const traceH = tracePoint(H)
    traceH.taille = context.isHtml ? 2 : 1

    const angleReponse = 90 - angleConnu

    const objets = []
    objets.push(
      demiDroiteKH,
      demiDroiteKG,
      demiDroiteKF,
      traceK,
      traceG,
      traceH,
      traceF,
      codageAngleDroit(H, K, F),
      codageAngle(F, K, G, 0.8),
      latex2d('H', H.x - 0.2, H.y + 0.3, { letterSize: 'scriptsize' }),
      latex2d('G', G.x, G.y + 0.3, { letterSize: 'scriptsize' }),
      latex2d('F', F.x, F.y - 0.3, { letterSize: 'scriptsize' }),
      latex2d('K', K.x - 0.4, K.y - 0.3, { letterSize: 'scriptsize' }),
      latex2d(`${stringNombre(angleConnu)}^\\circ`, K.x + 1.2, K.y, {
        letterSize: 'scriptsize',
      }),
    )

    this.canEnonce = mathalea2d(
      {
        xmin: -2,
        ymin: -1.5,
        xmax: 3,
        ymax: 3,
        pixelsParCm: 40,
        mainlevee: false,
        amplitude: 0.5,
        scale: 0.8,
        center: !context.isHtml,
      },
      objets,
    )

    this.question = this.canEnonce
    this.question += '<br>$\\widehat{\\text{HKG}}=$'

    this.correction = `L'angle $\\widehat{\\text{HKF}}$ est un angle droit, donc il mesure $90^\\circ$.<br>
Ainsi, $\\widehat{\\text{HKG}}=90-${angleConnu}=${miseEnEvidence(angleReponse)}^\\circ$.`

    this.reponse = angleReponse
    this.canReponseACompleter = '$\\widehat{\\text{HKG}}=\\ldots^\\circ$'

    if (!this.interactif && context.isHtml) {
      this.question += ' $\\ldots^\\circ$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(62)
    else this.enonce()
  }
}
