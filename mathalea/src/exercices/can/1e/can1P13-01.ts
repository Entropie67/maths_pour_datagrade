import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Calculer une probabilité avec des événements indépendants'
export const interactifReady = true

export const dateDePublication = '13/04/2024'
export const uuid = 'f3d16'
export const refs = {
  'fr-fr': ['can1P13-01'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class esperance extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = new Decimal(this.quotaRandint('a', 1, 9)).div(10)
    const b = new Decimal(this.quotaRandint('b', 1, 9)).div(10)
    const pAinterB = a.mul(b)
    switch (
      this.quotaChoice('cas', [1, 2]) //, 2, 3
    ) {
      case 1:
        this.reponse = texNombre(pAinterB, 2)
        this.question = `$A$ et $B$ sont des événements indépendants.<br>
   On sait que $P(A)=${texNombre(a, 1)}$ et $P(B)=${texNombre(b, 1)}$.`

        this.correction = ` Comme $A$ et $B$ sont des événements indépendants,  $P(A\\cap B)=P(A)\\times  P(B)$.<br>
    Ainsi, <br>
    $\\begin{aligned}
    P(A\\cap B)&=${texNombre(a, 1)} \\times ${texNombre(b, 1)}\\\\
    P(A\\cap B)&=${miseEnEvidence(this.reponse)}
    \\end{aligned}$`

        this.canReponseACompleter = '$P(A\\cap B)=\\ldots$'
        if (!this.interactif) {
          this.question += '<br>Calculer $P(A\\cap B)$.'
        } else {
          this.question += '<br>$P(A\\cap B)=$'
        }
        break

      case 2:
        this.reponse = texNombre(b, 1)
        this.question = `$A$ et $B$ sont des événements indépendants.<br>
    On sait que $P(A)=${texNombre(a, 1)}$ et $P(A\\cap B)=${texNombre(pAinterB, 2)}$.`

        this.correction = ` Comme $A$ et $B$ sont des événements indépendants,  $P(A\\cap B)=P(A)\\times  P(B)$.<br>
    On cherche donc $P(B)$ tel que $${texNombre(a, 1)}\\times P(B)=${texNombre(pAinterB, 2)}$.<br>
    Comme $${texNombre(a, 1)}\\times ${texNombre(b, 1)}=${texNombre(pAinterB, 2)}$, on en déduit que $P(B)=${miseEnEvidence(this.reponse)}$.`

        this.canReponseACompleter = '$P(B)=\\ldots$'
        if (!this.interactif) {
          this.question += '<br> Calculer $P(B)$.'
        } else {
          this.question += '<br>$P(B)=$'
        }
        break
    }
  }
}
