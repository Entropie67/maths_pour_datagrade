import { defisCalculatriceCassee } from '../../../lib/calculatrice/defisCalculatriceCassee'
import { addCalculator } from '../../../lib/customElements/CalculatorElement'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { choice } from '../../../lib/outils/arrayOutils'
import Exercice from '../../Exercice'

export const uuid = '0aaea'
export const titre = 'Utiliser une calculatrice avec touches cassées'
export const interactifReady = true
export const dateDePublication = '14/02/2026'
export const refs = {
  'fr-fr': ['can6C7-07'],
  'fr-ch': [],
}
/**
 * @author Jean-claude Lhote
 */
export default class CalculatriceCassee extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion(): void {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const défi = choice(
        defisCalculatriceCassee.filter((defi) => defi.niveau === 0),
      )
      const situation = défi.situation()
      const question = `${situation.question}<br>
      
      ${addCalculator(this, i, {
        brokenKeys: situation.listeTouchesCassees,
      })}`
      const reponse = situation.reponse
      const correction = situation.solution
      if (
        this.questionJamaisPosee(i, situation.listeTouchesCassees.join(','))
      ) {
        this.listeQuestions.push(question)
        this.listeCorrections.push(correction)
        handleAnswers(
          this,
          i,
          { reponse: { value: reponse } },
          { formatInteractif: 'my-calculator' },
        )
        i++
      }
      cpt++
    }
  }
}
