import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  'Calculer le produit d’un nombre décimal par une puissance de 10'
export const interactifReady = true

export const uuid = 'ik5p1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q2 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  enonce(facteurs10?: string, puissance?: number, a?: Decimal) {
    if (facteurs10 == null || puissance == null || a == null) {
      const choix: [string, number] = choice([
        ['10 \\times 10', 2],
        ['10 \\times 10 \\times 10', 3],
      ])
      facteurs10 = choix[0]
      puissance = choix[1]

      const choixDecimal: [number, number] = choice([
        [randint(1, 9), randint(1, 9)], // 2 chiffres après la virgule
        [randint(1, 9), 0], // 1 chiffre après la virgule
      ])
      a = new Decimal(randint(1, 9) * 10 + choixDecimal[0])
        .div(100)
        .add(new Decimal(choixDecimal[1]).div(1000))
    }

    this.reponse = texNombre(a.mul(Math.pow(10, puissance)), 3)
    this.question = `$${facteurs10} \\times ${texNombre(a, 3)}$`
    this.correction = `$\\underbrace{${facteurs10}}_{${texNombre(10 ** puissance)}}\\times ${texNombre(a, 3)} = ${miseEnEvidence(this.reponse)}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce('10 \\times 10 \\times 10', 3, new Decimal(0.54))
    else this.enonce()
  }
}
