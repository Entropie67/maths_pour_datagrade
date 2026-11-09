import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Donner un taux d'évolution"
export const interactifReady = true

export const uuid = 'x4c94'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q18 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: '$\\%$' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(coeff?: number) {
    if (coeff == null) {
      coeff = randint(1, 99) / 100
    }

    const a = new Decimal(coeff)
    const reponse = new Decimal(a).mul(-1).add(1).mul(100)

    this.question = `On applique un coefficient multiplicateur de $${texNombre(a, 2)}$.<br>
À quelle baisse, en pourcentage, cela correspond-il ?`
    this.correction = `Multiplier par $${texNombre(a, 2)}$ revient à multiplier par $1-\\dfrac{${texNombre(reponse, 0)}}{100}$. <br>
Cela revient donc à baisser de $${miseEnEvidence(texNombre(reponse, 0))}\\,\\%$.`
    this.reponse = reponse
    this.canReponseACompleter = '$\\ldots\\%$'
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(0.93)
    else this.enonce()
  }
}
