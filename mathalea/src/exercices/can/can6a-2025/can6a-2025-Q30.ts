import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer le reste dans une division euclidienne'
export const interactifReady = true

export const uuid = '6efd8'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025N6Q30 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: '.' }
  }

  nouvelleVersion() {
    const a = 5
    const b = this.canOfficielle ? 3 : randint(1, 4)
    const c = this.canOfficielle ? 16 : randint(11, 19)
    const d = c * a + b
    this.question = `Complète.<br>
      Le reste de la division de $${d}$ par $${a}$ est `
    if (!this.interactif) {
      this.question += '$\\ldots$'
    }
    this.correction = `Le plus grand multiple de $${a}$ inférieur à $${d}$ est $${a * c}$  et $${d}=${a * c} + ${b}$ donc le reste de la division de $${d}$ par $${a}$ est $${miseEnEvidence(b)}$.`

    this.reponse = b
    this.canEnonce = 'Complète.'
    this.canReponseACompleter = `Le reste de la division  de $${d}$ par $${a}$ est $\\ldots$`
  }
}
