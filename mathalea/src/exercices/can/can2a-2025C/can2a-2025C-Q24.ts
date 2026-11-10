import { propositionsQcm } from '../../../lib/interactif/qcm'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Vérifier si une valeur est solution d'une inéquation"
export const interactifReady = true

export const uuid = 'homxe'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2025CQ24 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number, x0?: number): void {
    if (a == null || b == null || c == null || x0 == null) {
      a = randint(1, 3)
      b = randint(-5, 5, [0])
      c = randint(-5, -2)
      x0 = randint(-4, -2)
    }

    // Inéquation : x² + bx < cx (soit x² + (b-c)x < 0)
    const membreGauche = x0 * x0 + b * x0
    const membreDroit = c * x0
    const estVrai = membreGauche < membreDroit

    const enonce = `$${x0}$ est solution de l'inéquation $x^2${ecritureAlgebriqueSauf1(b)}x < ${c}x$.`

    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce,
      propositions: [
        {
          texte: 'Vrai',
          statut: estVrai,
        },
        {
          texte: 'Faux',
          statut: !estVrai,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = enonce + '<br>' + qcm.texte
    this.correction = `On remplace $x$ par $${x0}$ :<br>
    Membre de gauche : $${ecritureParentheseSiNegatif(x0)}^2${ecritureAlgebriqueSauf1(b)}\\times ${ecritureParentheseSiNegatif(x0)}=${x0 * x0}${ecritureAlgebrique(b * x0)}=${membreGauche}$.<br>
    Membre de droite : $${c === 1 ? '' : c === -1 ? '-' : c}\\times ${ecritureParentheseSiNegatif(x0)}=${membreDroit}$.<br>
    On compare : $${membreGauche}${membreGauche < membreDroit ? '<' : membreGauche === membreDroit ? '=' : '>'}${membreDroit}$, donc $${x0}$ ${estVrai ? 'est bien' : "n'est pas"} solution de l'inéquation.<br>
    La réponse est : ${estVrai ? texteEnCouleurEtGras('Vrai') : texteEnCouleurEtGras('Faux')}.`

    this.canEnonce = enonce
    this.canReponseACompleter =
      '$\\square$ \\textsc{Vrai} \\qquad $\\square$ \\textsc{Faux}'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(1, 1, -3, -2)
    else this.enonce()
  }
}
