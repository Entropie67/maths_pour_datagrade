import ExerciceSimple from '../../ExerciceSimple'

import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre = "Calculer le côté d'un carré connaissant son périmètre"
export const interactifReady = true

export const dateDePublication = '09/12/2025'
/**
 * @author Gilles Mora

 * Date de publication septembre 2021
*/
export const uuid = '7d407'

export const refs = {
  'fr-fr': ['can4G3-05'],
  'fr-ch': ['10CTGM1D-4', '10LCGM1D-4', '10LSGM1D-4', '11CTGM1F-5', '11LCGM1F-5', '11LSGM1F-5'],
}
export default class QuestionsAiresEtPerimetres3 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: '$\\text{cm}$' }
  }

  nouvelleVersion() {
    const a1 = this.quotaRandint('a1', 5, 20)
    const a = a1 * 4
    this.reponse = a1
    this.question = `Le périmètre d'un carré est $${a}\\text{ cm}$. <br>Quelle est la longueur du côté du carré ? `
    this.correction = `Le côté du carré est : $${a}\\div 4=${miseEnEvidence(a1)}\\text{ cm}$.`

    this.canReponseACompleter = '$\\ldots\\text{ cm}$'
    this.listeCanReponsesACompleter.push(this.canReponseACompleter)
  }
}
