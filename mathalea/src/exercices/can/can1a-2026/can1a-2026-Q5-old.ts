import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer l'étendue d'une série de nombres"
export const interactifReady = true

export const uuid = 'tg7vt'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q5 extends ExerciceCan {
  enonce(valeurs?: number[]) {
    if (valeurs == null) {
      const min = randint(2, 8)
      const max = randint(min + 8, min + 15)
      const val3 = randint(min + 1, max - 1)
      const val4 = randint(min + 1, max - 1)
      const val5 = randint(min + 1, max - 1)
      const val6 = randint(min + 1, max - 1)
      valeurs = shuffle([min, max, val3, val4, val5, val6])
    }

    const min = Math.min(...valeurs)
    const max = Math.max(...valeurs)
    const etendue = max - min

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = etendue
    this.question = 'Étendue de la série :<br>'
    this.question += `$${valeurs[0]}$${sp(1)};${sp(1)}$${valeurs[1]}$${sp(1)};${sp(1)}$${valeurs[2]}$${sp(1)};${sp(1)}$${valeurs[3]}$${sp(1)};${sp(1)}$${valeurs[4]}$${sp(1)};${sp(1)}$${valeurs[5]}$`
    this.correction = `La plus grande valeur de la série est $${max}$ et la plus petite est $${min}$.<br>
      L'étendue de la série est $${max}-${min}=${miseEnEvidence(etendue)}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce([8, 15, 10, 17, 9, 6])
    else this.enonce()
  }
}
