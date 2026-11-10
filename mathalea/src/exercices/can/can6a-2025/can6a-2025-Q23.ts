import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un rendu de monnaie'
export const interactifReady = true

export const uuid = '06732'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['PR-11'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025N6Q23 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: '€' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle
      ? 69
      : randint(15, 89, [20, 30, 40, 50, 60, 70, 80])
    const b = this.canOfficielle ? 1 : randint(1, 2)
    this.reponse = texNombre(b - a / 100, 2)
    this.question = `Je dois payer $${a}$ centimes. Je paie avec une pièce de $${b}$ €.<br>
    On me rend `
    if (!this.interactif) {
      this.question += '$\\ldots$ €.'
    }

    this.correction = `$${b}$ € est égal à $${b * 100}$ centimes d'euros.<br>
    $${b * 100}-${a}=${b * 100 - a}$<br>
    On me rend $${b * 100 - a}$ centimes d'euros, soit $${miseEnEvidence(texNombre(b - a / 100, 2))}$ €.`

    this.canEnonce = `Je dois payer $${a}$ centimes. Je paie avec une pièce de $${b}$ €.`
    this.canReponseACompleter = 'On me rend $\\ldots$ €.'
  }
}
