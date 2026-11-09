import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer 20 % d'un nombre"
export const interactifReady = true

export const uuid = 'edyz7'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q4 extends ExerciceCan {
  enonce(a?: number) {
    if (a == null) {
      a = choice([randint(1, 4) * 100 + 50, randint(1, 8) * 10])
    }
    const dixPourcent = a / 10
    const resultat = dixPourcent * 2

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.reponse = texNombre(resultat)
    this.question = `$20\\,\\%$ de $${a}$`
    this.correction = `$20\\,\\%$ de $${a} = ${miseEnEvidence(texNombre(resultat))}$`
    this.correction += `<br>$10\\,\\%$ de $${a}$ est égal à $${a}\\div 10 =${texNombre(dixPourcent)}$.<br>
      Ainsi, $20\\,\\%$ de $${a}$ est égal à $${texNombre(dixPourcent)}\\times 2 =${texNombre(resultat)}$.
   `

    if (this.interactif) {
      this.question += ' $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(150)
    else this.enonce()
  }
}
