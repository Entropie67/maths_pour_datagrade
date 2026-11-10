import { propositionsQcm } from '../../../lib/interactif/qcm'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Comparer deux fractions'
export const interactifReady = true

export const uuid = '884fe'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N6Q19 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatInteractif = 'qcm'
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const num1 = this.canOfficielle ? 42 : randint(4, 25) * 2 + 1
    const num2 = this.canOfficielle ? 306 : randint(151, 169) * 2

    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce: 'Cocher le plus grand nombre : ',
      propositions: [
        {
          texte: `$\\dfrac{${num1}}{10}$`,
          statut: num1 * 10 > num2,
        },
        {
          texte: `$\\dfrac{${num2}}{100}$`,
          statut: num1 * 10 < num2,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = qcm.texte
    this.canEnonce = 'Cocher le plus grand nombre.'
    this.canReponseACompleter = qcm.texte
    this.reponse = num1 // C'est juste pour pas faire planter mathaleaHandleExerciceSimple, cette réponse ne sera pas utilisée.
    this.correction =
      qcm.texteCorr +
      `Comme $\\dfrac{${num1}}{10}=\\dfrac{${num1 * 10}}{100}$ et $\\dfrac{${num1 * 10}}{100}${num1 * 10 > num2 ? '>' : '<'}\\dfrac{${num2}}{100}$, le plus grand nombre est :  ${num1 * 10 > num2 ? `$${miseEnEvidence(`\\dfrac{${num1}}{10}`)}$` : `$${miseEnEvidence(`\\dfrac{${num2}}{100}`)}$`}.`
  }
}
