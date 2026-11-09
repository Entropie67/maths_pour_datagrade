import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { sp } from '../../../lib/outils/outilString'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  "Donner le nombre de solutions d'une équation du second degré"
export const interactifReady = true

export const uuid = '1172e'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ20 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'qcm'
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const b = this.canOfficielle ? 2 : choice([3, 5, 7])
    const c = this.canOfficielle
      ? new FractionEtendue(b, 4)
      : choice([new FractionEtendue(b, 4), new FractionEtendue(b, 2)])
    const signe = this.canOfficielle ? '-' : choice(['-', '+'])

    this.autoCorrection[0] = {
      options: { ordered: true, radio: true },
      enonce: `L'équation $x^2${signe}\\sqrt{${b}}x+ ${this.canOfficielle ? '\\dfrac{1}{2}' : `${c.texFraction}`}=0$ admet une unique solution.`,
      propositions: [
        {
          texte: 'Vrai',
          statut: c.den === 4,
        },
        {
          texte: 'Faux',
          statut: c.den !== 4,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)
    if (!this.interactif) {
      this.question = 'Vrai ou faux ? '
      this.question += ''
    } else {
      this.question = 'Entoure la bonne réponse. ' + qcm.texte
    }
    this.correction = qcm.texteCorr
    if (this.canOfficielle) {
      this.correction += `On calcule le discriminant $\\Delta=${signe === '-' ? `(${signe}\\sqrt{${b}})^2` : `\\sqrt{${b}}^2`} -4\\times 1\\times \\dfrac{1}{2}
  =${b}-\\dfrac{4}{2}=0$.<br>
  On en déduit que l'équation ${texteEnCouleurEtGras('admet une unique solution')}.`
    } else {
      this.correction += `On calcule le discriminant :<br>
         $\\Delta=${signe === '-' ? `(${signe}\\sqrt{${b}})^2` : `\\sqrt{${b}}^2`} -4\\times 1\\times ${c.texFraction}
         =${b}-\\dfrac{${c.num * 4}}{${c.den}}${c.den === 4 ? '=0' : '\\neq 0'} $.<br>
         On en déduit que l'équation ${texteEnCouleurEtGras(c.den === 4 ? 'admet une unique solution' : "n'admet pas une unique solution")}.`
    }
    this.canEnonce = `L'équation $x^2${signe}\\sqrt{${b}}x+ ${this.canOfficielle ? '\\dfrac{1}{2}' : `${c.texFraction}`}=0$ admet une unique solution.`
    this.canReponseACompleter = `Entoure la bonne réponse :<br>Vrai ${sp(7)} Faux`
  }
}
