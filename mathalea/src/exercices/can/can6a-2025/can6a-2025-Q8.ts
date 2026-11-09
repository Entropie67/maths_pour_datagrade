import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer avec une proportionnalité'
export const interactifReady = true

export const uuid = '99c51'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N62Q8 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteApres: 'g.' }
  }

  nouvelleVersion() {
    const unit = this.canOfficielle ? 5 : randint(3, 6)
    const a = this.canOfficielle ? 2 : randint(2, 5)
    const b = this.canOfficielle ? 8 : randint(5, 7, a)

    this.reponse = b * unit
    this.question = `$${a}$ morceaux de sucre pèsent $${a * unit}$ g.<br>
      $${b}$ morceaux de sucre pèsent `
    this.correction = `$${a}$ morceaux de sucre pèsent $${a * unit}$ g, donc $1$ morceau de sucre pèse $${unit}$ g.<br>
      Donc $${b}$ morceaux de sucre pèsent $${b}\\times${unit}$ g $=${miseEnEvidence(texNombre(this.reponse, 0))}$ g.`

    if (!this.interactif) {
      this.question += '$\\ldots$ g.'
    }
    this.canEnonce = `$${a}$ morceaux de sucre pèsent $${a * unit}$ g.`
    this.canReponseACompleter = `$${b}$ morceaux de sucre pèsent $\\ldots$ g.`
  }
}
