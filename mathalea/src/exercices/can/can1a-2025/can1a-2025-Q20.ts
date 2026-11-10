import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { sp } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer si des vecteurs ont la même direction'
export const interactifReady = true

export const uuid = '1a170'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['3mQCM-2'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q20 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'qcm'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const xu = this.canOfficielle ? 2 : randint(2, 6)
    const yu = this.canOfficielle ? 3 : randint(2, 7)
    const coeffx = this.canOfficielle ? 2 : randint(2, 6)
    const coeffy = this.canOfficielle ? -coeffx : choice([coeffx, -coeffx])
    const question = `$\\vec{u}\\begin{pmatrix}${xu} \\\\${yu}\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}${xu * coeffx} \\\\ ${yu * coeffy}\\end{pmatrix}$ ont la même direction. <br>`
    this.autoCorrection[0] = {
      options: { ordered: true, radio: true },
      enonce: question,
      propositions: [
        {
          texte: 'Vrai',
          statut: coeffy === coeffx,
        },
        {
          texte: 'Faux',
          statut: coeffy !== coeffx,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)
    this.question = question + qcm.texte
    this.correction =
      qcm.texteCorr +
      `Les vecteurs ont la même direction lorsqu'ils sont colinéaires.<br>
    ${coeffy === -coeffx ? `On a $x_{\\vec{v}}=${coeffx}\\times x_{\\vec{u}}$ mais $y_{\\vec{v}}\\neq ${coeffx}\\times y_{\\vec{u}}$, donc les vecteurs ${texteEnCouleurEtGras("n'ont pas la même direction")}.` : `On a $\\vec{v}=${coeffx}\\times \\vec{u}$, donc les vecteurs ${texteEnCouleurEtGras('ont la même direction')}. `}`

    this.canEnonce = `$\\vec{u}\\begin{pmatrix}${xu} \\\\${yu}\\end{pmatrix}$ et $\\vec{u}\\begin{pmatrix}${xu * coeffx} \\\\ ${yu * coeffy}\\end{pmatrix}$ ont la même direction.`
    this.canReponseACompleter = `Coche la bonne réponse : <br>\\faSquare[regular] Vrai ${sp(2)}\\faSquare[regular] Faux`
  }
}
