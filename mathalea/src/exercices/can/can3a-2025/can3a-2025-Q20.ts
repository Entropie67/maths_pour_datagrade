import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une probabilité'
export const interactifReady = true

export const uuid = '8ef85'
export const refs = {
  'fr-fr': [''],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalcuProbabilite extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.canOfficielle = true
    this.optionsChampTexte = { texteApres: '.' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 13 : randint(2, 15)
    const b = this.canOfficielle ? 6 : randint(2, 8)
    this.reponse = new FractionEtendue(a, a + b).texFraction
    this.question = `Un sac contient $${a}$ billes rouges et $${b}$ billes noires. <br>
       La probabilité de tirer une bille rouge est : `

    this.correction = `Il y a $${a}$ billes rouges sur un total de $${a + b}$ billes. <br>
        La probabilité de tirer une bille rouge est donc  $${miseEnEvidence(this.reponse)}${new FractionEtendue(a, a + b).texSimplificationAvecEtapes()}$.`
    if (!this.interactif) {
      this.question += '$\\ldots$'
    }
  }
}
