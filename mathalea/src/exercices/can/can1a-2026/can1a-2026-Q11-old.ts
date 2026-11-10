import { propositionsQcm } from '../../../lib/interactif/qcm'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Déterminer si une égalité est vraie ou fausse'
export const interactifReady = true

export const uuid = 'wfqx1'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q11 extends ExerciceCan {
  enonce(a?: number): void {
    if (a == null) {
      a = randint(2, 9)
    }

    const aCarré = a * a
    const question = `Pour tout réel $h$ non nul, $h=\\dfrac{(${a}+h)^2-${aCarré}}{h}$.<br>`

    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      options: { ordered: true, vertical: !context.isHtml },
      enonce: question,
      propositions: [
        {
          texte: 'Vrai',
          statut: false,
        },
        {
          texte: 'Faux',
          statut: true,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = question + qcm.texte

    this.correction = `$(${a}+h)^2-${aCarré}=${aCarré}+${2 * a}h+h^2-${aCarré}=${2 * a}h+h^2$.<br>
    Ainsi, $\\dfrac{(${a}+h)^2-${aCarré}}{h}=\\dfrac{${2 * a}h+h^2}{h}=\\dfrac{h(${2 * a}+h)}{h}=${2 * a}+h$.<br>
    Donc $\\dfrac{(${a}+h)^2-${aCarré}}{h}\\neq h$ : la réponse est ${texteEnCouleurEtGras('Faux')}.`

    this.canEnonce = question
    this.canReponseACompleter = qcm.texte
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(5)
    else this.enonce()
  }
}
