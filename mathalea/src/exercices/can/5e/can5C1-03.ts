import { bleuMathalea } from '../../../lib/colors'
import { texteEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une différence d’entiers'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '62e1f'

export const refs = {
  'fr-fr': ['can5C1-03', '6N0A-flash2'],
  'fr-ch': [],
}
export default class DifferenceEntiers5e extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const b = this.quotaRandint('b', 41, 69, [50, 60])
    const a = this.quotaRandint('a', 2, 30) + 100
    this.reponse = a - b
    this.question = `Calculer $${a} - ${b}$.`
    this.correction = `$${a} - ${b}=${miseEnEvidence(a - b)}$`
    this.correction += texteEnCouleur(`<br> Mentalement : <br>
    On décompose le calcul $${a} - ${b}$ en  $(100+${a - 100})- ${b}$.<br>
    On obtient : <br>
    
    $\\begin{aligned}
    \\underbrace{100-${b}}_{${100 - b}}+${a - 100}&=${100 - b}+${a - 100}\\\\
    &=${a - b}
    \\end{aligned}$<br>
       Cela donne :  $${a} - ${b}=${a - b}$.
      `, bleuMathalea)
  }
}
