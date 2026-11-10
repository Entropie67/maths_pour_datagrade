import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Décomposer une fraction'
export const interactifReady = true

export const uuid = '40cd8'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class FractionAvecPi extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.formatInteractif = 'mathlive'
  }

  nouvelleVersion() {
    const listeValeurs = this.canOfficielle
      ? [[2, 5, 6]]
      : [
          [2, 2, 5],
          [3, 5, 6],
          [5, 2, 3],
          [2, 3, 5],
          [4, 2, 3],
          [2, 6, 7],
          [2, 5, 7],
          [2, 4, 7],
          [2, 3, 7],
        ] //
    const val = choice(listeValeurs)
    const nbrepi = val[0]
    const num = val[1]
    const den = val[2]

    this.question = `Compléter.<br>
      $\\dfrac{${nbrepi * den + num}\\pi}{${den}}=${nbrepi}\\pi+$ `
    this.reponse = { reponse: { value: `\\dfrac{${num}\\pi}{${den}}` } }
    this.correction = `$\\begin{aligned}
      \\dfrac{${nbrepi * den + num}\\pi}{${den}}&=\\dfrac{${nbrepi * den}\\pi}{${den}}+\\dfrac{${num}\\pi}{${den}}\\\\
      &=${nbrepi}\\pi+${miseEnEvidence(`\\dfrac{${num}\\pi}{${den}}`)}
      \\end{aligned}$`

    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.canEnonce = 'Compléter.'
  }
}
