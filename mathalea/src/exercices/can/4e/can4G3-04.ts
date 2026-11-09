import ExerciceSimple from '../../ExerciceSimple'

import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre = "Calculer le périmètre d'un carré connaissant son aire"
export const interactifReady = true

export const dateDePublication = '09/12/2025'
/**
 * @author Gilles Mora

 * Date de publication septembre 2021
*/
export const uuid = 'e3aaa'

export const refs = {
  'fr-fr': ['can4G3-04', '2G11-flash3'],
  'fr-ch': [],
}
export default class QuestionsAiresEtPerimetres2 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: '$\\text{cm}$' }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 10)
    const c = a * a
    this.reponse = 4 * a
    this.question = `Déterminer le périmètre d'un carré d'aire $${c}\\text{ cm}^2$. `
    this.correction = `Le côté du carré est : $\\sqrt{${c}}=${a}$.<br>
         Son périmètre est donc : $4\\times ${a}=${miseEnEvidence(4 * a)}\\text{ cm}$.`

    this.canReponseACompleter = '$\\ldots\\text{ cm}$'
    this.listeCanReponsesACompleter.push(this.canReponseACompleter)
  }
}
