import { bleuMathalea } from '../../../lib/colors'
import { texteEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un produit d’entiers'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '102f4'

export const refs = {
  'fr-fr': ['can5C1-01', '5N1H-flash1'],
  'fr-ch': ['NR'],
}
export default class ProduitEntiers5e extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const b = this.quotaRandint('b', 5, 9)
    const a = this.quotaRandint('a', 12, 19)
    this.reponse = a * b
    this.question = `Calculer $${a} \\times ${b}$.`
    this.correction = `$${a} \\times ${b}=${miseEnEvidence(a * b)}$`
    this.correction += texteEnCouleur(`<br> Mentalement : <br>
    On décompose le calcul $${a} \\times ${b}$ en  $(10+${a - 10})\\times ${b}=10\\times ${b} +${a - 10}\\times ${b}$.<br>
       Cela donne :  $${10 * b}+${(a - 10) * b}=${this.reponse}$.
      `, bleuMathalea)
  }
}
