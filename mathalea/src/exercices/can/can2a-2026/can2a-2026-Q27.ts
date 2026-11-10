import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer une puissance d'un radical"
export const interactifReady = true

export const uuid = 'kl3uc'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q27 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: ' $=$' }
  }

  enonce(a?: number, n?: number): void {
    if (a == null || n == null) {
      // Cas prédéfinis : [a, n] où le résultat est simple
      const listeCas: [number, number][] = [
        // Puissance 4
        [2, 4], // (√2)⁴ = 4
        [3, 4], // (√3)⁴ = 9
        [5, 4], // (√5)⁴ = 25
        [7, 4], // (√7)⁴ = 49
        [10, 4], // (√10)⁴ = 100
        [11, 4], // (√11)⁴ = 121
        // Puissance 6 (résultats simples)
        [2, 6], // (√2)⁶ = 8
        [3, 6], // (√3)⁶ = 27
        [5, 6], // (√5)⁶ = 125
      ]

      const cas = choice(listeCas)
      a = cas[0]
      n = cas[1]
    }

    // (√a)^n = a^(n/2)
    const exposant = n / 2
    const resultat = a ** exposant

    this.reponse = resultat.toString()

    this.question = `$\\left(\\sqrt{${a}}\\right)^{${n}}$`

    this.correction = `$\\left(\\sqrt{${a}}\\right)^{${n}}=\\left((\\sqrt{${a}})^{2}\\right)^{${texNombre(n / 2, 0)}}=${a}^{${texNombre(n / 2, 0)}}=${miseEnEvidence(resultat)}$`

    this.canEnonce = `$\\left(\\sqrt{${a}}\\right)^{${n}}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(7, 4)
    else this.enonce()
  }
}
