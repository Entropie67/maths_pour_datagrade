import ExerciceSimple from '../../ExerciceSimple'

import { miseEnEvidence } from '../../../lib/outils/embellissements'

export const titre = "Calculer l'aire d'un carré connaissant son périmètre"
export const interactifReady = true

export const dateDePublication = '09/12/2025'
/**
 * @author Gilles Mora

 * 
*/
export const uuid = 'a2026'

export const refs = {
  'fr-fr': ['can4G3-03'],
  'fr-ch': [],
}
export default class QuestionsAiresEtPerimetres1 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = {
      texteAvant: '<br>',
      texteApres: '$\\text{cm}^2$',
    }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 10)
    this.reponse = a * a
    this.question = `Quelle est l'aire d'un carré dont le périmètre est $${4 * a}\\text{ cm}$ ? `
    this.correction = `Le côté du carré est : $${4 * a}\\div 4=${a}$ cm.<br>
     Son aire est donc : $${a}\\times ${a}=${miseEnEvidence(a ** 2)}\\text{ cm}^2$.`

    this.canReponseACompleter = '$\\ldots\\text{ cm}^2$'
    this.listeCanReponsesACompleter.push(this.canReponseACompleter)
  }
}
