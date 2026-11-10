import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un rendu de monnaie'
export const interactifReady = true

export const uuid = '4c0a8'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM2Q23 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: '€.' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle
      ? 4.25
      : randint(1, 4) + choice([25, 50, 75]) / 100

    this.reponse = texNombre(5 - a, 2)
    this.question = `Je dois payer $${texNombre(a, 2, true)}$ €. Je paie avec un billet de $5$ euros.<br>
      On me rend `
    if (!this.interactif) {
      this.question += '$\\ldots$ €.'
    }

    this.correction = `
      $5-${texNombre(a, 2, true)}=${texNombre(5 - a, 2, true)}$<br>
      On me rend $${miseEnEvidence(texNombre(5 - a, 2, true))}$ €.`

    this.canEnonce = `Je dois payer $${texNombre(a, 2, true)}$ €. Je paie avec un billet de $5$ euros.`
    this.canReponseACompleter = 'On me rend $\\ldots$ €.'
  }
}
