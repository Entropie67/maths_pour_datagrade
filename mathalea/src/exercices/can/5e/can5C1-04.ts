import { bleuMathalea } from '../../../lib/colors'
import { texteEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une différence'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote & Gilles Mora
 * Créé pendant l'été 2021

 */
export const uuid = '606fd'

export const refs = {
  'fr-fr': ['can5C1-04', '5N2I-flash1'],
  'fr-ch': ['NR'],
}
export default class DifferenceNegative extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 8, 15)
    const b = this.quotaRandint('b', 18, 30)
    this.question = `Calculer $${a}-${b}$.`
    this.correction = `$${a}-${b}=${miseEnEvidence(a - b)}$`
    this.reponse = a - b
    this.correction += texteEnCouleur(`<br> Mentalement : <br>
    On décompose $${b}$ en $${a}+${b - a}$, ce qui donne :<br>
     $${a}-${b}=${a}-${a}-${b - a}=${a - b}$.
       `, bleuMathalea)
  }
}
