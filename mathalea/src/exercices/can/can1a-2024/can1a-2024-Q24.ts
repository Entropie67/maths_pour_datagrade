import { propositionsQcm } from '../../../lib/interactif/qcm'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver un axe de symétrie'
export const interactifReady = true

export const uuid = '34c25'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class equationAxeSymetrie extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'qcm'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    let axe = randint(-5, 5)
    let x1 = randint(-10, 10, [0, axe])
    let x2 = 2 * axe - x1
    while (x1 === -x2) {
      axe = randint(-5, 5)
      x1 = randint(-10, 10, [0, axe])
      x2 = 2 * axe - x1
    }
    if (this.canOfficielle) {
      x1 = -8
      x2 = 6
      axe = -1
    }
    const question = `Soit $f\\,:\\,x\\longmapsto ${x2 === 0 ? `x(${reduireAxPlusB(1, -x1)})` : `(${reduireAxPlusB(1, -x1)})(${reduireAxPlusB(1, -x2)})`} $<br>
    La représentation graphique $\\mathscr{C}_f$ a pour axe de symétrie la droite d’équation :`
    this.correction = `Les racines de ce polynôme du second degré sont $x_1=${x1}$ et $x_2=${x2}$.<br>
    L'axe de symétrie est donné par la moyenne des racines : $x=\\dfrac{x_1+x_2}{2}$, soit $x=\\dfrac{${x1}+${ecritureParentheseSiNegatif(x2)}}{2}$, c'est-à-dire $${miseEnEvidence(`x=${axe}`)}$.`
    this.autoCorrection[0] = {
      options: { ordered: false },
      enonce: question,
      propositions: [
        {
          texte: `$x=${axe}$`,
          statut: true,
        },
        {
          texte: `$x=${x1}$`,
          statut: false,
        },
        {
          texte: `$x=${-axe}$`,
          statut: false,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = question + qcm.texte

    this.canEnonce = `Soit $f\\,:\\,x\\longmapsto ${x2 === 0 ? `x(${reduireAxPlusB(1, -x1)})` : `(${reduireAxPlusB(1, -x1)})(${reduireAxPlusB(1, -x2)})`} $<br>
    La représentation graphique $\\mathscr{C}_f$ a pour axe de symétrie la droite d’équation :`

    this.canReponseACompleter = `\\faSquare[regular] $x=${axe}$ <br>\\faSquare[regular] $x=${x1}$<br>\\faSquare[regular] $x=${x2}$ `
  }
}
