import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
} from '../../../lib/outils/ecritures'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Identifier une fonction polynôme du second degré'
export const interactifReady = true

export const uuid = 'bl1m5'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q30 extends ExerciceCan {
  enonce(cas?: number, a?: number, b?: number, c?: number): void {
    if (cas == null || a == null || b == null || c == null) {
      cas = choice([1, 2, 3])
      a = randint(1, 9)
      b = randint(1, 9, [a])
      c = randint(1, 9) * choice([-1, 1])
    }

    let enonce: string
    let estVrai: boolean
    let explication: string
    const signe = choice(['-', ''])

    switch (cas) {
      case 1: // -(x²-a)² - b → degré 4, FAUX
        enonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=-(x^2${ecritureAlgebrique(-a)})^2${ecritureAlgebrique(-b)}$.<br>
        $f$ est une fonction polynôme du second degré.`
        estVrai = false
        explication = `En développant $(x^2${ecritureAlgebrique(-a)})^2$, on obtient un terme en $x^4$.<br>
        $f$ est donc une fonction polynôme de degré $4$, pas de degré $2$.`
        break
      case 2: // -(x-a)²+b → degré 2, VRAI
        enonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${signe === '-' ? '-' : ''}(${reduireAxPlusB(1, -a)})^2${ecritureAlgebrique(c)}$.<br>
        $f$ est une fonction polynôme du second degré.`
        estVrai = true
        explication = `En développant ${signe === '-' ? '$-' : '$'}(${reduireAxPlusB(1, -a)})^2$, on obtient un polynôme de degré $2$ (forme canonique).<br>
        $f$ est bien une fonction polynôme du second degré.`
        break
      case 3: // -(x-a)(x-b)+c → degré 2, VRAI
      default:
        enonce = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${signe === '-' ? '-' : ''}(${reduireAxPlusB(1, -a)})(${reduireAxPlusB(1, -b)})${ecritureAlgebrique(c)}$.<br>
        $f$ est une fonction polynôme du second degré.`
        estVrai = true
        explication = `En développant ${signe === '-' ? '$-' : '$'}(${reduireAxPlusB(1, -a)})(${reduireAxPlusB(1, -b)})${ecritureAlgebrique(c)}$, on obtient un polynôme de degré $2$.<br>
        $f$ est bien une fonction polynôme du second degré.`
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
    if (this.canOfficielle) this.enonce(1, 1, 7, 7)
    else this.enonce()
  }
}
