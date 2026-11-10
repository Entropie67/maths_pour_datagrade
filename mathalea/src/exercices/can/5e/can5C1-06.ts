import { bleuMathalea } from '../../../lib/colors'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer un quotient entier'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

 */
export const uuid = '63dff'

export const refs = {
  'fr-fr': ['can5C1-06', '5N1A-flash2'],
  'fr-ch': [],
}
export default class Division5e extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
this.optionsChampTexte = { texteAvant: '<br>' }
 this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 11, 15)
    const b = this.quotaRandint('b', 3, 6)
    const c = a * b
    this.reponse = a
    this.question = `Calculer $${c} \\div ${b}$.`
    this.correction = //miseEnEvidence(aRemplacer)
      `$${c} \\div ${b}=${miseEnEvidence(a)}$<br>` +
      texteEnCouleur(`Mentalement : <br>
    On décompose $${c}$ en $${b * 10}+${c - 10 * b}=(${b}\\times 10)+(${b}\\times ${(c - 10 * b) / b})=${b}\\times(10+${(c - 10 * b) / b})$.<br>
        Ainsi :
     $${c} \\div ${b}=10+${(c - 10 * b) / b}=${a}$.`,
               bleuMathalea,)
  }
}
