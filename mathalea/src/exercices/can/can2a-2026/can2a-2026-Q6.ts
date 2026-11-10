import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'

import { choice } from '../../../lib/outils/arrayOutils'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Calculer la somme d’une fraction et d’un nombre décimal'
export const interactifReady = true

export const uuid = 'qo4f0'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q6 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(denominateur?: number, decimal?: number): void {
    if (denominateur == null || decimal == null) {
      denominateur = choice([4, 5])
      decimal = choice([0.15, 0.2, 0.25, 0.35, 0.45, 0.65])
    }

    const fraction = new FractionEtendue(1, denominateur)
    const decimalFraction = fraction.valeurDecimale
    const resultat = decimalFraction + decimal

    this.reponse = texNombre(resultat, 2)
    this.question = `Écriture décimale de : $${fraction.texFraction}+${texNombre(decimal, 2)}$`
    this.correction = `$${fraction.texFraction}+${texNombre(decimal, 2)}=${texNombre(decimalFraction, 2)}+${texNombre(decimal, 2)}=${miseEnEvidence(texNombre(resultat, 2))}$`
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(4, 0.15)
    else this.enonce()
  }
}
