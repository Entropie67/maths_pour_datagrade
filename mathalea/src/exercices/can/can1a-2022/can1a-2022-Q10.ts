import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer avec un pourcentage'
export const interactifReady = true

export const uuid = 'e37gg'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q10 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, p?: number) {
    if (a == null || p == null) {
      a = randint(1, 9) * 10
      p = randint(2, 9, 5) * 10
    }

    const reponse = new Decimal(a * p).div(100)

    this.question = `$${p}\\,\\%$ de $${a}$`
    this.correction = `Prendre $${p}\\,\\%$ de $${a}$ revient à prendre $${texNombre(p / 10, 0)}\\times 10\\,\\%$ de $${a}$.<br>
Comme $10\\,\\%$ de $${a}$ vaut $${a / 10}$ (pour prendre $10\\,\\%$ d'une quantité, on la divise par $10$), alors
$${p}\\,\\%$ de $${a}=${texNombre(p / 10, 0)}\\times ${texNombre(a / 10, 0)}=${miseEnEvidence(texNombre(reponse, 0))}$.`
    this.reponse = reponse

    if (this.interactif) {
      this.question += ' $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(50, 40)
    else this.enonce()
  }
}
