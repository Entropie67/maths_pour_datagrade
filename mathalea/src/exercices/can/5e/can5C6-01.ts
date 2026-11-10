import { bleuMathalea } from '../../../lib/colors'
import { miseEnEvidence, texteEnCouleur } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Utiliser une priorité opératoire'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '14b41'

export const refs = {
  'fr-fr': ['can5C6-01', '5N1G-flash1'],
  'fr-ch': ['NR'],
}
export default class PrioriteOperatoire5e extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
this.optionsChampTexte = { texteAvant: '<br>' }
 this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 5, 9)
    const b = 20 - a
    const c = this.quotaRandint('c', 3, 9)
    this.reponse = b + a * c
    this.question = `Calculer $${b} + ${a} \\times ${c}$.`
    this.correction = `$${b} + ${a} \\times ${c}= ${b} + ${a * c} = ${miseEnEvidence(this.reponse)}$<br>`
    this.correction += texteEnCouleur(`Mentalement : <br>
    La multiplication étant prioritaire sur l'addition, on commence par calculer $${a} \\times ${c}=${a * c}$.<br>
    On ajoute ensuite  $${b}$ pour obtenir le résultat : $${a * c}+${b}=${this.reponse}$.`,
              bleuMathalea,)
  }
}
