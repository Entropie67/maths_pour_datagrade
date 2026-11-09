import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Calculer une moyenne'
export const interactifReady = true

export const uuid = 'kv0x8'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q18 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '.' }
  }

  enonce(a?: number, b?: number, c?: number, d?: number) {
    if (a == null || b == null || c == null || d == null) {
      // Configurations avec moyenne entière
      // [a, b, c, d] où la somme est divisible par 4
      const listeCas = [
        [4, 9, 11, 12], // Somme = 36, Moyenne = 9
        [3, 7, 10, 12], // Somme = 32, Moyenne = 8
        [5, 8, 9, 14], // Somme = 36, Moyenne = 9
        [2, 6, 11, 13], // Somme = 32, Moyenne = 8
        [4, 7, 12, 13], // Somme = 36, Moyenne = 9
        [3, 9, 10, 14], // Somme = 36, Moyenne = 9
        [5, 7, 8, 12], // Somme = 32, Moyenne = 8
        [2, 8, 11, 15], // Somme = 36, Moyenne = 9
        [6, 7, 9, 14], // Somme = 36, Moyenne = 9
        [4, 6, 10, 12], // Somme = 32, Moyenne = 8
      ]
      const cas = choice(listeCas)
      a = cas[0]
      b = cas[1]
      c = cas[2]
      d = cas[3]
    }

    const somme = a + b + c + d
    const moyenne = somme / 4

    this.question = `$${a}$ ${sp(2)} ; ${sp(2)} $${b}$ ${sp(2)} ; ${sp(2)} $${c}$ ${sp(2)} ; ${sp(2)} $${d}$<br>
La moyenne de ces nombres est :`

    this.correction = `La somme des $4$ nombres est  $${a}+${b}+${c}+${d}=${somme}$.<br>
La moyenne est donc : $\\dfrac{${somme}}{4}=${miseEnEvidence(texNombre(moyenne, 0))}$.`

    this.reponse = moyenne
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4, 9, 11, 12)
    else this.enonce()
  }
}
