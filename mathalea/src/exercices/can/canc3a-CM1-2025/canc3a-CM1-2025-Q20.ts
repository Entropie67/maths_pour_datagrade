import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer le tiers d'une quantité"
export const interactifReady = true

export const uuid = 'd5e47'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM1Q20 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: 'œufs.' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 12 : randint(2, 7) * 3
    this.reponse = texNombre(a / 3, 0)
    this.question = `Le tiers de $${a}$ œufs est `
    if (!this.interactif) {
      this.question += '$\\ldots$ œufs.'
    }
    this.correction = `Pour prendre le tiers d'un nombre, on le divise par $3$.<br>
     $${a}\\div 3 = ${miseEnEvidence(texNombre(a / 3, 0))}$ œufs.`

    this.canReponseACompleter = '$\\ldots$ œufs.'
  }
}
