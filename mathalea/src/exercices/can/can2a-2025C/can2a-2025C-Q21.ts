import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Q21'
export const interactifReady = true

export const uuid = 'cmh6o'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ21 extends ExerciceCan {
  enonce(valeurs?: number[]): void {
    if (valeurs == null) {
      // On génère 5 nombres dont la somme est divisible par 5
      let somme: number
      do {
        valeurs = [
          randint(8, 20),
          randint(8, 20),
          randint(8, 20),
          randint(8, 20),
          randint(8, 20),
        ]
        somme = valeurs.reduce((s, v) => s + v, 0)
      } while (somme % 5 !== 0)
    }

    const somme = valeurs.reduce((s, v) => s + v, 0)
    const moyenne = somme / 5

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(moyenne)
    this.question = `Calculer la moyenne de :<br>$${valeurs.join(' ; ')}$<br>`
    if (!this.interactif) {
      this.question += '$\\ldots$'
    }
    this.correction = `Moyenne $=\\dfrac{${valeurs.join('+')}}{5}=\\dfrac{${somme}}{5}=${miseEnEvidence(String(moyenne))}$`
    this.canEnonce = `Calculer la moyenne de : $${valeurs.join(' - ')}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce([12, 18, 14, 15, 11])
    else this.enonce()
  }
}
