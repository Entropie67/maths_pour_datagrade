import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Reconnaître des vecteurs colinéaires'
export const interactifReady = true

export const uuid = 'mvcsh'
/**
 * Question 26 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ26 extends ExerciceCan {
  constructor() {
    super()
    this.formatInteractif = 'qcm'
  }

  nouvelleVersion() {
    this.question =
      'Les vecteurs $\\vec{u}\\begin{pmatrix}2 \\\\-5\\end{pmatrix}$ et $\\vec{v}\\begin{pmatrix}-4 \\\\10\\end{pmatrix}$ sont-ils colinéaires ?<br>'
    this.correction = `$\\vec{v} = -2\\times\\vec{u}$, donc ${texteEnCouleurEtGras('oui')} les vecteurs sont colinéaires.`
    this.autoCorrection[0] = {
      options: { ordered: false },
      enonce: this.question,
      propositions: [
        {
          texte: 'oui',
          statut: true,
        },
        {
          texte: 'non',
          statut: false,
        },
      ],
    }
    this.question += propositionsQcm(this, 0).texte
  }
}
