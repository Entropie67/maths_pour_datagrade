import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Donner l'écriture décimale d'une fraction"
export const interactifReady = true

export const uuid = '221a5'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: ' : ' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    let reponse: number
    if (this.canOfficielle) {
      reponse = 1.25
      this.question = 'Écriture décimale de $\\dfrac{5}{4}$'
      this.correction = `On décompose la  fraction : <br>
      $\\begin{aligned}
      \\dfrac{5}{4}&=\\dfrac{4}{4}+\\dfrac{1}{4}\\\\
      &=1+\\dfrac{1}{4}\\\\
      &=${miseEnEvidence(texNombre(reponse, 2))}
      \\end{aligned}$`
    } else {
      if (choice([true, false])) {
        const b = choice([1, 3, 4, 7, 9, 11])
        const maFraction = new FractionEtendue(b, 5)
        reponse = b / 5
        this.question = `Écriture décimale de  $${maFraction.texFraction}$ `
        this.correction = `$${maFraction.texFraction}=${miseEnEvidence(texNombre(reponse, 2))}$`
      } else {
        const b = choice([1, 3, 7, 9, 11])
        const maFraction = new FractionEtendue(b, 4)
        reponse = b / 4
        this.question = `Écriture décimale de   $${maFraction.texFraction}$ `
        this.correction = `$${maFraction.texFraction}=${miseEnEvidence(texNombre(reponse, 2))}$`
      }
    }
    this.reponse = reponse.toFixed(2)
  }
}
