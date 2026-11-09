import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Factoriser une différence de deux carrés'
export const interactifReady = true

export const uuid = 'bs86d'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q24 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsDeComparaison = { exclusifFactorisation: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(a?: number, b?: number, choix?: string) {
    if (a == null || b == null || choix == null) {
      a = randint(1, 2)
      b = randint(2, 10)
      choix = choice(['a', 'b'])
    }

    if (choix === 'a') {
      this.question = `Factoriser $${rienSi1(a ** 2)}x^2-${b ** 2}$.`
      this.correction = `On reconnaît une différence de deux carrés : $a^2-b^2$ avec $a=${rienSi1(a)}x$ et $b=${b}$.<br>
Comme $a^2-b^2=(a-b)(a+b)$, alors $${rienSi1(a ** 2)}x^2-${b ** 2}=${miseEnEvidence('(' + rienSi1(a) + 'x-' + b + ')(' + rienSi1(a) + 'x+' + b + ')')}$.`
      this.reponse = [
        `(${rienSi1(a)}x-${b})(${rienSi1(a)}x+${b})`,
        `(${rienSi1(a)}x+${b})(${rienSi1(a)}x-${b})`,
      ]
    } else {
      this.question = `Factoriser $${b ** 2}-${rienSi1(a ** 2)}x^2$.`
      this.correction = `On reconnaît une différence de deux carrés : $a^2-b^2$ avec $a=${b}$ et $b=${rienSi1(a)}x$.<br>
Comme $a^2-b^2=(a-b)(a+b)$, alors  $${b ** 2}-${rienSi1(a ** 2)}x^2=${miseEnEvidence('(' + b + '-' + rienSi1(a) + 'x)(' + b + '+' + rienSi1(a) + 'x)')}$.`
      this.reponse = [
        `(${b}-${rienSi1(a)}x)(${b}+${rienSi1(a)}x)`,
        `(${b}+${rienSi1(a)}x)(${b}-${rienSi1(a)}x)`,
      ]
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, 11, 'a')
    else this.enonce()
  }
}
