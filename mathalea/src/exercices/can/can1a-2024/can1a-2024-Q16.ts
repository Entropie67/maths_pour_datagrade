import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Reconnaitre deux événements indépendants'
export const interactifReady = true

export const uuid = 'd23db'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class PointsCourbe extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'qcm'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let A: number
    let B: number
    let AinterB: number
    if (this.canOfficielle) {
      A = 0.2
      B = 0.9
      AinterB = 0.18
    } else {
      A = randint(2, 4) / 10
      B = randint(5, 9) / 10
      AinterB = choice([A * B, A * B + choice([-0.05, 0.05])])
    }
    const isEqual = texNombre(AinterB, 2) === texNombre(A * B, 2)
    this.correction = `$A$ et $B$ sont indépendants si $P(A\\cap B)=P(A)\\times P(B)$.<br>
    Comme :<br>$\\begin{aligned}
    P(A)\\times P(B)&=${texNombre(A, 2)}\\times ${texNombre(B, 2)}\\\\
    &=${texNombre(A * B, 2)}
    \\end{aligned}$`
    this.correction += isEqual
      ? `<br>On obtient l'égalité  $P(A\\cap B)=P(A)\\times P(B)$.<br>
    Les événements $A$ et $B$ sont donc indépendants.<br> L'affirmation est ${texteEnCouleurEtGras('Vraie')}.`
      : `<br> $P(A\\cap B)\\neq P(A)\\times P(B)$.<br>Les événements $A$ et $B$ ne sont donc pas indépendants.<br>L'affirmation est ${texteEnCouleurEtGras('FAUSSE')}.`
    const question = `$P(A\\cap B)=${texNombre(AinterB, 2)}$<br>$P(A)=${texNombre(A, 2)}${sp(2)};${sp(2)}P(B)=${texNombre(B, 2)}$<br>$A$ et $B$ sont indépendants.<br>`

    this.autoCorrection[0] = {
      options: { ordered: true, radio: true },
      enonce: question,
      propositions: [
        {
          texte: 'Vrai',
          statut: isEqual,
        },
        {
          texte: 'Faux',
          statut: texNombre(AinterB, 2) !== texNombre(A * B, 2),
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = question + qcm.texte

    this.canEnonce = `$P(A\\cap B)=${texNombre(AinterB, 2)}$<br>
    $P(A)=${texNombre(A, 2)}$${sp(2)} ;${sp(2)}$P(B)=${texNombre(B, 2)}$`
    this.canReponseACompleter = `$A$ et $B$ sont indépendants.<br>\\faSquare[regular] Vrai ${sp(2)}\\faSquare[regular] Faux`
  }
}
