import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import ExerciceCan from '../../ExerciceCan'
export const titre = ''
export const interactifReady = true

export const uuid = 'e280t'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q20 extends ExerciceCan {
  enonce(cas?: number): void {
    if (cas == null) {
      cas = choice([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    }

    let enonce: string
    let estVrai: boolean
    let explication: string

    switch (cas) {
      case 1: // Cube croissante sur R → VRAI
        enonce =
          'La fonction cube est strictement croissante sur $\\mathbb{R}$.'
        estVrai = true
        explication =
          'La fonction cube $x\\mapsto x^3$ est strictement croissante sur $\\mathbb{R}$.'
        break
      case 2: // Cube décroissante sur ]-∞;0] → FAUX
        enonce =
          'La fonction cube est strictement décroissante sur $]-\\infty\\,;\\,0]$.'
        estVrai = false
        explication =
          "La fonction cube $x\\mapsto x^3$ est strictement croissante sur $\\mathbb{R}$, donc en particulier sur $]-\\infty\\,;\\,0]$. <br>Elle n'est pas décroissante."
        break
      case 3: // Carrée croissante sur R → FAUX
        enonce =
          'La fonction carrée est strictement croissante sur $\\mathbb{R}$.'
        estVrai = false
        explication =
          "La fonction carrée $x\\mapsto x^2$ est strictement décroissante sur $]-\\infty\\,;\\,0]$ et strictement croissante sur $[0\\,;\\,+\\infty[$. <br>Elle n'est donc pas croissante sur $\\mathbb{R}$."
        break
      case 4: // Carrée décroissante sur R → FAUX
        enonce =
          'La fonction carrée est strictement décroissante sur $\\mathbb{R}$.'
        estVrai = false
        explication =
          "La fonction carrée $x\\mapsto x^2$ est strictement décroissante sur $]-\\infty\\,;\\,0]$ et strictement croissante sur $[0\\,;\\,+\\infty[$. <br>Elle n'est donc pas décroissante sur $\\mathbb{R}$."
        break
      case 5: // Carrée croissante sur [0;+∞[ → VRAI
        enonce =
          'La fonction carrée est strictement croissante sur $[0\\,;\\,+\\infty[$.'
        estVrai = true
        explication =
          'La fonction carrée $x\\mapsto x^2$ est strictement croissante sur $[0\\,;\\,+\\infty[$.'
        break
      case 6: // Carrée décroissante sur ]-∞;0] → VRAI
        enonce =
          'La fonction carrée est strictement décroissante sur $]-\\infty\\,;\\,0]$.'
        estVrai = true
        explication =
          'La fonction carrée $x\\mapsto x^2$ est strictement décroissante sur $]-\\infty\\,;\\,0]$.'
        break
      case 7: // Racine carrée croissante sur [0;+∞[ → VRAI
        enonce =
          'La fonction racine carrée est strictement croissante sur $[0\\,;\\,+\\infty[$.'
        estVrai = true
        explication =
          'La fonction racine carrée $x\\mapsto \\sqrt{x}$ est strictement croissante sur $[0\\,;\\,+\\infty[$.'
        break
      case 8: // Inverse décroissante sur ]0;+∞[ → VRAI
        enonce =
          'La fonction inverse est strictement décroissante sur $]0\\,;\\,+\\infty[$.'
        estVrai = true
        explication =
          'La fonction inverse $x\\mapsto \\dfrac{1}{x}$ est strictement décroissante sur $]0\\,;\\,+\\infty[$.'
        break
      case 9: // Inverse croissante sur ]-∞;0[ → FAUX
        enonce =
          'La fonction inverse est strictement croissante sur $]-\\infty\\,;\\,0[$.'
        estVrai = false
        explication =
          'La fonction inverse $x\\mapsto \\dfrac{1}{x}$ est strictement décroissante sur $]-\\infty\\,;\\,0[$.'
        break
      case 10: // Inverse décroissante sur ]-∞;0[ → VRAI
      default:
        enonce =
          'La fonction inverse est strictement décroissante sur $]-\\infty\\,;\\,0[$.'
        estVrai = true
        explication =
          'La fonction inverse $x\\mapsto \\dfrac{1}{x}$ est strictement décroissante sur $]-\\infty\\,;\\,0[$.'
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
    if (this.canOfficielle) this.enonce(1)
    else this.enonce()
  }
}
