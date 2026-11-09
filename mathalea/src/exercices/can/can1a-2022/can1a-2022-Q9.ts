import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer une moyenne'
export const interactifReady = true

export const uuid = 'mgrqz'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2022Q9 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number, b?: number, c?: number, d?: number) {
    if (a == null || b == null || c == null || d == null) {
      if (choice([true, false])) {
        const somme = choice([20, 40, 60])
        a = randint(1, 9)
        b = randint(1, 9)
        c = somme / 2 - a
        d = somme / 2 - b
      } else {
        const somme = choice([60, 80, 90, 100, 120])
        a = randint(1, 29)
        b = randint(1, 29)
        c = somme / 2 - a
        d = somme / 2 - b
      }
    }

    const somme = a + b + c + d
    const reponse = somme / 4

    this.question = `Calculer la moyenne de :
$${a}${sp(3)}; ${sp(3)}${b}${sp(3)}; ${sp(3)}${c}${sp(3)}; ${sp(3)}${d}$.`
    this.correction = `La moyenne est donnée par : $\\dfrac{${a}+${b}+${c}+${d}}{4}=\\dfrac{${somme}}{4}=${miseEnEvidence(reponse)}$.`
    this.reponse = reponse
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(37, 18, 43, 2)
    else this.enonce()
  }
}
