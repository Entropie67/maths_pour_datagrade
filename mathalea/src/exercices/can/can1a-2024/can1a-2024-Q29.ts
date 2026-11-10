import { propositionsQcm } from '../../../lib/interactif/qcm'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Augmenter/diminuer avec des pourcentages'
export const interactifReady = true

export const uuid = '29eda'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class EvolutionPourcentages extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.formatInteractif = 'qcm'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const a = this.canOfficielle ? 10 : randint(10, 30)
    const b = this.canOfficielle ? 20 : randint(35, 60)
    const choix = this.canOfficielle ? 1 : randint(1, 2)
    let question

    if (choix === 1) {
      this.correction = `Le coefficient multiplicateur global est le produit des coefficients multiplicateurs.<br>
    Le coefficient multiplicateur associé à une augmentation de $${a}\\,\\%$ est $${texNombre(1 + a / 100, 2)}$ et celui associé à une diminution de 
    $${b}\\,\\%$ est $${texNombre(1 - b / 100, 2)}$.<br> 
    Le coefficient multiplicateur global est $${texNombre(1 + a / 100, 2)}\\times ${texNombre(1 - b / 100, 2)}$ dans un cas ou $${texNombre(1 - b / 100, 2)}\\times ${texNombre(1 + a / 100, 2)}$ dans l'autre cas, ce qui revient strictement au même. 
    <br>
  L'affirmation est donc  ${texteEnCouleurEtGras('Vraie')}.`
      question = `Augmenter un prix de $${a}\\,\\%$ puis le  diminuer de $${b}\\,\\%$ revient à le
    diminuer de $${b}\\,\\%$  puis à l’augmenter $${a}\\,\\%$.`
      this.autoCorrection[0] = {
        options: { ordered: true },
        enonce: question,
        propositions: [
          {
            texte: 'Vrai ',
            statut: true,
          },
          {
            texte: 'Faux',
            statut: false,
          },
        ],
      }
      const qcm = propositionsQcm(this, 0)

      this.question = question + qcm.texte

      this.canEnonce = `Augmenter un prix de $${a}\\,\\%$ puis le  diminuer de $${b}\\,\\%$ revient à le
    diminuer de $${b}\\,\\%$  puis à l’augmenter $${a}\\,\\%$.`
      this.canReponseACompleter =
        '\\faSquare[regular] Vrai <br>\\faSquare[regular] Faux'
    } else {
      question = `Un prix augmente de $${a}\\,\\%$. <br>Pour retrouver son prix initial, il suffit de lui appliquer une baisse  de $${a}\\,\\%$. `
      this.correction = `Une augmentation de $${a}\\,\\%$ n'est pas compensée par une baisse de $${a}\\,\\%$.<br>
  L'affirmation est donc  ${texteEnCouleurEtGras('FAUSSE')}.`

      this.autoCorrection[0] = {
        options: { ordered: true, radio: true },
        enonce: question,
        propositions: [
          {
            texte: 'Vrai ',
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

      this.canEnonce = `Un prix augmente de $${a}\\,\\%$. <br>Pour retrouver son prix initial, il suffit de lui appliquer une baisse  de $${b}\\,\\%$. `
      this.canReponseACompleter =
        '\\faSquare[regular] Vrai <br>\\faSquare[regular] Faux'
    }
  }
}
