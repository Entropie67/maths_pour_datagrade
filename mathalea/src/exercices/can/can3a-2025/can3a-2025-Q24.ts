import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver le reste par une division euclidienne'
export const interactifReady = true

export const uuid = '1e3d7'
export const refs = {
  'fr-fr': [''],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class ResteDivisioEuclidienne extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 11 : choice([9, 12, 13])
    const b = this.canOfficielle ? 4 : randint(5, a - 1)
    const c = this.canOfficielle ? 6 : randint(3, 6)
    const d = c * a + b
    this.question = `Le reste de la division euclidienne de $${d}$ par $${a}$`
    this.correction = `$${d}=${a} \\times ${c} + ${b}$ avec $${b}<${a}$ donc le reste de la division de $${d}$ par $${a}$ est $${miseEnEvidence(b)}$.`

    this.reponse = b
  }
}
