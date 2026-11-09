import { bleuMathalea } from '../../../lib/colors'
import { texteEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une somme d’entiers'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '5ecdc'

export const refs = {
  'fr-fr': ['can5C1-02', '6N0A-flash1'],
  'fr-ch': [],
}
export default class SommeEntiers5e extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const b = this.quotaRandint('b', 51, 89, [60, 70, 80])
    const a = this.quotaRandint('a', 2, 39, [10, 20, 30]) + 100
    this.reponse = a + b
    this.question = `Calculer $${a} + ${b}$.`
    this.correction = `$${a} + ${b}=${miseEnEvidence(a + b)}$`
    this.correction += texteEnCouleur(`<br> Mentalement : <br>
    On décompose le calcul $${a} + ${b}$ en  $(100+${a - 100})+ ${b}=100+ (\\underbrace{${a - 100} +${b}}_{${a - 100 + b}})$ .<br>
       Cela donne :  $100+${a - 100 + b}=${this.reponse}$.
      `, bleuMathalea)
  }
}
