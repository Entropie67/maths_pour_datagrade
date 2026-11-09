import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer un point sur une courbe'
export const interactifReady = true

export const uuid = '5157a'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class PointsCourbe extends ExerciceSimple {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.canOfficielle = false
  }

  nouvelleVersion() {
    // const [aa, bb, cc] = this.canOfficielle ? [5, 'dixièmes', 10] : choice([[randint(2, 50), 'dixièmes', 10], [randint(20, 500), 'centièmes', 100], [randint(200, 5000), 'millièmes', 1000]])
    const a = this.canOfficielle ? -1 : randint(-5, 5, 0)
    const abs = this.canOfficielle ? -2 : randint(-3, 3, 0)
    const ord = this.canOfficielle
      ? 3
      : choice([abs ** 2 + a, abs ** 2 + a + choice([-1, 1])])
    // ça sert à rien c'est un qcm, les réponses sont gérées par les cases à cocher.
    /*
    if (this.canOfficielle) {
      this.reponse = 'Vrai'
    } else {
      this.reponse = ord === abs ** 2 + a ? 'Vrai' : 'Faux'
    }
     */
    this.correction = `Le point $A$ est sur la parabole si son ordonnée est égale à l'image de son abscisse. <br>
    $\\begin{aligned}
        f(${abs})&=${ecritureParentheseSiNegatif(abs)}^2${ecritureAlgebrique(a)}\\\\
        &=${abs ** 2 + a}
        \\end{aligned}$<br>
        ${
          abs ** 2 + a === ord
            ? `Le point $A$ est bien sur la parabole.<br> L'affirmation est ${texteEnCouleurEtGras('Vraie')}`
            : `Puisque $${abs ** 2 + a} \\neq ${ord}$, le point $A$ n'est pas sur la parabole. <br>L'affirmation est ${texteEnCouleurEtGras('FAUSSE')}`
        }`

    this.question = `Affirmation : <br>
    Le point $A(${abs}\\,;\\,${ord})$ appartient à la parabole d'équation $y=${reduirePolynomeDegre3(0, 1, 0, a)}$ `
    const affirmationVraie = ord === abs ** 2 + a
    this.autoCorrection[0] = {
      enonce: this.question,
      propositions: [
        { texte: 'Vrai', statut: affirmationVraie },
        { texte: 'Faux', statut: !affirmationVraie },
      ],
    }
    const monQcm = propositionsQcm(this, 0)
    this.question += monQcm.texte

    this.canEnonce = `Affirmation : <br>
    Le point $A(${abs}\\,;\\,${ord})$ appartient à la parabole d'équation $y=${reduirePolynomeDegre3(0, 1, 0, a)}$ `
    this.canReponseACompleter =
      '\\faSquare[regular] Vrai <br>\\faSquare[regular] Faux'
  }
}
