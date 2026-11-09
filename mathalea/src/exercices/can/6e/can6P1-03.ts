import { bleuMathalea } from '../../../lib/colors'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer une distance avec une vitesse'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '01/08/2021'

/**
 * @author Jean-claude Lhote

 */
export const uuid = 'b0f1a'

export const refs = {
  'fr-fr': ['can6P1-03', '6P3C-flash2'],
  'fr-ch': ['NR'],
}
export default class QuestionDeVitesse extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.optionsChampTexte = { texteApres: '$\\text{ km}$' }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2, 6) * 20
    const b = this.quotaRandint('b', 1, 6)
    this.reponse = Math.round(a * (b + 0.5))
    this.question = `Une voiture roule à une vitesse constante de $${a}\\text{ km/h}$. <br>
    
    Combien de kilomètres parcourt-elle en $${b}$ h et $30$ min ?`
    this.correction = `La voiture parcourt $${a}\\times ${texNombre(b + 0.5)} = ${miseEnEvidence(this.reponse)}\\text{ km}$.`
    this.correction += texteEnCouleur(
      `<br> Mentalement : <br>
    La voiture roule à une vitesse constante de $${a}\\text{ km/h}$, cela signifie qu'elle parcourt $${a}\\text{ km}$ en $1$ heure.<br>
    En $${b}$ heures, elle parcourt $${a}\\times ${b}=${a * b}\\text{ km}$.<br>
    En $30$ minutes, elle parcourt la moitié de $${a}\\text{ km}$, soit $${a / 2}\\text{ km}$.<br>
    Au total, elle a parcouru $${a * b}+${a / 2} $, soit $${a * (b + 0.5)}\\text{ km}$. `,
      bleuMathalea,
    )

    this.canReponseACompleter = '$\\dots\\text{ km}$'
  }
}
