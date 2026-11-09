import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer le produit d'un entier avec un décimal"
export const interactifReady = true

export const uuid = '8c554'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025N6Q28 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '$=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 3 : randint(3, 9)
    const b = this.canOfficielle ? 0.8 : randint(6, 9) / 10
    this.reponse = texNombre(a * b, 1)
    this.question = `$${a}\\times ${texNombre(b, 1)}$ `

    this.correction = ` $${a}\\times ${texNombre(b, 1)}=${miseEnEvidence(texNombre(a * b, 1))}$`
  }
}
