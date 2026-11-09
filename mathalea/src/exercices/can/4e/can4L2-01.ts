import { bleuMathalea } from '../../../lib/colors'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { texteEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une expression pour une valeur particulière'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

*/
export const uuid = '12514'

export const refs = {
  'fr-fr': ['can4L2-01'],
  'fr-ch': ['NR'],
}

export default class SubstitutionRelatif extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const a = -this.quotaRandint('a', 2, 6)
    const b = this.quotaRandint('b', 12, 25)
    const c = this.quotaRandint('c', 3, 7)
    this.question = `Calculer $${b}+${c}x$ pour $x=${a}$.`
    this.correction = `$${b}+${c}x=${b}+${c}\\times (${a})=${b}${ecritureAlgebrique(c * a)}=${miseEnEvidence(b + c * a)}$ `
    this.correction += texteEnCouleur(`<br> Mentalement : <br>
       On commence par calculer le produit :  $${c}\\times (${a})$ qui donne $${a * c}$.<br>
       Puis, on calcule  $${b}${ecritureAlgebrique(c * a)}=${b + c * a}$.  `, bleuMathalea)

    this.reponse = b + c * a
  }
}
