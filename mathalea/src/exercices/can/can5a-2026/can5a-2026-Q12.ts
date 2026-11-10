import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'

export const titre = 'Multiplier un nombre décimal par $0{,}2$'
export const interactifReady = true

export const uuid = 'hbp7h'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q12 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  enonce(a?: number) {
    if (a == null) {
      // Génère un nombre décimal de 1,5 à 9,5 par pas de 0,5
      // Soit : 1,5 / 2,5 / 3,5 / 4,5 / 5,5 / 6,5 / 7,5 / 8,5 / 9,5
      const valeurs = [1.5, 2.5, 3.5, 5.5, 6.5, 7.5, 8.5, 9.5]
      a = choice(valeurs)
    }

    const aDecimal = new Decimal(a)
    const resultat = aDecimal.times(0.2)

    this.reponse = resultat.toNumber()
    this.question = `$${texNombre(a, 1)} \\times 0,2$`

    this.correction = `Multiplier par $0,2$ revient à multiplier par $\\dfrac{1}{5}$, c'est-à-dire à diviser par $5$. <br>
    En effet, $0,2 = \\dfrac{2}{10} = \\dfrac{1}{5}$.<br>
    $${texNombre(a, 1)} \\times 0,2 = ${miseEnEvidence(texNombre(resultat.toNumber(), 2))}$`

    if (this.interactif) {
      this.question += ' $=$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(4.5)
    else this.enonce()
  }
}
