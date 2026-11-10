import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Multiplier un entier avec un décimal'
export const interactifReady = true

export const uuid = 'yun7t'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q10 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  enonce(taux?: number, nombre?: number): void {
    if (taux == null || nombre == null) {
      taux = choice([20, 30, 40, 60, 70])
      nombre = randint(2, 9) * 10 // Nombres de 20 à 90 se terminant par 0
    }

    const resultat = new Decimal(nombre).mul(taux).div(100)

    this.reponse = texNombre(resultat, 2)
    this.question = `$${taux}\\,\\%$ de $${nombre}$`
    this.correction = `$${taux}\\,\\%$ de $${nombre}=${texNombre(taux / 100, 1)}\\times ${nombre}=${miseEnEvidence(texNombre(resultat, 2))}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(20, 50)
    else this.enonce()
  }
}
