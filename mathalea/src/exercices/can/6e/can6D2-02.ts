import { bleuMathalea } from '../../../lib/colors'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { prenoms } from '../../../lib/outils/Personne'
import { formatMinute } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une durée en minutes'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote & Gilles Mora
 */

export const uuid = '05b2e'

export const refs = {
  'fr-fr': ['can6D2-02', '6M4B-flash2'],
  'fr-ch': ['NR'],
}
export default class CalculDureeMinutes extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.optionsChampTexte = { texteAvant: '<br>', texteApres: ' minutes' }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 13, 15)
    const b = a + 1
    const c = this.quotaChoice('c', [10, 20, 30, 40])
    const d = this.quotaRandint('d', 11, 58, [20, 30, 40, 50])
    const { prenom, pronom } = choice(prenoms)
    const pronomMajuscule = prenom.charAt(0).toUpperCase() + prenom.slice(1)
    this.reponse = b * 60 + d - (a * 60 + c)
    this.question = `${prenom} est parti${pronom === 'elle' ? 'e' : ''} à $${a}\\text{~h~}${c}$ de son domicile.<br>
    ${pronomMajuscule} est arrivé${pronom === 'elle' ? 'e' : ''} à $${b}\\text{~h~}${d}$.<br>
    Combien de temps a duré son trajet ?`
    this.correction = `$${b}\\text{~h~}${d}-${a}\\text{~h~}${c}=${miseEnEvidence(this.reponse)}\\text{~min}$${b * 60 + d - (a * 60 + c) >= 60 ? ` (soit $${Math.floor(this.reponse / 60)}\\text{~h~}${formatMinute(this.reponse % 60)}\\text{~min}$` + ')' : ''}`
    this.correction += texteEnCouleur(
      `<br> Mentalement : <br>
      On part de $${a}\\text{~h~}${c}$ et on complète par $${(a + 1) * 60 - (a * 60 + c)}\\text{~min}$ pour arriver
      à $${a + 1}\\text{~h}$. <br>
      Puis on ajoute les $${d}$ minutes pour arriver à $${b}\\text{~h~}${d}$.<br>
      Le résultat est donc donné par $${(a + 1) * 60 - (a * 60 + c)}+${d}=${this.reponse}\\text{~min}$.
          `,
      bleuMathalea,
    )

    this.canReponseACompleter = '$\\ldots$ minutes'
  }
}
