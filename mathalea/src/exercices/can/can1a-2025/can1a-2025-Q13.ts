import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une moyenne'
export const interactifReady = true

export const uuid = '9b711'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q13 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 7 : randint(4, 8)
    const b = this.canOfficielle ? 11 : randint(9, 13)
    const c = 20 - a
    const d = this.canOfficielle ? 9 : choice([40, 44, 48]) - a - b - c
    const moy = (a + b + c + d) / 4
    this.reponse = d
    this.question = `La moyenne de $${a}$, $${b}$, $${c}$ et d'un nombre inconnu $n$ est égale à $${moy}$.<br>`
    if (this.interactif) {
      this.question += '$n=$'
    } else {
      this.question += '$n=\\ldots$'
    }
    this.correction = `Puisque la moyenne de ces quatre nombres est $${moy}$, la somme de ces quatre nombres est $4\\times ${moy}=${4 * moy}$.<br>
             La valeur de $n$ est donnée par :  $${4 * moy}-${a}-${b}-${c}=${miseEnEvidence(texNombre(this.reponse))}$.`

    this.canEnonce = `La moyenne de $${a}$, $${b}$, $${c}$ et d'un nombre inconnu $n$ est égale à $${moy}$.`
    this.canReponseACompleter = '$n=\\ldots$'
  }
}
