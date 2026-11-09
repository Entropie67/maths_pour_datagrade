import { pave } from '../../../lib/2d/projections3d'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer un volue'
export const interactifReady = true

export const uuid = 'atfsw'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q11 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: '$\\text{ cm}^3$' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(L?: number, l?: number, h?: number) {
    if (L == null || l == null || h == null) {
      l = randint(2, 5)
      L = randint(2, 4)
      h = randint(2, 6, [l, L])
    }

    const pav = pave(L, l, h)
    const reponse = L * l * h

    this.question =
      'Quel est le volume en $\\text{cm}^3$ de ce pavé droit ?<br>'
    this.question += ` ${mathalea2d({ xmin: -2, ymin: -2, xmax: 10, ymax: l + 2, scale: 0.5 }, pav)}`
    this.correction = `Le volume de ce pavé droit est : $${L}\\times ${l}\\times ${h}=${miseEnEvidence(reponse)}\\text{ cm}^3$.`
    this.reponse = reponse
    this.canReponseACompleter = `$\\ldots\\text{ cm}^3$ `
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(3, 2, 5)
    else this.enonce()
  }
}
