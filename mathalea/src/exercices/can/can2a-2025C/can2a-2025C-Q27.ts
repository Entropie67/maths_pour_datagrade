import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer une probabilité à partir d'une égalité"
export const interactifReady = true

export const uuid = '1m91p'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ27 extends ExerciceCan {
  enonce(nbBleues?: number, p?: number, q?: number): void {
    if (nbBleues == null || p == null || q == null) {
      // P(bleue) = nbBleues / (nbBleues + x) = 1/q
      p = 1
      q = choice([3, 4, 5, 6])
      // nbBleues doit être multiple de p = 1, donc n'importe quel entier
      nbBleues = randint(2, 6)
    }

    const x = (nbBleues * (q - p)) / p

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.reponse = String(x)

    this.question = `${nbBleues === 4 ? 'Quatre' : nbBleues === 3 ? 'Trois' : nbBleues === 2 ? 'Deux' : nbBleues === 5 ? 'Cinq' : nbBleues === 1 ? 'Une' : `$${nbBleues}$`} boule${nbBleues > 1 ? 's' : ''} bleue${nbBleues > 1 ? 's' : ''} et $x$ boules rouges se trouvent dans une urne.<br>
    On tire une boule de l'urne.<br>
    Quelle doit être la valeur de $x$ pour que la probabilité d'avoir une boule bleue soit égale à $\\dfrac{${p}}{${q}}$ ?<br>`
    if (this.interactif) {
      this.question += '$x=$'
    } else {
      this.question += '$x=\\ldots$'
    }

    this.correction = `La probabilité d'obtenir une boule bleue est $\\dfrac{${nbBleues}}{${nbBleues}+x}=\\dfrac{${p}}{${q}}$ ou encore 
    $\\dfrac{${nbBleues}}{${nbBleues}+x}=\\dfrac{${nbBleues}}{${nbBleues * q}}$.<br>
    Donc $${nbBleues}+x=${(nbBleues * q) / p}$, soit $x=${(nbBleues * q) / p}-${nbBleues}=${miseEnEvidence(String(x))}$.`

    this.canEnonce = `${nbBleues === 4 ? 'Quatre' : nbBleues === 3 ? 'Trois' : nbBleues === 2 ? 'Deux' : nbBleues === 5 ? 'Cinq' : nbBleues === 1 ? 'Une' : `$${nbBleues}$`} boule${nbBleues > 1 ? 's' : ''} bleue${nbBleues > 1 ? 's' : ''} et $x$ boules rouges se trouvent dans une urne. On tire une boule. Quelle doit être la valeur de $x$ pour que la probabilité d'avoir une boule bleue soit égale à $\\dfrac{${p}}{${q}}$ ?`
    this.canReponseACompleter = '$x=\\ldots$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(4, 1, 3)
    else this.enonce()
  }
}
