import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Faire un calcul avec une priporité de calcul'
export const interactifReady = true

export const uuid = '2kynk'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q2 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      b = randint(2, 6)
      a = b + 10
      c = randint(2, 7)
    }

    const resultat = a - b * c

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = texNombre(resultat, 0)
    this.question = `$${a}-${b}\\times ${c}$`
    this.correction = `La multiplication est prioritaire : <br>$${a}-${b}\\times ${c}=${a}-${b * c}=${miseEnEvidence(texNombre(resultat, 0))}$.`

    if (this.interactif) {
      this.question += ' $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(12, 2, 5)
    else this.enonce()
  }
}
