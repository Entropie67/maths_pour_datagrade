import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Calculer la diagonale d'un carré connaissant son aire"
export const interactifReady = true

export const uuid = 'sueni'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ25 extends ExerciceCan {
  enonce(aire?: number): void {
    if (aire == null) {
      // aire = c², on choisit c² parmi des carrés parfaits
      aire = choice([4, 9, 16, 25, 36, 49, 64])
    }

    // c = √aire, diagonale = c√2, donc d² = 2c² = 2×aire, d = √(2×aire)
    const deuxAire = 2 * aire

    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.reponse = `\\sqrt{${deuxAire}}`

    this.question = `L'aire d'un carré est de $${aire}$ cm$^2$.<br>
    Quelle est la longueur de la diagonale de ce carré ?`
    if (this.interactif) {
      this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' cm' }
    } else {
      this.question += '<br>$\\ldots$ cm'
    }

    this.correction = `Le côté $c$ du carré vérifie $c^2=${aire}$.<br>
    En utilisant le théorème de Pythagore, la diagonale $d$ du carré vérifie : <br>
     $\\begin{aligned}
     d^2&=c^2+c^2\\\\
     d^2&=2c^2\\\\
     d^2&=2\\times ${aire}\\\\
    d^2 &=${deuxAire}\\\\
     d&=${miseEnEvidence(`\\sqrt{${deuxAire}}`)}
     \\end{aligned}$`

    this.canReponseACompleter = '$\\ldots$ cm'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(25)
    else this.enonce()
  }
}
