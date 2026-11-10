import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre = 'Appliquer un pourcentage'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Stéphane Guyon
 */
export const uuid = 'a66ad'

export const refs = {
  'fr-fr': ['2I11-4', 'BP2SP11', 'BP1SP15'],
  'fr-ch': [],
}
export default class Proportion extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 3

    // this.optionsChampTexte = { texteApres: ' €' }
  }

  nouvelleVersion() {
    const b = randint(3, 80) /* Pourcentage */
    const a = randint(10, 100) /* Valeur */
    this.question = `Calculer  $${b}\\,\\%$ de $${a}$. `
    this.correction = `Calculer $p\\,\\%$ d'un nombre, c'est multiplier ce nombre par $\\dfrac{p}{100}$.<br>
    Ainsi, $${b}\\,\\%$  de $${a}$ est égal à $${texNombre(b / 100)}\\times ${a}=${miseEnEvidence(texNombre((b * a) / 100))}$.`
    this.reponse = ((a * b) / 100).toFixed(2)
  }
}
