import { propositionsQcm } from '../../../lib/interactif/qcm'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Trouver le plus grand nombre'
export const interactifReady = true

export const uuid = '27c10'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class Can2025CM1Q19 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatInteractif = 'qcm'
  }

  nouvelleVersion() {
    const num1 = this.canOfficielle ? 4 : randint(2, 5)
    const num2 = this.canOfficielle ? 8 : randint(8, 59, num1 * 10)

    this.autoCorrection[0] = {
      options: { ordered: true },
      enonce: 'Coche le plus grand nombre : ',
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

    this.question += `${qcm.texte}`
    this.canEnonce = 'Coche le plus grand nombre.'
    this.canReponseACompleter = qcm.texte
    this.reponse = num1 // C'est juste pour pas faire planter mathaleaHandleExerciceSimple, cette réponse ne sera pas utilisée.
    this.correction =
      qcm.texteCorr +
      `Comme $\\dfrac{${num1}}{10}=\\dfrac{${num1 * 10}}{100}$, le plus grand nombre est :  ${num1 * 10 > num2 ? `$${miseEnEvidence(`\\dfrac{${num1}}{10}`)}$` : `$${miseEnEvidence(`\\dfrac{${num2}}{100}`)}$`}.`
  }
}
