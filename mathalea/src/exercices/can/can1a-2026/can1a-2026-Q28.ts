import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Donner la bonne formule de probabilités totales'
export const interactifReady = true

export const uuid = 'gii6i'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q25 extends ExerciceCan {
  enonce(cas?: number, lettres?: [string, string]): void {
    if (cas == null || lettres == null) {
      cas = choice([1, 2])
      lettres = choice([
        ['A', 'B'],
        ['C', 'D'],
        ['E', 'F'],
        ['M', 'N'],
      ]) as [string, string]
    }

    const e1 = lettres[0]
    const e2 = lettres[1]

    let enonce: string
    let estVrai: boolean
    let explication: string

    switch (cas) {
      case 1: // Faux : P(B) = P_A(B) + P_Abarre(B)
        enonce = `$${e1}$ et $${e2}$ sont deux événements d'une expérience aléatoire.<br>
        On a : $P(${e2})=P_{${e1}}(${e2})+P_{\\overline{${e1}}}(${e2})$.`
        estVrai = false
        explication = `La formule des probabilités totales est :<br>
        $P(${e2})=P(${e1}\\cap ${e2})+P(\\overline{${e1}}\\cap ${e2})=P(${e1})\\times P_{${e1}}(${e2})+P(\\overline{${e1}})\\times P_{\\overline{${e1}}}(${e2})$.<br>
        La formule proposée est donc fausse : il manque les facteurs $P(${e1})$ et $P(\\overline{${e1}})$.`
        break
      case 2: // Vrai : P(B) = P(A∩B) + P(Abarre∩B)
      default:
        enonce = `$${e1}$ et $${e2}$ sont deux événements d'une expérience aléatoire.<br>
        On a : $P(${e2})=P(${e1}\\cap ${e2})+P(\\overline{${e1}}\\cap ${e2})$.`
        estVrai = true
        explication = `C'est la formule des probabilités totales :<br>
        $P(${e2})=P(${e1}\\cap ${e2})+P(\\overline{${e1}}\\cap ${e2})$.<br>
        En effet, les événements $${e1}$ et $\\overline{${e1}}$ forment une partition de $${e2}$.`
        break
    }

    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      options: { ordered: true, vertical: !context.isHtml },
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
    this.correction = `${explication}<br>La réponse est ${estVrai ? texteEnCouleurEtGras('Vrai') : texteEnCouleurEtGras('Faux')}.`
    this.canEnonce = enonce
    this.canReponseACompleter = 'Entoure la bonne réponse : <br>VRAI / FAUX'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(1, ['A', 'B'])
    else this.enonce()
  }
}
