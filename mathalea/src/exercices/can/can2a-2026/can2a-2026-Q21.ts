import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer l'écriture scientifique d'un nombre décimal"
export const interactifReady = true

export const uuid = '2yrmx'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q21 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = { ecritureScientifique: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(mantisse?: Decimal, puissance?: number): void {
    if (mantisse == null || puissance == null) {
      // Générer un nombre avec deux chiffres significatifs différents de 0
      const chiffre1 = randint(1, 9)
      const chiffre2 = randint(1, 9, chiffre1)
      mantisse = new Decimal(chiffre1 + chiffre2 / 10)
      puissance = -randint(3, 5)
    }

    const nombre = mantisse.mul(new Decimal(10).pow(puissance))

    this.reponse = {
      reponse: {
        value: `${stringNombre(mantisse)}\\times 10^{${puissance}}`,
        options: { ecritureScientifique: true },
      },
    }

    this.question = `Écriture scientifique de $${texNombre(nombre, 6)}$`

    this.correction = `La notation scientifique est de la forme $a\\times 10^{n}$ avec $1\\leqslant a <10$ et $n$ un entier relatif.<br>
    Ici : $${texNombre(nombre, 6)}=${miseEnEvidence(`${texNombre(mantisse, 2)}\\times 10^{${puissance}}`)}$ avec $1\\leqslant ${texNombre(mantisse, 2)} <10$.`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(new Decimal(2.6), -4)
    else this.enonce()
  }
}
