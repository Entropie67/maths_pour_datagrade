import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
export const titre = "Prendre 10 \\% d'une quantité"
export const interactifReady = true

export const uuid = 'zv53r'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter + Gilles Mora
 */
export default class CalculsPourcentages2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: ' $=$' }
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const a = new Decimal(annee).div(
      this.canOfficielle ? 10 : this.quotaChoice('diviseur', [10, 100, 1000]),
    )
    this.reponse = texNombre(new Decimal(a).div(10), 5)
    this.question = `$10\\,\\%$ de $${texNombre(a, 4)}$`
    this.correction = `Prendre $10\\,\\%$ d'une quantité revient à la diviser par $10$.<br>
      Ainsi, $10\\,\\%$ de $${texNombre(a, 4)}=${texNombre(a, 4)} \\div 10 = ${miseEnEvidence(this.reponse)}$.`
  }
}
