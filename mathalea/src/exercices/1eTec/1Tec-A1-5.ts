import { miseEnEvidence } from '../../lib/outils/embellissements'
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const titre = 'Travailler sur les proportions'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
* Modèle d'exercice très simple pour la course aux nombres
* @author Stéphane Guyon

* Date de publication
*/
export const uuid = 'c7270'

export const refs = {
  'fr-fr': ['2I11-6'],
  'fr-ch': [],
}
export default class Proportion extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const b = choice([2, 3, 4, 6, 8, 9]) /* Numérateur fraction */
    const c = choice([5, 7, 11, 13]) /* Dénominateur fraction */
    const d = randint(4, 11) /* Multiple */
    const a = c * d
    this.question = `Calculer  $\\dfrac{${b}}{${c}}$ de $${a}$.  <br> `
    this.correction = `Calculer la fraction d'un nombre, c'est multiplier la fraction par ce nombre.
<br><br>    Ainsi, $\\dfrac{${b}}{${c}}$  de $${a}$ est égal à $\\dfrac{${b}}{${c}}\\times ${a}=\\dfrac{${b}\\times${a}}{${c}}=\\dfrac{${b}\\times${c}\\times${d}}{${c}}=${miseEnEvidence(texNombre(b * d))}$.`
    this.reponse = d * b
  }
}
