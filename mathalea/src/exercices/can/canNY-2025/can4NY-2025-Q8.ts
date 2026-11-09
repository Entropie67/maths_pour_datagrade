import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
export const titre = 'Calculer avec des parenthèses'
export const interactifReady = true

export const uuid = '86cb7'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter+  Gilles Mora
 */
export default class CalculParentheses extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 12) * 2 + 1

    this.reponse = texNombre(new Decimal(2025).sub(a).div(2), 0)
    this.question = `Calculer, sous forme décimale, $(${texNombre(2025, 0)}-${a})\\times 0,5$.`
    this.correction = `Multiplier par $0,5$ revient à prendre la moitié.<br>
      Ainsi, $(${texNombre(2025, 0)}-${a})\\times 0,5=\\dfrac{${new Decimal(2025).sub(a)}}{2}=${miseEnEvidence(this.reponse)}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
