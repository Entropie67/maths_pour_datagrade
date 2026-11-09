import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Diviser par un décimal'
export const interactifReady = true

export const uuid = 'ajc3q'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ11 extends ExerciceCan {
  enonce(a?: number, diviseur?: Decimal): void {
    if (a == null || diviseur == null) {
      a = randint(2, 99)
      diviseur = new Decimal(choice([0.1, 0.01]))
    }

    const resultat = new Decimal(a).div(diviseur)

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = texNombre(resultat, 4)
    this.question = `$${a}\\div ${texNombre(diviseur, 2)}=$`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `Diviser par $${texNombre(diviseur, 2)}$, c'est multiplier par $${texNombre(new Decimal(1).div(diviseur), 0)}$.<br>
    $${a}\\div ${texNombre(diviseur, 2)}=${a}\\times ${texNombre(new Decimal(1).div(diviseur), 0)}=${miseEnEvidence(texNombre(resultat, 4))}$`
    this.canEnonce = `$${a}\\div ${texNombre(diviseur, 2)}=$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(45, new Decimal(0.1))
    else this.enonce()
  }
}
