import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Calculer la probabilité d'une intersection d'événements indépendants"
export const interactifReady = true

export const uuid = '4b3b4'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q14 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = true
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 0.4 : randint(1, 9) / 10
    const b = this.canOfficielle ? 0.6 : randint(1, 9) / 10
    const pAinterB = a * b
    this.reponse = texNombre(pAinterB, 2)
    this.question = `$A$ et $B$ sont des événements indépendants tels que $P(A)=${texNombre(a, 1)}$ et $P(B)=${texNombre(b, 1)}$.
`

    this.correction = ` Comme $A$ et $B$ sont des événements indépendants,  $P(A\\cap B)=P(A)\\times  P(B)$.<br>
Ainsi, <br>
$\\begin{aligned}
P(A\\cap B)&=${texNombre(a, 1)} \\times ${texNombre(b, 1)}\\\\
P(A\\cap B)&=${miseEnEvidence(this.reponse)}
\\end{aligned}$
  `

    this.canEnonce = `$A$ et $B$ sont des événements indépendants tels que $P(A)=${texNombre(a, 1)}$ et $P(B)=${texNombre(b, 1)}$.`
    this.canReponseACompleter = '$P(A\\cap B)=\\ldots$'
    if (!this.interactif) {
      this.question += '<br> $P(A\\cap B)=\\ldots$.'
    } else {
      this.question += '<br>$P(A\\cap B)=$'
    }
  }
}
