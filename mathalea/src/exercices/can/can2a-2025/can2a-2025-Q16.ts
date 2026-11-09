import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une somme de fraction (V/F)'
export const interactifReady = true

export const uuid = 'c5503'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class AdditionFractionVF extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'qcm'
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const listeFractionsOUI = [
      [1, 3, 1, 6, 3, 6],
      [1, 2, 1, 4, 3, 4],
      [2, 5, 1, 10, 5, 10],
      [1, 4, 3, 2, 7, 4],
      [3, 5, 1, 10, 7, 10],
    ]
    const fracOUI = choice(listeFractionsOUI)
    const listeFractionsNON = [
      [1, 3, 4, 5, 5, 8],
      [1, 2, 1, 5, 2, 7],
      [2, 3, 4, 10, 6, 13],
      [3, 7, 1, 2, 4, 9],
      [7, 3, 1, 4, 8, 7],
    ]
    const fracNON = choice(listeFractionsNON)
    const choix = this.canOfficielle
      ? [1, 2, 1, 3, 2, 5]
      : choice([fracOUI, fracNON])

    const a = `\\dfrac{${choix[0]}}{${choix[1]}}`
    const b = `\\dfrac{${choix[2]}}{${choix[3]}}`
    const c = `\\dfrac{${choix[4]}}{${choix[5]}}`
    if (this.canOfficielle || choix === fracNON) {
      this.correction = `On n'additionne pas les numérateurs et dénominateurs pour additionner des fractions. <br>
    On les met au même dénominateur et on additionne alors les numérateurs en gardant le dénominateur commun.<br><br>
    $\\dfrac{${choix[0]}}{${choix[1]}}+\\dfrac{${choix[2]}}{${choix[3]}}=\\dfrac{${choix[0]}\\times ${choix[3]}}{${choix[1]}\\times ${choix[3]}}+\\dfrac{${choix[2]}\\times ${choix[1]}}{${choix[3]}\\times ${choix[1]}}=\\dfrac{${choix[0] * choix[3] + choix[2] * choix[1]}}{${choix[1] * choix[3]}}$<br><br>
    Réponse : ${texteEnCouleurEtGras('Faux')}`
    } else {
      this.correction = `En mettant les fractions au même dénominateur, on a bien $${a}+${b}=${c}$.<br>
    Réponse : ${texteEnCouleurEtGras('Vrai')}`
    }

    this.autoCorrection[0] = {
      options: { ordered: true, radio: true },
      enonce: `Vrai ou faux ? <br> $${a}+${b}=${c}$`,
      propositions: [
        {
          texte: 'Vrai',
          statut: choix === fracOUI,
        },
        {
          texte: 'Faux',
          statut: this.canOfficielle || choix === fracNON,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)
    if (!this.interactif) {
      this.question = 'Vrai ou faux ? '
      this.question += `${sp(7)}$${a}$ ${sp(7)} $${b}$`
    } else {
      this.question = 'Entoure la bonne réponse. ' + qcm.texte
    }

    this.canEnonce = `Vrai ou faux ? <br> \\vspace{2mm} $${a}+${b}=${c}$`
    this.canReponseACompleter = `\\faSquare[regular] Vrai ${sp(4)} \\faSquare[regular] Faux`
  }
}
